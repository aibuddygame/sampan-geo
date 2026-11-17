import re
from datetime import datetime, timezone

import httpx
import pytest
from fastapi.testclient import TestClient

from sampan.intake import CollectionPermission, CrawlLimits, FetchedPage, IntakeBlocked, SafeIntake
from sampan.scoring import score_page
from sampan.scoring_app import create_scoring_app

GOOD = b'''<html><head><title>Example services</title><meta name="description" content="Example engineering services"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://example.com/"><script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Example","url":"https://example.com/"}</script></head><body><h1>Example</h1><h2>Services</h2><a href="/services">Services</a><img src="logo.png" alt="Example logo"><p>''' + b"Useful business information " * 30 + b'</p><p>Our engineering process starts with a review and a clearly scoped delivery plan.</p><ul><li>Engineering review</li></ul><a href="/contact">Contact</a><a href="/about">About</a></body></html>'


def test_changes_improve_scores_and_repeated_content_is_stable():
    context = {'status_code':200,'x_robots_tag':'','robots_permitted':True}
    before = score_page('https://example.com/', b'<html><body><h1>Example</h1></body></html>', context=context)
    after = score_page('https://example.com/', GOOD, context=context)
    for group in ('seo', 'geo'):
        assert after['scores'][group]['score'] is not None
        assert before['scores'][group]['score'] is None or after['scores'][group]['score'] > before['scores'][group]['score']
    again = score_page('https://example.com/', GOOD, context=context)
    assert again['scores'] == after['scores']
    assert again['content_sha256'] == after['content_sha256']
    assert next(c for c in before['checks'] if c['id']=='geo_readable')['status'] == 'fail'


def test_unknown_alt_noindex_and_invalid_json_are_not_hidden():
    body = GOOD.replace(b'alt="Example logo"', b'alt=""').replace(b'</head>', b'<meta name="robots" content="NOINDEX"><script type="application/ld+json">invalid</script></head>')
    result = score_page('https://example.com/', body)
    checks = {c['id']: c for c in result['checks']}
    assert checks['seo_alt']['status'] == 'unknown'
    assert checks['seo_index_meta']['status'] == 'fail'
    assert checks['geo_jsonld']['status'] == 'fail'
    assert result['scores']['seo']['tested'] < result['scores']['seo']['total']


def token(client):
    page = client.get('/')
    assert page.status_code == 200
    assert 'no-store' in page.headers['cache-control']
    return re.search('nonce="([^"]+)"', page.text)[1]


def test_local_route_security_and_permission_gate():
    app = create_scoring_app()
    def unexpected(*args, **kwargs):
        pytest.fail('Network intake should not be created')
    app.state.intake_factory = unexpected
    with TestClient(app) as client:
        headers = {'x-scan-token': token(client)}
        payload = {'url': 'https://example.com/', 'authorized': True}
        assert client.post('/scan', json=payload).status_code == 403
        assert client.post('/scan', json={**payload, 'authorized': False}, headers=headers).status_code == 400
        for url in ['http://example.com/', 'https://user:password@example.com/', 'https://example.com:8080/']:
            assert client.post('/scan', json={**payload, 'url': url}, headers=headers).status_code == 422
        assert client.get('/', headers={'host': 'evil.example'}).status_code == 400


def test_api_scores_and_blocked_scan_returns_no_fabricated_score():
    app = create_scoring_app()
    class FakeIntake:
        def __init__(self, *args, **kwargs):
            assert kwargs['host'] == 'example.com'
        async def fetch(self, url):
            return FetchedPage(url, GOOD)
    app.state.intake_factory = FakeIntake
    with TestClient(app) as client:
        headers = {'x-scan-token': token(client)}
        response = client.post('/scan', json={'url': 'https://example.com/', 'authorized': True}, headers=headers)
        assert response.status_code == 200
        assert response.json()['scores']['geo']['score'] is not None
        assert response.json()['source_mode'] == 'live page'
        class Blocked(FakeIntake):
            async def fetch(self, url):
                raise IntakeBlocked('robots disallows URL')
        app.state.intake_factory = Blocked
        response = client.post('/scan', json={'url': 'https://example.com/', 'authorized': True}, headers=headers)
        assert response.status_code == 422
        assert 'scores' not in response.json()


@pytest.mark.parametrize('private', [False, True])
def test_new_host_retains_ip_pinning_and_private_dns_block(private):
    requests = []
    async def resolver(host):
        assert host == 'example.com'
        return ['127.0.0.1' if private else '8.8.8.8']
    async def transport(request):
        requests.append(request)
        assert request.url.host == '8.8.8.8'
        assert request.headers['host'] == 'example.com'
        assert request.extensions['sni_hostname'] == 'example.com'
        if request.url.path == '/robots.txt':
            return httpx.Response(200, headers={'content-type': 'text/plain'}, stream=httpx.ByteStream(b'User-agent: *\nDisallow:\n'))
        return httpx.Response(302, headers={'location': 'https://other.example/'}, stream=httpx.ByteStream(b''))
    permission = CollectionPermission(reviewer='Synthetic test', reviewed_at=datetime.now(timezone.utc), reference='Test fixture only', collection_allowed=True, terms_reviewed=True)
    async def run():
        intake = SafeIntake(permission, CrawlLimits(), host='example.com', resolver=resolver, transport=httpx.MockTransport(transport))
        with pytest.raises(IntakeBlocked):
            await intake.fetch('https://example.com/')
    import asyncio
    asyncio.run(run())
    assert len(requests) == (0 if private else 2)


