"""Independent synthetic regressions for L021; no live-site assertions."""
import hashlib
import re

from fastapi.testclient import TestClient
import pytest

from sampan.intake import FetchedPage
from sampan.language import language_profile
from sampan.topics import analyze_topics, heading_subjects, explicitly_denies, positive_claims
from sampan.rendering import content_profile
from sampan.scoring import score_page
from sampan.scoring_app import create_scoring_app


def page(body,url='https://example.com/'):
    return FetchedPage(url,body.encode())


def card(body,label='文件處理'):
    return next(c for c in analyze_topics([page(body)])['topics'] if c['label']==label)


BODY='''<title>文件處理 | 海港工具</title><header><a href="/">海港工具</a></header>
<section id="purpose"><h2>文件處理如何計算？</h2>
<p>文件處理服務收集企業資料，擷取表格並輸出結果供用戶檢查，不提供第三方認證服務。</p></section>
<section><h2>網站流量統計</h2><p>網站流量統計使用 Cookie 分析訪客頁面，與提供給用戶的文件處理服務分開。</p></section>
<section><h2>官方資料來源</h2><p>官方資料來源只用於核對文件，與本工具的提供者無隸屬關係。</p></section>'''


def test_question_heading_yields_observed_subject_and_filters_disclosures_and_brand():
    r=analyze_topics([page(BODY)])
    labels=[c['label'] for c in r['topics']]
    assert '文件處理' in labels
    assert not any('海港工具' in c or '流量' in c or '來源' in c for c in labels)
    c=next(c for c in r['topics'] if c['label']=='文件處理')
    assert c['evidence'] in BODY and 'Cookie' not in c['evidence']
    assert c['content_sha256']==hashlib.sha256(BODY.encode()).hexdigest()
    assert heading_subjects('如何使用 AI？')==['使用 AI']


@pytest.mark.parametrize('value',['遠離沉迷・支援資訊','文件處理 · AI 工具'])
def test_punctuation_does_not_override_chinese_language(value):
    assert language_profile(value,'zh-HK')['language'] in {'zh','mixed'}


def test_actual_japanese_still_identified():
    assert language_profile('これはテストです','ja')['language']=='other'


@pytest.mark.parametrize('value',[
    '我們提供文件處理服務，不提供認證服務。',
    '我們提供文件處理服務。並非第三方認證服務。',
    'We provide document processing. We do not offer certification services.'
])
def test_claim_level_negation_preserves_positive_offer_and_excludes_denied_capability(value):
    assert not explicitly_denies(value)
    claims=positive_claims(value)
    assert claims and not any('不提供' in c or 'do not offer' in c or '並非' in c for c in claims)


def test_denied_capability_cannot_be_scored_as_a_positive_topic():
    body='<h1>文件處理</h1><p>我們提供文件處理服務，不提供認證服務。</p><h2>認證服務</h2><p>我們不提供認證服務，請向其他供應商查詢。</p>'
    assert not any(c['label']=='認證服務' for c in analyze_topics([page(body)])['topics'])


def test_title_does_not_borrow_analytics_or_unrelated_detail():
    base='<title>Document Processing | Demo</title><h1>Document Processing</h1><p>Document processing extracts business records for review by the user.</p>'
    before=analyze_topics([page(base)])
    after=analyze_topics([page(base+'<section><h2>Website analytics</h2><p>Input output security deployment scope methodology '+('unrelated analytics '*60)+'</p></section>')])
    a=next(c for c in before['topics'] if c['label']=='Document Processing')
    b=next(c for c in after['topics'] if c['label']=='Document Processing')
    assert (a['seo'],a['geo'],a['evidence'])==(b['seo'],b['geo'],b['evidence'])


def test_punctuation_does_not_create_provider_association():
    p='<h1>文件處理</h1><p>我們提供文件處理服務，擷取企業資料並輸出結果供用戶檢查。</p>'
    a=card('<title>文件處理</title>'+p)
    b=card('<title>文件處理 | Demo</title>'+p)
    assert a['geo_checks'][1]['points']==b['geo_checks'][1]['points']


