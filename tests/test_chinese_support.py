import asyncio
import hashlib
import json
import re

import httpx
import pytest
from fastapi.testclient import TestClient

from sampan.intake import FetchedPage
from sampan.kimi import KimiAnalyzer, KimiUnavailable, MAX_INPUT_BYTES, Suggestion, excerpts, validate_suggestions
from sampan.language import content_units, keyword_valid, language_profile
from sampan.rendering import content_profile
from sampan.scoring import score_page
from sampan.scoring_app import create_scoring_app
from sampan.topics import analyze_topics, explicitly_denies, phrase_pattern, related_links
from sampan.audit_urls import normalize_audit_url
from sampan.intake import IntakeBlocked, normalize_url

TRAD = '''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<title>文件處理自動化 | 海港科技</title></head><body>
<h1>文件處理自動化</h1><section><h2>文件處理自動化</h2>
<p>我們提供文件處理自動化，收集企業文件並擷取資料，整合現有工作流程，輸出可供團隊檢查的結果。</p>
<p>首先評估輸入資料，然後進行安全部署及整合，最後檢查輸出結果。本服務適用於企業文件，可能需要人工覆核。</p>
<a href="/文件處理">了解文件處理自動化</a></section>
<section><h2>AI 客戶服務助理</h2><p>我們提供 AI 客戶服務助理，整合企業知識與常見問題，協助團隊處理查詢並提供可供覆核的回應。</p></section>
<section><h2>雲端系統整合</h2><p>我們提供雲端系統整合，評估現有企業資料，連接業務工具並檢查工作流程，輸出團隊需要的資料。</p></section>
<nav>不相關的導航服務</nav><p hidden>隱藏廣告投放服務並非實際內容。</p>
</body></html>'''
SIMPLIFIED=TRAD.translate(str.maketrans('檔處動們業擷團檢查輸資評估進雲端與問應現', '档处动们业撷团检查输资评估进云端与问应现'))


def page(body=TRAD, url='https://example.com/'):
    return FetchedPage(url,body.encode())


def token(client):
    return {'x-scan-token':re.search('nonce="([^"]+)"',client.get('/').text)[1]}


@pytest.mark.parametrize('body',[TRAD,SIMPLIFIED])
def test_chinese_headings_yield_source_bound_topics_without_spacing(body):
    p=page(body);report=analyze_topics([p])
    assert 3<=len(report['topics'])<=9
    assert report['content_languages'][0]['language'] in {'zh','mixed'}
    for c in report['topics']:
        assert c['evidence'] in body and c['content_sha256']==hashlib.sha256(p.body).hexdigest()
        assert '導航' not in c['label'] and '廣告' not in c['label']
        for group in ('seo','geo'):
            assert 0<=c[group]<=10
            assert c[group]==pytest.approx(sum(x['points'] for x in c[group+'_checks']))
            assert sum(x['maximum'] for x in c[group+'_checks'])==10
        focus=next(x for x in c['seo_checks'] if x['label']=='Content focus')
        assert 0<=int(re.search(r'(\d+)%',focus['evidence'])[1])<=100
    assert report['demand']['search_volume'] is None


def test_short_chinese_description_is_content_but_heading_alone_is_not():
    body='<h1>文件處理</h1><p>我們提供文件處理服務，擷取企業資料並輸出結果。</p>'
    assert analyze_topics([page(body)])['topics']
    assert not analyze_topics([page('<title>文件處理服務</title><h1>文件處理服務</h1>')])['topics']


def test_hybrid_phrase_matching_and_chinese_negation_without_false_negative_need():
    assert re.search(phrase_pattern('AI 客戶服務'), '我們提供AI客戶服務，協助處理查詢。')
    for value in ('我們不提供語音合成服務。','我们不提供语音合成服务。','我們不再支援此服務。'):
        assert explicitly_denies(value)
    assert not explicitly_denies('我們提供文件處理，不需要額外安裝。')
    assert not analyze_topics([page('<h1>語音合成</h1><p>我們不提供語音合成服務，請向其他公司查詢相關產品及支援。</p>')])['topics']


