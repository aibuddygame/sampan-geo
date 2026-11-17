import asyncio
import json
import re
from datetime import datetime,timezone

import httpx
import pytest
from fastapi.testclient import TestClient

from sampan.audit_intake import AuditIntake
from sampan.intake import CollectionPermission,CrawlLimits,FetchedPage,IntakeBlocked
from sampan.kimi import excerpts
from sampan.rendering import RenderedPage,RenderUnavailable,asset_links,asset_url,content_profile,preload
from sampan.scoring_app import create_scoring_app
from sampan.topics import analyze_topics,page_segments

ROLES=['AI Coding Engineer','AI Data Analyst','AI Report Specialist','AI Creative Director','AI Social Media Influencer','AI Customer Service','AI Secretary','AI HR Manager','AI Accountant']
SHELL=b'<html><head><title>Business operations AI at Example</title></head><body><div id="root"></div><script src="/app.js"></script></body></html>'


def cards():
    return ('<title>Our AI Workforce | Example</title><nav><button aria-label="Go to home">Example</button></nav><h1>AI Workforce</h1><section>'+''.join(f'<button><h3>{role}</h3><p>Supports practical customer workflows with human review.</p></button>' for role in ROLES)+'</section><section><h2>Other business</h2><p>Unrelated gardening work must never become evidence for our employee roles.</p></section>').encode()


def test_all_nine_roles_reach_balanced_excerpts_and_local_card_scores():
    page=FetchedPage('https://www.example.com/',cards());prepared,user=excerpts([page])
    headings=[s['text'] for s in prepared[0]['segments'] if s['kind']=='heading']
    assert all(role in headings for role in ROLES)
    result=analyze_topics([page]);assert len(result['topics'])==9
    assert {c['label'] for c in result['topics']}==set(ROLES)
    assert all('gardening' not in c['evidence'] for c in result['topics'])
    assert all(c['seo_checks'][3]['points']<2 for c in result['topics'])
    assert len(user.encode())<=24000


def test_title_only_never_supplies_body_explanation_or_focus_credit():
    page=FetchedPage('https://example.com/',SHELL)
    suggestion={'keyword':'Business operations AI','search_queries':['business operations AI'],'intent':'service','reason':'Title-only evidence is insufficient.','evidence':[{'source_url':page.url,'quote':'Business operations AI at Example'}]}
    assert analyze_topics([page],suggestions=[suggestion])['topics']==[]
    assert content_profile(page)['javascript_shell']


def test_focus_is_bounded_and_separate_sections_do_not_stack_duplicate_content():
    body=b'<title>Workflow Engineering</title><h1>Workflow Engineering</h1><section><h2>Workflow Engineering</h2><p>Our workflow engineering integrates existing business systems with a clear delivery process.</p></section>'
    result=analyze_topics([FetchedPage('https://example.com/',body)])
    for c in result['topics']:
        observation=c['seo_checks'][3]['evidence']
        assert 0<=int(re.search(r'(\d+)%',observation)[1])<=100
        assert all(0<=c[g]<=10 for g in ('seo','geo'))


@pytest.mark.parametrize('url',['https://other.example/app.js','http://example.com/app.js','https://user:pass@example.com/app.js','https://example.com:8080/app.js','https://example.com/app.js?token=abc','file:///private/tmp/app.js','https://127.0.0.1/app.js'])
def test_asset_discovery_cannot_expand_origin_scheme_credentials_or_queries(url):
    assert asset_url('https://example.com/',url) is None


def test_only_literal_same_origin_scripts_and_styles_are_prefetched():
    assert asset_links('https://example.com/',b'<script src="/app.js"></script><link rel="stylesheet" href="/main.css"><img src="/private.png"><script src="https://evil.example/track.js"></script>')==['https://example.com/app.js','https://example.com/main.css']
    assert asset_links('https://example.com/app.js',b'import "./part.js"; fetch("/api/contact");','application/javascript')==['https://example.com/part.js']