def test_untrusted_malformed_links_and_jsonld_types_do_not_crash():
    body = b'''<html><head><title>Invisible company</title><link rel="canonical" href="https://[broken"><script type="application/ld+json">[{"@type":123},{"@type":"Organization","name":"Invisible company","url":"https://[bad"}]</script></head><body><a href="https://[bad">link</a></body></html>'''
    result = score_page('https://example.com/', body)
    checks = {c['id']: c for c in result['checks']}
    assert checks['seo_canonical_format']['status'] == 'fail'
    assert checks['geo_identity']['status'] == 'pass'
    assert checks['geo_org_url']['status'] == 'fail'
    assert checks['geo_consistent_name']['status'] == 'unknown'


def test_weighted_catalog_has_separate_scores_and_exact_budgets():
    from sampan.scoring import RUBRIC_VERSION
    result = score_page('https://example.com/', GOOD, context={'status_code': 200, 'x_robots_tag': '', 'robots_permitted': True})
    assert len(result['checks']) == 55
    assert len({c['id'] for c in result['checks']}) == 55
    assert result['rubric_version'] == RUBRIC_VERSION == 'verified-page-0.6'
    for group in ('seo', 'geo'):
        subset = [c for c in result['checks'] if c['group'] == group]
        assert sum(c['weight'] for c in subset) == pytest.approx(10)
        summary = result['scores'][group]
        tested = [c for c in subset if c['status'] in {'pass', 'partial', 'fail'}]
        assert summary['evaluated_weight'] == pytest.approx(sum(c['weight'] for c in tested))
        assert summary['score'] == round(10 * sum(c['earned'] for c in tested) / summary['applicable_weight'],1)
        assert all(c['evidence'] and c['why'] and c['recommendation'] and c['source_url'] for c in subset)
    assert any(c['status'] == 'unknown' and 'performance' in c['id'] for c in result['checks'])


def test_verified_credit_and_unresolved_range_do_not_imply_failure():
    from sampan.scoring import summarize
    rows = [dict(group='seo', category='Example', weight=10, status='partial', earned=5),
            dict(group='seo', category='Example', weight=90, status='unknown', earned=None)]
    low = summarize(rows, 'seo')
    assert low['score'] == .5 and low['coverage'] == 10
    assert low['score_ceiling'] == 9.5 and low['observed_score'] == 5
    assert low['unresolved_weight'] == 90 and low['known_gap_weight'] == 5
    assert rows[1]['status'] == 'unknown'
    rows[1].update(status='pass', earned=90)
    high = summarize(rows, 'seo')
    assert high['score'] == 9.5 and high['coverage'] == 100
    rows[1].update(status='na', earned=None)
    assert summarize(rows, 'seo')['score'] == 5


def test_indexing_header_failure_is_prioritized_and_missing_data_stays_unknown():
    result = score_page('https://example.com/', GOOD, context={'status_code':200, 'x_robots_tag':'noindex', 'robots_permitted':True})
    checks = {c['id']: c for c in result['checks']}
    assert checks['seo_index_header']['status'] == 'fail'
    assert checks['geo_snippets']['status'] == 'fail'
    assert result['top_issues'][0]['id'] == 'seo_index_header'
    offline = score_page('https://example.com/', GOOD)
    checks = {c['id']: c for c in offline['checks']}
    assert checks['seo_http']['status'] == 'unknown'
    assert checks['seo_robots']['status'] == 'unknown'
    assert checks['geo_ai_policies']['status'] == 'unknown'
    assert offline['source_mode'] == 'owner-supplied HTML'


def test_saved_html_mode_never_fetches_and_is_permission_gated():
    app = create_scoring_app()
    def unexpected(*args, **kwargs):
        pytest.fail('Saved HTML mode must never create a network intake')
    app.state.intake_factory = unexpected
    with TestClient(app) as client:
        headers = {'x-scan-token': token(client)}
        payload = dict(url='https://example.com/', authorized=True, html=GOOD.decode())
        assert client.post('/analyze-html', json=payload).status_code == 403
        assert client.post('/analyze-html', json={**payload,'authorized':False}, headers=headers).status_code == 400
        response = client.post('/analyze-html', json=payload, headers=headers)
        assert response.status_code == 200
        assert response.json()['source_mode'] == 'owner-supplied HTML'
        assert len(response.json()['checks']) == 55
        large = {**payload, 'html':'字' * 400_000}
        assert client.post('/analyze-html', json=large, headers=headers).status_code == 413
        assert client.post('/analyze-html', json={**payload,'url':'http://example.com/'}, headers=headers).status_code == 422