def test_chinese_length_rules_detect_usable_body_and_keep_raw_text():
    p=page('<script src="/app.js"></script><h1>文件處理</h1><p>我們提供文件處理服務，收集企業資料並整合現有工作流程，輸出業務結果供團隊檢查。</p>')
    assert content_profile(p)['usable_content'] and not content_profile(p)['javascript_shell']
    assert content_units('工作流程')==2 and content_units('AI 工作流程')==3
    assert language_profile('我們提供文件處理，整合企業資料與工作流程。')['language']=='zh'
    assert language_profile('我們提供 AI ERP CRM API 整合服務。')['language']=='mixed'
    assert language_profile('これは日本語の文章です。')['language']=='other'


def test_local_keywords_do_not_invent_slices_brand_names_or_nearby_topics():
    body='''<title>文件處理服務 | 海港科技</title><script type="application/ld+json">{"@type":"Organization","name":"海港科技"}</script>
    <h1>海港科技</h1><h2>關於我們</h2><section><h2>文件處理服務</h2><p>我們提供文件處理服務，擷取資料並輸出企業報告。</p></section>
    <section><h2>園藝設計</h2><p>園藝設計適用於住宅花園，按客戶喜好種植花草樹木。</p></section>'''
    cards=analyze_topics([page(body)])['topics']
    assert {c['label'] for c in cards}=={'文件處理服務','園藝設計'}
    assert '園藝' not in next(c for c in cards if c['label']=='文件處理服務')['evidence']


def test_chinese_technical_identity_passages_and_routes():
    body='''<html><head><meta charset="utf-8"><title>企業文件處理服務</title>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"海港科技","description":"我們提供文件處理服務，擷取資料並輸出結果。"}</script></head><body>
    <h1>海港科技提供文件處理服務</h1><p>我們提供文件處理服務，擷取資料並輸出結果。</p>
    <p>我們整合企業現有工作流程，協助團隊檢查輸入及輸出。</p><a href="/聯絡">聯絡我們</a><a href="/公司">關於我們</a></body></html>'''
    checks={c['id']:c for c in score_page('https://example.com/',body.encode())['checks']}
    for name in ('geo_intro','geo_passages','geo_consistent_name','geo_contact','geo_about','geo_description_support','seo_title_length'):
        assert checks[name]['status']=='pass',checks[name]


def test_chinese_links_keep_existing_origin_and_policy_scope():
    links=related_links('https://example.com/', '<a href="/文件處理">文件處理</a><a href="/terms">服務條款</a><a href="https://other.example/">服務</a><a href="/login">登入</a>'.encode())
    assert links==['https://example.com/%E6%96%87%E4%BB%B6%E8%99%95%E7%90%86']


def proposal(p):
    prepared,_=excerpts([p])
    body=next(s for s in prepared[0]['segments'] if s['kind']=='body')
    raw={'keywords':[dict(keyword='企業文件自動化',search_queries=['企業文件自動化服務'],intent='service',reason='根據原文描述的文件擷取與工作流程整合服務。',evidence=[dict(page_id='p0',quote=body['text'])],semantic_matches=[dict(segment_id=body['segment_id'],relation='equivalent',aspects=['explanation','process','detail'])])]}
    return prepared,raw


def test_chinese_semantic_suggestions_keep_exact_source_and_reject_forgery():
    p=page();prepared,raw=proposal(p)
    accepted,discarded=validate_suggestions(raw,prepared,[p]);assert discarded==0
    cards=analyze_topics([p],suggestions=accepted)['topics'];assert cards
    assert cards[0]['label']=='企業文件自動化' and cards[0]['matching_method']=='semantic + literal'
    raw['keywords'][0]['evidence'][0]['quote']='這是一段完全不存在於任何來源頁面的虛構服務說明。'
    with pytest.raises(KimiUnavailable):validate_suggestions(raw,prepared,[p])


