import asyncio
import gzip
import zlib
from datetime import datetime, timezone

import httpx
import pytest

from sampan.audit_intake import AuditIntake, AuditPolicy
from sampan.intake import CollectionPermission, CrawlLimits, IntakeBlocked


@pytest.fixture
def harness(monkeypatch):
    # Request pacing itself remains covered by the existing strict transport tests.
    async def no_wait(_): pass
    monkeypatch.setattr('sampan.intake.asyncio.sleep', no_wait)
    def build(handler, *, resolver=None, **bounds):
        seen=[]
        async def dns(host): return ['8.8.8.8']
        async def transport(request):
            seen.append((request.headers['host'],request.url.path))
            assert request.url.host == '8.8.8.8'
            assert request.extensions['sni_hostname'] == request.headers['host']
            return handler(request)
        permission=CollectionPermission(reviewer='Synthetic test',reviewed_at=datetime.now(timezone.utc),reference='Test only',collection_allowed=True,terms_reviewed=True)
        run=AuditIntake(permission,CrawlLimits(**bounds),host='example.com',resolver=resolver or dns,transport=httpx.MockTransport(transport))
        return run,seen
    return build


def response(status=200, body=b'', content_type='text/html', **headers):
    return httpx.Response(status,headers={'content-type':content_type,**headers},stream=httpx.ByteStream(body))


@pytest.mark.parametrize('status',[404,410])
def test_missing_robots_is_not_a_block_or_seo_failure(harness,status):
    run,seen=harness(lambda r:response(status) if r.url.path=='/robots.txt' else response(body=b'<h1>Hello</h1>'))
    page=asyncio.run(run.fetch('https://example.com/'))
    assert page.body==b'<h1>Hello</h1>'
    assert seen==[('example.com','/robots.txt'),('example.com','/')]
    assert str(status) in run.robots_status['example.com']


@pytest.mark.parametrize('status',[401,403,429,500,503])
def test_robots_errors_stop_without_content_fetch_or_retry(harness,status):
    run,seen=harness(lambda r:response(status))
    with pytest.raises(IntakeBlocked):asyncio.run(run.fetch('https://example.com/'))
    assert seen==[('example.com','/robots.txt')]
    with pytest.raises(IntakeBlocked,match='closed'):asyncio.run(run.fetch('https://example.com/'))


@pytest.mark.parametrize('body',[b'<!doctype html><html>Home</html>',b'\x00binary',b'\xff\xfe'])
def test_markup_or_binary_robots_still_requires_review(harness,body):
    run,seen=harness(lambda r:response(body=body,content_type='text/plain'))
    with pytest.raises(IntakeBlocked):asyncio.run(run.fetch('https://example.com/'))
    assert len(seen)==1


def test_www_redirect_uses_target_host_policy_and_tls_name(harness):
    def handler(r):
        if r.url.path=='/robots.txt':return response(body=b'User-agent: *\nDisallow:\n',content_type='text/plain')
        if r.headers['host']=='example.com':return response(301,location='https://www.example.com/')
        return response(body=b'<h1>Canonical host</h1>',**{'x-robots-tag':'noindex'})
    run,seen=harness(handler)
    page=asyncio.run(run.fetch('https://example.com/'))
    assert page.url=='https://www.example.com/' and page.x_robots_tag=='noindex'
    assert seen==[('example.com','/robots.txt'),('example.com','/'),('www.example.com','/robots.txt'),('www.example.com','/')]


def test_www_redirect_cannot_bypass_target_policy(harness):
    def handler(r):
        if r.url.path=='/robots.txt':
            body=b'User-agent: *\nDisallow: /\n' if r.headers['host'].startswith('www.') else b'User-agent: *\nDisallow:\n'
            return response(body=body,content_type='text/plain')
        return response(301,location='https://www.example.com/')
    run,seen=harness(handler)
    with pytest.raises(IntakeBlocked,match='disallows'):asyncio.run(run.fetch('https://example.com/'))
    assert seen[-1]==('www.example.com','/robots.txt') and len(seen)==3


@pytest.mark.parametrize('destination',['https://evil.example/','http://example.com/','https://user:pass@www.example.com/','https://www.example.com:8080/','https://127.0.0.1/'])
def test_redirect_escape_is_rejected_before_target_request(harness,destination):
    def handler(r):
        return response(404) if r.url.path=='/robots.txt' else response(302,location=destination)
    run,seen=harness(handler)
    with pytest.raises(IntakeBlocked):asyncio.run(run.fetch('https://example.com/'))
    assert len(seen)==2


def test_redirect_target_private_dns_is_rejected_before_dial(harness):
    async def dns(host):return ['127.0.0.1'] if host.startswith('www.') else ['8.8.8.8']
    run,seen=harness(lambda r:response(404) if r.url.path=='/robots.txt' else response(301,location='https://www.example.com/'),resolver=dns)
    with pytest.raises(IntakeBlocked,match='non-public'):asyncio.run(run.fetch('https://example.com/'))
    assert len(seen)==2