def test_schema_syntax_does_not_prove_evidence_or_authorship():
    result = score_page('https://example.com/', GOOD)
    checks = {c['id']:c for c in result['checks']}
    for key in ('geo_sources','geo_authorship','geo_answer_quality','geo_fact_consistency'):
        assert checks[key]['status'] == 'unknown'
    assert checks['geo_jsonld']['status'] == 'pass'
    assert 'llms' not in {c['id'] for c in result['checks']}


def test_agent_scoped_headers_are_reviewed_instead_of_claimed_as_universal_blocks():
    result = score_page('https://example.com/', GOOD, context={'status_code':200,'x_robots_tag':'otherbot: noindex','robots_permitted':True})
    checks = {c['id']:c for c in result['checks']}
    assert checks['seo_index_header']['status'] == 'unknown'
    assert checks['geo_snippets']['status'] == 'unknown'


@pytest.mark.parametrize('branding',['<footer>Example</footer>','<nav><img alt="Example" src="logo.png"></nav>','<footer aria-label="Example"></footer>'])
def test_footer_navigation_and_accessible_logo_branding_is_recognized(branding):
    body=GOOD.replace(b'<h1>Example</h1>',b'<h1>Our services</h1>').replace(b'alt="Example logo"',b'alt="Service diagram"').replace(b'</body>',branding.encode()+b'</body>')
    checks={c['id']:c for c in score_page('https://example.com/',body)['checks']}
    assert checks['geo_consistent_name']['status']=='pass'


def test_optional_structures_and_conventions_do_not_generate_false_failures():
    body=GOOD.replace(b'<h2>Services</h2>',b'<h3>Services</h3>').replace(b'<ul><li>Engineering review</li></ul>',b'').replace(b'</body>',b'<h1>Another section</h1></body>')
    checks={c['id']:c for c in score_page('https://example.com/',body)['checks']}
    for key in ('geo_facts','seo_heading_order','seo_h1_single'):
        assert checks[key]['status']=='unknown' and checks[key]['earned'] is None


def test_relative_canonical_is_valid_and_external_canonical_requires_review():
    relative=GOOD.replace(b'href="https://example.com/"',b'href="/"')
    checks={c['id']:c for c in score_page('https://example.com/',relative)['checks']}
    assert checks['seo_canonical_format']['status']=='pass'
    external=GOOD.replace(b'href="https://example.com/"',b'href="https://publisher.example/"')
    checks={c['id']:c for c in score_page('https://example.com/',external)['checks']}
    assert checks['seo_canonical_format']['status']=='unknown'


def test_business_subtypes_context_mapping_aliases_and_www_are_supported():
    body=GOOD.replace(b'"@context":"https://schema.org"',b'"@context":{"@vocab":"https://schema.org/"}').replace(b'"@type":"Organization"',b'"@type":"https://schema.org/LocalBusiness"').replace(b'"name":"Example"',b'"name":"Example Company Limited","alternateName":"Example"').replace(b'"url":"https://example.com/"',b'"url":"https://www.example.com/"')
    checks={c['id']:c for c in score_page('https://example.com/',body)['checks']}
    for key in ('geo_identity','geo_consistent_name','seo_schema_context','geo_org_url'):
        assert checks[key]['status']=='pass'


def test_article_without_company_and_unmatched_name_are_not_proven_defects():
    body=GOOD.replace(b'"@type":"Organization"',b'"@type":"BlogPosting"')
    checks={c['id']:c for c in score_page('https://example.com/',body)['checks']}
    assert checks['geo_identity']['status']=='unknown'
    assert checks['geo_schema_type']['status']=='pass'
    body=GOOD.replace(b'"name":"Example"',b'"name":"AI"')
    checks={c['id']:c for c in score_page('https://example.com/',body)['checks']}
    assert checks['geo_consistent_name']['status']=='unknown'  # No substring match in unrelated words.


def test_robots_missing_status_is_disclosed_and_real_noindex_still_fails():
    result=score_page('https://example.com/',GOOD,context={'status_code':200,'x_robots_tag':'noindex','robots_permitted':True,'robots_status':'HTTP 404: no robots file'})
    checks={c['id']:c for c in result['checks']}
    assert '404' in checks['seo_robots']['evidence'] and checks['seo_robots']['status']=='pass'
    assert checks['seo_index_header']['status']=='fail'
    assert checks['geo_snippets']['status']=='fail'
    assert result['top_issues'][0]['severity']=='error'


def test_scoring_uses_audit_profile_but_strict_intake_is_separate():
    from sampan.audit_intake import AuditIntake
    assert create_scoring_app().state.intake_factory is AuditIntake
    assert SafeIntake.accept_encoding=='identity'
    assert AuditIntake.accept_encoding=='gzip, deflate'


def test_optional_reviews_are_visible_and_not_prioritized_as_failures():
    result=score_page('https://example.com/',GOOD.replace(b'<ul><li>Engineering review</li></ul>',b''))
    assert any(c['id']=='geo_facts' for c in result['review_items'])
    assert all(c['id']!='geo_facts' for c in result['top_issues'])
    assert result['rubric_version']=='verified-page-0.6'