def test_asset_fetch_retains_robots_dns_pinning_and_private_dns_block(monkeypatch):
    async def no_wait(_):pass
    monkeypatch.setattr('sampan.intake.asyncio.sleep',no_wait)
    seen=[]
    async def transport(request):
        seen.append(request.url.path)
        assert request.url.host=='8.8.8.8' and request.headers['host']=='example.com'
        body=b'User-agent: *\nDisallow: /blocked.js\n' if request.url.path=='/robots.txt' else b'window.answer=42;'
        kind='text/plain' if request.url.path=='/robots.txt' else 'application/javascript'
        return httpx.Response(200,headers={'content-type':kind},stream=httpx.ByteStream(body))
    permission=CollectionPermission(reviewer='Synthetic test',reviewed_at=datetime.now(timezone.utc),reference='Test fixture only',collection_allowed=True,terms_reviewed=True)
    async def exercise():
        async def public(_):return ['8.8.8.8']
        intake=AuditIntake(permission,CrawlLimits(max_requests=4),host='example.com',resolver=public,transport=httpx.MockTransport(transport))
        kind,body=await intake.fetch_asset('https://example.com/app.js');assert kind=='application/javascript'
        with pytest.raises(IntakeBlocked,match='robots disallows'):await intake.fetch_asset('https://example.com/blocked.js')
        assert seen==['/robots.txt','/app.js']
        async def private(_):return ['127.0.0.1']
        blocked=AuditIntake(permission,host='example.com',resolver=private,transport=httpx.MockTransport(transport))
        with pytest.raises(IntakeBlocked,match='non-public'):await blocked.fetch_asset('https://example.com/app.js')
    asyncio.run(exercise())


def test_asset_limit_has_no_retry_or_browser_side_fetch():
    class Intake:
        def __init__(self):self.calls=[]
        async def fetch_asset(self,url):
            self.calls.append(url)
            return 'application/javascript',b''
    intake=Intake();page=FetchedPage('https://example.com/',(''.join(f'<script src="/{i}.js"></script>' for i in range(14))).encode())
    with pytest.raises(RenderUnavailable,match='asset limit'):asyncio.run(preload(page,intake))
    assert len(intake.calls)==12


def test_app_retains_raw_audit_and_uses_rendered_evidence_without_second_model_call():
    app=create_scoring_app();calls=[]
    class Intake:
        def __init__(self,*a,**k):pass
        async def fetch(self,url):return FetchedPage(url,SHELL)
    async def renderer(page,intake):
        calls.append('render')
        return RenderedPage(page.url,cards(),raw_sha256='rawhash'),{'status':'rendered'}
    class Model:
        async def analyze(self,pages):
            calls.append('model');assert isinstance(pages[0],RenderedPage)
            result=analyze_topics(pages);result['analysis']={'provider':'test'};return result
    app.state.intake_factory=Intake;app.state.renderer=renderer;app.state.kimi=Model()
    with TestClient(app) as client:
        # Fake model has no configuration UI; token is a process-local route capability.
        app.state.kimi.configured=True
        token=re.search('nonce="([^"]+)"',client.get('/').text)[1]
        r=client.post('/scan',headers={'x-scan-token':token},json={'url':'https://example.com/','authorized':True,'render_js':True,'use_kimi':True}).json()
    assert calls==['render','model'] and len(r['topic_assessment']['topics'])==9
    assert r['content_capture']['raw']['body_characters']==0
    assert r['content_capture']['effective']['body_characters']>100
    assert r['rendered_audit']['source_mode']=='offline JavaScript-rendered DOM'
    assert next(c for c in r['checks'] if c['id']=='seo_main_heading')['status']=='fail'
    assert next(c for c in r['rendered_audit']['checks'] if c['id']=='seo_main_heading')['status']=='pass'


