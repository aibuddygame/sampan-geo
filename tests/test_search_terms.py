"""Source-role and contextual-query regressions, independent of pilot names."""
import json
import pytest

from sampan.intake import FetchedPage
from sampan.topics import analyze_topics
from sampan.search_terms import project_names,is_project_query,qualify_chinese


def page(body,url='https://example.com/'):
    return FetchedPage(url,body.encode())


@pytest.mark.parametrize('name',['Moss Ledger','Harbor Beacon','星海計劃'])
def test_project_card_names_excluded_but_descriptive_capability_remains(name):
    p=page(f'<title>Work</title><a data-cat="Research" href="/projects/a"><h3>{name}</h3><p>Document processing extracts and structures business records for the review team.</p><strong>View project</strong></a><section><h2>Document Processing</h2><p>Our document processing extracts and structures business records for the review team.</p></section>')
    r=analyze_topics([p])
    assert name in project_names([p])
    assert not any(is_project_query(c['label'],{name}) for c in r['topics'])
    assert any(c['label']=='Document Processing' for c in r['topics'])


def test_detail_project_title_and_acronym_not_discovery_names():
    p=page('<title>Moss Ledger</title><h1>Moss Ledger (ML)</h1><p>Moss Ledger provides data analysis and document processing for business teams.</p>','https://example.com/projects/moss')
    assert project_names([p])=={'Moss Ledger'}
    assert not any('Moss Ledger' in c['label'] for c in analyze_topics([p])['topics'])


def test_generic_service_without_project_cues_is_retained():
    p=page('<h1>Data Analysis</h1><p>Our data analysis supports teams in reviewing records and preparing clear business reports.</p>')
    assert not project_names([p])
    assert any(c['label']=='Data Analysis' for c in analyze_topics([p])['topics'])


def test_product_category_card_is_not_a_project():
    p=page('<a data-cat="Supplies" href="/products/a"><h3>Artisan Bread</h3><p>Our artisan bread is prepared fresh for local customers every morning.</p></a>','https://example.com/products')
    assert not project_names([p])
    assert any(c['label']=='Artisan Bread' for c in analyze_topics([p])['topics'])


def test_explicit_current_service_can_resolve_a_name_collision():
    p=page('<h1>Data Analysis</h1><script type="application/ld+json">'+json.dumps({'@type':'Service','name':'Data Analysis'})+'</script><p>Our data analysis supports teams in reviewing records and preparing clear business reports.</p>','https://example.com/projects/data')
    assert not project_names([p])


def test_project_role_filter_also_applies_to_model_suggestions():
    p=page('<a class="project-card"><h3>Moss Ledger</h3><p>Moss Ledger extracts business records for structured review and reliable information processing.</p></a>')
    suggestion={'keyword':'Moss Ledger','search_queries':['Moss Ledger'],'evidence':[{'source_url':p.url,'quote':'Moss Ledger extracts business records for structured review and reliable information processing.'}],'reason':'A named project should not be offered as a discovery query.','intent':'project'}
    assert analyze_topics([p],suggestions=[suggestion])['topics']==[]


ZH='''<html lang="zh-HK"><head><title>文件 AI 工具</title></head><body><h1>文件處理</h1>
<section><h2>掃描</h2><p>掃描會擷取企業文件資料，輸出整理後的結果供業務團隊檢查及覆核。</p></section>
<section><h2>分類</h2><p>分類會按照業務規則整理企業文件，輸出可供團隊檢查的資料並保留來源。</p></section></body></html>'''


def test_short_chinese_query_qualified_with_source_context_and_literal_evidence():
    p=page(ZH);r=analyze_topics([p])
    c=next(c for c in r['topics'] if c['label']=='文件掃描')
    assert c['query_construction']['base_phrase']=='掃描'
    assert c['query_construction']['text']=='文件'
    assert c['query_construction']['source_url']==p.url
    assert c['evidence'] in ZH and '文件掃描' not in ZH
    assert c['query_ideas']==['文件掃描']
    assert c['matching_method']=='context-qualified source subject'
    assert c['seo_checks'][0]['points']<2  # no invented full-query exact match
    assert any(c['label']=='文件分類' for c in r['topics'])


def test_no_context_means_omit_ambiguous_short_label_not_invent_industry():
    p=page('<h1>掃描</h1><p>掃描會擷取企業資料，輸出整理後的結果供業務團隊檢查及覆核。</p>')
    assert qualify_chinese('掃描',p)==(None,None)
    assert not analyze_topics([p])['topics']


def test_qualifier_cannot_leak_between_independent_source_pages():
    a=page(ZH)
    b=page('<title>物流工具</title><h1>配送服務</h1><h2>分類</h2><p>分類會按照運輸規則整理各種貨物，供物流團隊檢查及安排運送。</p>','https://example.com/other')
    r=analyze_topics([a,b])
    assert not any(c['source_url']==b.url and c['label']=='文件分類' for c in r['topics'])


def test_already_specific_query_is_not_prefixed_again():
    p=page(ZH)
    assert qualify_chinese('文件掃描',p)==('文件掃描',None)


def test_contextual_and_literal_variants_do_not_duplicate_labels():
    p=page(ZH.replace('</body>','<h2>文件掃描</h2><p>文件掃描會擷取業務資料並輸出結果供企業團隊檢查。</p></body>'))
    labels=[c['label'] for c in analyze_topics([p])['topics']]
    assert len(labels)==len(set(labels))


def test_repeated_page_subject_wins_over_accidental_brand_prefix():
    p=page('<title>文件庫玩法指南</title><h1>文件庫玩法指南</h1><h2>文件庫掃描方式</h2><h2>文件庫分類方式</h2><h2>文件品牌的故事</h2><h2>掃描</h2><p>掃描會擷取企業資料，輸出整理後的結果供業務團隊檢查及覆核。</p>')
    label,record=qualify_chinese('掃描',p)
    assert label=='文件庫掃描' and record['text']=='文件庫'


def test_project_title_fragment_does_not_reappear_as_query():
    names={'Harbor Intelligent Agent Ecosystem'}
    assert is_project_query('Harbor Intelligent Agent',names)
    assert not is_project_query('Agent Consulting',names)


def test_paper_title_fragments_are_not_service_keywords():
    p=page('<article class="paper-panel"><h3>Learning Multi Hop Evidence in Rich Documents</h3><p>This research studies document evidence and compact models for reasoning.</p></article><h2>Document Processing</h2><p>Our document processing structures business records for review by the customer team.</p>')
    labels=[c['label'] for c in analyze_topics([p])['topics']]
    assert 'Learning Multi Hop' not in labels and 'Hop Evidence' not in labels
    assert 'Document Processing' in labels