def test_chinese_provider_payload_and_cache_are_bounded_without_real_ai_call():
    p=page();_,raw=proposal(p);calls=[]
    async def respond(request):
        calls.append(request);data=json.loads(request.content)
        assert 'Traditional Chinese' in data['messages'][0]['content']
        assert len(data['messages'][1]['content'].encode())<=MAX_INPUT_BYTES
        return httpx.Response(200,json={'choices':[{'message':{'content':json.dumps(raw,ensure_ascii=False)},'finish_reason':'stop'}],'usage':{'prompt_tokens':200,'completion_tokens':100}})
    analyzer=KimiAnalyzer('synthetic-test-key',transport=httpx.MockTransport(respond))
    async def run():
        a=await analyzer.analyze([p]);b=await analyzer.analyze([p])
        assert a['topics'][0]['label']=='企業文件自動化' and b['analysis']['cached']
        assert a['content_languages'][0]['language'] in {'zh','mixed'}
    asyncio.run(run());assert len(calls)==1


def test_keyword_character_limits_reject_markup_emoji_and_keep_traditional_labels():
    assert keyword_valid('AI 文件處理') and keyword_valid('牙科')
    assert not keyword_valid('<script>文件</script>') and not keyword_valid('文件🙂處理')
    assert not keyword_valid('文'*25)
    with pytest.raises(ValueError):Suggestion.model_validate({'keyword':'<script>文件</script>'})


def test_saved_html_round_trip_and_no_network_for_chinese(monkeypatch):
    app=create_scoring_app()
    def forbidden(*args,**kwargs):raise AssertionError('Saved HTML must not create intake')
    app.state.intake_factory=forbidden
    with TestClient(app) as client:
        r=client.post('/analyze-html',headers=token(client),json=dict(url='https://example.com/',authorized=True,html=TRAD))
    assert r.status_code==200
    report=r.json();assert len(report['checks'])==55 and len(report['topic_assessment']['topics'])==3
    assert report['visibility']['google_positions'] is None


def test_eight_chinese_pages_are_sampled_within_actual_utf8_budget():
    pages=[page(TRAD*1,f'https://example.com/{i}') for i in range(8)]
    prepared,encoded=excerpts(pages)
    assert len(prepared)==8 and len(encoded.encode())<=MAX_INPUT_BYTES
    for row in prepared:
        assert any(s['kind']=='body' for s in row['segments'])


@pytest.mark.parametrize('url',[
    'http://example.com/文件','https://user:pass@example.com/文件',
    'https://other.example/文件','https://example.com:8080/文件',
    'https://example.com/文件/%2e%2e/private','https://example.com/文件/%25AA',
    'https://example.com/文件/%ZZ','https://example.com/文件\n',
    'https://example.com/文件\\private','https://例子.com/文件',
    'https://example.com/文件/%0a',
])
def test_unicode_paths_never_relax_origin_and_ambiguous_encoding_guards(url):
    with pytest.raises(IntakeBlocked):normalize_audit_url(url,host='example.com')


def test_unicode_path_normalization_is_idempotent_and_strict_t001_unchanged():
    url=normalize_audit_url('https://example.com/文件處理#說明',host='example.com')
    assert '%E6%96%87' in url and '#' not in url
    assert normalize_audit_url(url,host='example.com')==url
    with pytest.raises(IntakeBlocked):normalize_url('https://example.com/文件處理',host='example.com')


def test_chinese_no_space_description_improvement_changes_only_supported_signals():
    sparse=page('<h1>文件處理服務</h1><p>我們提供文件處理服務，擷取資料並輸出結果。</p>')
    rich=page('<title>文件處理服務 | 海港科技</title><h1>文件處理服務</h1><section><p>我們提供文件處理服務，擷取資料並輸出結果。</p><p>首先評估輸入文件，然後擷取資料並整合企業工作流程，最後檢查輸出並進行安全部署。本服務可能需要人工覆核。</p><a href="/文件">文件處理服務</a></section>')
    a=analyze_topics([sparse])['topics'][0];b=analyze_topics([rich])['topics'][0]
    assert b['seo']>a['seo'] and b['geo']>=a['geo']
    assert b['seo_checks'][4]['points']==2 and a['seo_checks'][4]['points']==0


def test_chinese_quote_must_fit_one_original_segment():
    p=page();prepared,raw=proposal(p)
    first=next(s for s in prepared[0]['segments'] if s['kind']=='body')
    following=prepared[0]['segments'][prepared[0]['segments'].index(first)+1]
    raw['keywords'][0]['evidence'][0]['quote']=first['text'][-10:]+' '+following['text'][:10]
    with pytest.raises(KimiUnavailable):validate_suggestions(raw,prepared,[p])