@pytest.mark.parametrize('enabled',[False,True])
def test_incomplete_render_does_not_send_title_to_model_or_make_keyword_scores(enabled):
    app=create_scoring_app()
    class Intake:
        def __init__(self,*a,**k):pass
        async def fetch(self,url):return FetchedPage(url,SHELL)
    async def renderer(*args):raise RenderUnavailable('Renderer unavailable in test')
    class Model:
        configured=True
        async def analyze(self,pages):pytest.fail('Metadata-only content must not reach model')
    app.state.intake_factory=Intake;app.state.renderer=renderer;app.state.kimi=Model()
    with TestClient(app) as client:
        token=re.search('nonce="([^"]+)"',client.get('/').text)[1]
        response=client.post('/scan',headers={'x-scan-token':token},json={'url':'https://example.com/','authorized':True,'render_js':enabled,'use_kimi':True})
        r=response.json()
        assert r['topic_assessment']['topics']==[]
        assert r['topic_assessment']['analysis']['status']=='limited_content'
        assert client.post('/analyze-html',headers={'x-scan-token':token},json={'url':'https://example.com/','authorized':True,'render_js':True,'html':'<h1>Offline</h1>'}).status_code==400


def test_live_offline_renderer_blocks_network_and_records_local_navigation():
    # Opt-in integration test executes only preloaded synthetic code, no HTTP traffic.
    import os
    if os.environ.get('SAMPAN_TEST_RENDERER')!='1':pytest.skip('Set SAMPAN_TEST_RENDERER=1 with optional Chromium installed')
    from sampan.rendering import render_offline
    shell=FetchedPage('https://example.com/',b'<div id="root"></div><script src="/app.js"></script>')
    content=cards().decode()
    script='''document.getElementById('root').innerHTML='<p>Public introduction explaining our business and the available services for prospective customers seeking more detailed information.</p><button>Our Services</button><form><button>Services</button></form>';
    document.querySelector('button').onclick=()=>{history.pushState({},'', '/services');document.getElementById('root').innerHTML=CONTENT;Promise.all(['http://127.0.0.1:9999/private','https://evil.example/steal','https://example.com/api/write'].map(url=>fetch(url,{method:'POST',body:'never sent'}).then(()=>false,()=>true))).then(values=>document.body.setAttribute('data-network-blocked',String(values.every(Boolean))));};'''.replace('CONTENT',json.dumps(content))
    page,meta=asyncio.run(render_offline(shell,{'https://example.com/app.js':('application/javascript',script.encode())}))
    assert meta['interactions']==['Our Services'] and page.url=='https://example.com/services'
    assert b'data-network-blocked="true"' in page.body
    assert b'<form' not in page.body and b'<script' not in page.body
    assert len(analyze_topics([page])['topics'])==9
    assert page.raw_sha256==meta['raw_sha256']


def test_offline_navigation_cannot_accept_a_robots_disallowed_destination(monkeypatch):
    from sampan import rendering
    shell=FetchedPage('https://example.com/',SHELL)
    class Policy:
        def permits(self,url):return False
    class Intake:
        def check_deadline(self):pass
        async def policy_for(self,host):return Policy()
    async def prepared(*a):return {'https://example.com/app.js':('application/javascript',b'')}
    async def rendered(*a):return RenderedPage('https://example.com/private',cards()),{'status':'rendered'}
    monkeypatch.setattr(rendering,'installed',lambda:True)
    monkeypatch.setattr(rendering,'preload',prepared);monkeypatch.setattr(rendering,'render_offline',rendered)
    with pytest.raises(RenderUnavailable,match='Robots disallows'):asyncio.run(rendering.render_page(shell,Intake()))


def test_generic_slogans_and_case_brand_fragments_are_not_keywords():
    p=FetchedPage('https://example.com/',b'<h1>Services</h1><section><h2>Proof Through Execution</h2><div><h3>QooApp AI Localization</h3><p>This AI localization project translates business material with human review and delivery support.</p></div></section><section><h2>Execute Faster</h2><p>Execute faster using our practical workflow execution process and delivery support.</p></section><section><h2>Starting Today</h2><p>Starting today our teams can arrange a practical engineering consultation.</p></section>')
    result=analyze_topics([p]);labels=[c['label'] for c in result['topics']]
    assert labels and all(not any(word in label.lower() for word in ('qooapp','through','faster','starting today')) for label in labels)
    assert any('Localization' in label for label in labels)