def test_unrelated_external_link_does_not_earn_support_credit():
    base='<section><h2>文件處理</h2><p>我們提供文件處理服務，擷取企業資料並輸出結果供用戶檢查。</p>{}</section>'
    a=card(base.format(''));b=card(base.format('<a href="https://elsewhere.test/">Garden supplies</a>'))
    assert a['geo_checks'][3]['points']==b['geo_checks'][3]['points']==0
    c=card(base.format('<a href="https://elsewhere.test/">文件處理原始研究</a>'))
    assert c['geo_checks'][3]['points']==1  # unverified relevance cannot earn full support


def test_explicitly_disclaimed_third_party_is_not_a_discovery_keyword():
    p=page('<h1>文件處理</h1><p>我們提供文件處理服務，擷取企業資料並輸出結果供用戶檢查。</p><h2>ABC Document Authority</h2><p>本網站是獨立工具，並非 ABC 官方服務，與其無隸屬關係。</p>')
    assert not any('ABC' in c['label'] for c in analyze_topics([p])['topics'])


def test_app_shell_detected_even_with_readable_fallback():
    p=page('<script src="/app.js"></script><div id="root"></div><div><h1>文件處理</h1><p>'+('文件處理服務提供可讀取的資料作後備。'*12)+'</p></div>')
    assert content_profile(p)['javascript_shell']
    plain=page(p.body.decode().replace('<div id="root"></div>',''))
    assert not content_profile(plain)['javascript_shell']


def test_hreflang_counterpart_sections_share_discovery_slot():
    a=page('<html lang="zh-HK"><head><link rel="alternate" hreflang="en" href="/en"></head><section id="same"><h2>文件處理</h2><p>文件處理服務擷取企業資料並輸出結果供用戶檢查，支援現有工作流程。</p></section></html>')
    b=page('<html lang="en"><head><link rel="alternate" hreflang="zh-HK" href="/"></head><section id="same"><h2>Document Processing</h2><p>Document processing extracts business records and produces structured results for review by the user.</p></section></html>','https://example.com/en')
    r=analyze_topics([a,b]);assert len(r['topics'])==1
    b=page(b.body.decode().replace('rel="alternate"','rel="unrelated"'),b.url)
    assert len(analyze_topics([a,b])['topics'])>=2


def test_link_audit_reuses_exact_observed_destinations_without_whole_site_pass():
    body=b'<h1>Test</h1><a href="/guide">Guide</a><a href="/unknown">Unknown</a>'
    r=score_page('https://example.com/',body,context={'status_code':200},related_pages=[page('<h1>Guide</h1>','https://example.com/guide')])
    c=next(c for c in r['checks'] if c['id']=='seo_link_destinations')
    assert c['status']=='unknown' and '1/2' in c['evidence'] and 'untested' in c['evidence']


def test_reviewed_page_audits_exposed_separately_from_primary():
    app=create_scoring_app()
    class Intake:
        def __init__(self,*args,**kwargs):pass
        async def fetch(self,url):
            return page('<h1>Document Processing</h1><p>Document processing extracts business records for review by the user.</p>'+('<a href="/guide">Guide</a>' if url.rstrip('/')=='https://example.com' else ''),url)
    app.state.intake_factory=Intake
    with TestClient(app) as c:
        token=re.search('nonce="([^"]+)"',c.get('/').text)[1]
        r=c.post('/scan',headers={'x-scan-token':token},json={'url':'https://example.com/','authorized':True,'topic_pages':True}).json()
    assert r['page_audits'][0]['url']=='https://example.com/guide'
    assert r['page_audits'][0]['scores'] and 'not a whole-site' in r['score_scope']


def test_sparse_nonempty_module_mount_also_triggers_capture_review():
    p=page('<script type="module" src="/app.js"></script><div id="root"><h1>文件處理</h1><p>'+('資料擷取服務供業務用戶使用。'*12)+'</p></div>')
    assert content_profile(p)['javascript_shell']


def test_negative_answer_question_does_not_become_offered_topic():
    p=page('<section><h2>AI Forecasting 準確嗎？</h2><p>No. This tool cannot forecast random events and does not offer predictions.</p></section>')
    assert not analyze_topics([p])['topics']


def test_analytics_consulting_is_a_legitimate_offering_not_a_disclosure():
    p=page('<title>Analytics Consulting</title><h1>Analytics Consulting</h1><p>Our analytics consulting helps businesses assess reporting workflows and improve the quality of operational data.</p>')
    assert any(c['label']=='Analytics Consulting' for c in analyze_topics([p])['topics'])