def test_robots_redirect_and_unknown_extensions_do_not_invent_restrictions(harness):
    def handler(r):
        if r.url.path=='/robots.txt':return response(302,location='/policy.txt')
        if r.url.path=='/policy.txt':return response(body=b'User-agent: *\nHost: example.com\nSome-extension: abc\nDisallow: /private\nAllow: /private/public\n',content_type='text/plain')
        return response(body=b'<h1>Allowed</h1>')
    run,seen=harness(handler)
    assert asyncio.run(run.fetch('https://example.com/private/public')).body==b'<h1>Allowed</h1>'
    assert len(seen)==3


@pytest.mark.parametrize('encoding,encode',[('gzip',gzip.compress),('deflate',zlib.compress)])
def test_supported_compression_is_decoded_and_bounded(harness,encoding,encode):
    html=b'<h1>Compressed page</h1>'
    def handler(r):return response(404) if r.url.path=='/robots.txt' else response(body=encode(html),**{'content-encoding':encoding})
    run,_=harness(handler)
    assert asyncio.run(run.fetch('https://example.com/')).body==html
    assert run.decoded_bytes>=len(html)


def test_gzip_expansion_bomb_is_stopped(harness):
    def handler(r):return response(404) if r.url.path=='/robots.txt' else response(body=gzip.compress(b'x'*5000),**{'content-encoding':'gzip'})
    run,seen=harness(handler,max_response_bytes=2000)
    with pytest.raises(IntakeBlocked,match='decompressed'):asyncio.run(run.fetch('https://example.com/'))
    assert len(seen)==2


@pytest.mark.parametrize('body,encoding',[(b'not gzip','gzip'),(gzip.compress(b'hi')[:-3],'gzip'),(b'br data','br')])
def test_invalid_compression_never_causes_fallback(harness,body,encoding):
    run,seen=harness(lambda r:response(404) if r.url.path=='/robots.txt' else response(body=body,**{'content-encoding':encoding}))
    with pytest.raises(IntakeBlocked):asyncio.run(run.fetch('https://example.com/'))
    assert len(seen)==2


def test_content_redirect_loop_and_request_limits_remain_bounded(harness):
    run,seen=harness(lambda r:response(404) if r.url.path=='/robots.txt' else response(301,location='/'))
    with pytest.raises(IntakeBlocked,match='loop'):asyncio.run(run.fetch('https://example.com/'))
    assert len(seen)==2
    run,seen=harness(lambda r:response(404),max_requests=1)
    with pytest.raises(IntakeBlocked,match='request limit'):asyncio.run(run.fetch('https://example.com/'))
    assert len(seen)==1


def test_robots_group_specificity_longest_rule_and_allow_ties():
    policy=AuditPolicy.parse(b'''User-agent: *
Disallow: /
User-agent: SampanBot
Disallow: /private
Allow: /private/public
Disallow: /tie
Allow: /tie
Crawl-delay: 2
User-agent: SampanBot
Disallow: /other
''')
    assert policy.permits('https://example.com/')
    assert not policy.permits('https://example.com/private/a')
    assert policy.permits('https://example.com/private/public/a')
    assert policy.permits('https://example.com/tie')
    assert not policy.permits('https://example.com/other')
    assert policy.interval==2


def test_robots_wildcards_encoded_octets_and_search_extension():
    policy=AuditPolicy.parse(b'User-agent: *\nDisallow: /secret/*\nAllow: /secret/public$\nDisallow: /caf%C3%A9\n')
    assert policy.permits('https://example.com/secret/public')
    assert not policy.permits('https://example.com/secret/public/more')
    assert not policy.permits('https://example.com/%73ecret/no')
    assert not policy.permits('https://example.com/caf%C3%A9')
    restricted=AuditPolicy.parse(b'User-agent: *\nContent-signal: search=no,ai-train=no\n')
    assert not restricted.permits('https://example.com/')


def test_decoded_total_budget_is_enforced_across_pages(harness):
    def handler(r):
        return response(404) if r.url.path=='/robots.txt' else response(body=gzip.compress(b'x'*1600),**{'content-encoding':'gzip'})
    run,seen=harness(handler,max_total_bytes=2500,max_response_bytes=2000,max_pages=2)
    async def scan():
        await run.fetch('https://example.com/a')
        with pytest.raises(IntakeBlocked,match='decoded run'):await run.fetch('https://example.com/b')
    asyncio.run(scan())
    assert len(seen)==3 and run.bytes_received<2500


def test_cancelled_scan_cannot_be_reused(harness):
    def handler(r):raise asyncio.CancelledError
    run,seen=harness(handler)
    with pytest.raises(asyncio.CancelledError):asyncio.run(run.fetch('https://example.com/'))
    with pytest.raises(IntakeBlocked,match='closed'):asyncio.run(run.fetch('https://example.com/'))
    assert len(seen)==1


def test_robots_redirect_limit_is_bounded(harness):
    run,seen=harness(lambda r:response(302,location=r.url.path+'x'))
    with pytest.raises(IntakeBlocked,match='robots redirect limit'):asyncio.run(run.fetch('https://example.com/'))
    assert len(seen)==4
