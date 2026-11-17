import re

from fastapi.testclient import TestClient

from sampan.intake import FetchedPage, IntakeBlocked
from sampan.scoring_app import create_scoring_app
from sampan.topics import analyze_topics, related_links


def page(body, url='https://example.com/'):
    return FetchedPage(url, body.encode())


def topic_with(report, term):
    return next(c for c in report['topics'] if term.casefold() in c['label'].casefold())


def test_no_default_keywords_from_hidden_boilerplate_or_empty_content():
    p=page('<title>Welcome | Example</title><nav>AI voice synthesis</nav><script>AI ESG reporting</script><p hidden>We offer AI app development for all businesses in the world.</p>')
    assert analyze_topics([p])['topics']==[]
    assert analyze_topics([page('<h1>Welcome</h1><p>Click here to learn more about our company.</p>')])['topics']==[]


def test_evidence_breakdowns_and_version_are_deterministic_and_source_bound():
    p=page('<title>Workflow Integration | Example</title><h1>Workflow Integration</h1><p>We integrate workflow integration tools into business operations with a clearly described review and delivery process.</p>')
    a=analyze_topics([p]);b=analyze_topics([p])
    assert a==b and a['version']=='site-topics-0.7'
    c=topic_with(a,'workflow')
    assert c['source_url']==p.url and c['evidence'] in p.body.decode()
    for group in ('seo','geo'):
        assert len(c[group+'_checks'])==5
        assert c[group]==sum(r['points'] for r in c[group+'_checks'])
        assert all(r['points'] in (0,1,2) and r['evidence'] and r['recommendation'] for r in c[group+'_checks'])
    assert a['demand']=={'status':'not measured','source':None,'search_volume':None,'competition':None}
    assert c['demand_status']=='not measured' and c['selection_method']=='observed site phrases'


def test_improvements_change_specific_signals_without_catalog_values():
    before=page('<h1>Voice Synthesis</h1><section><p>Our voice synthesis creates expressive voices for creative projects and applications.</p></section>')
    after=page('<title>Voice Synthesis | Example</title><h1>Voice Synthesis</h1><section><h2>Voice Synthesis</h2><p>Our voice synthesis creates expressive voices for creative projects and applications.</p><a href="https://research.example/paper">Original paper</a></section>')
    a=topic_with(analyze_topics([before]),'voice')
    b=topic_with(analyze_topics([after]),'voice')
    assert b['seo']>a['seo'] and b['geo']==a['geo']  # punctuation/unrelated links earn no GEO uplift
    assert b['geo_checks'][3]['points']==0
    assert b['geo_checks'][2]['points']==a['geo_checks'][2]['points']


def test_discovery_ignores_cross_host_credentials_queries_assets_and_alias_duplicates():
    html='''<a href="/solutions.html">Solutions</a><a href="/solutions">Solutions</a>
    <a href="https://other.example/projects">Projects</a><a href="//127.0.0.1/projects">AI Voice</a>
    <a href="/projects?delete=true">AI App</a><a href="/portfolio/file.pdf">AI Documents</a>
    <a href="/api/projects">Projects</a><a href="https://user:pass@example.com/projects">Projects</a>'''
    assert related_links('https://example.com/',html.encode())==['https://example.com/solutions.html']


def test_bakery_and_dental_sites_produce_different_content_derived_keywords():
    bakery=page('<title>Artisan Bread | Harbour</title><h1>Artisan Bread</h1><h2>Wedding Cakes</h2><p>Our artisan bread uses slow fermentation and local flour for fresh daily baking.</p><p>Our wedding cakes are baked to order using seasonal ingredients and custom decorations.</p>')
    dental=page('<title>Dental Implants | Smile</title><h1>Dental Implants</h1><h2>Teeth Whitening</h2><p>Our dental implants consultation explains treatment stages and recovery for each patient.</p><p>Teeth whitening treatments include a consultation and aftercare advice for patients.</p>')
    a=analyze_topics([bakery]);b=analyze_topics([dental])
    assert {'Artisan Bread','Wedding Cakes'} <= {c['label'] for c in a['topics']}
    assert {'Dental Implants','Teeth Whitening'} <= {c['label'] for c in b['topics']}
    assert not {c['label'] for c in a['topics']} & {c['label'] for c in b['topics']}
    assert all(not c['label'].startswith('AI ') for c in a['topics']+b['topics'])
    for r,source in [(a,bakery),(b,dental)]:
        assert 0<len(r['topics'])<=9
        for c in r['topics']:
            from sampan.topics import matches,phrase_pattern
            assert matches(phrase_pattern(c['label']),source.body.decode())


def test_brand_exclusion_duplicate_topics_and_source_selection():
    weak=page('<h1>Voice Synthesis</h1><p>Our voice synthesis creates expressive voices for creative projects and applications.</p>')
    focused=page('<title>Voice Synthesis | Example</title><h1>Voice Synthesis</h1><p>Our voice synthesis creates expressive voices for creative projects and applications.</p>', 'https://example.com/voice')
    report=analyze_topics([weak,focused])
    assert topic_with(report,'voice')['source_url']==focused.url
    assert len({c['id'] for c in report['topics']})==len(report['topics'])
    branded=page('<title>Acme Dental | Dental Implants</title><script type="application/ld+json">{"@type":"Organization","name":"Acme Dental"}</script><h1>Dental Implants</h1><p>Acme Dental provides dental implants with consultation and a personalised treatment plan.</p>')
    assert all('Acme' not in c['label'] for c in analyze_topics([branded])['topics'])


def client_token(client):
    return {'x-scan-token':re.search('nonce="([^"]+)"',client.get('/').text)[1]}


def test_linked_scan_is_bounded_and_stops_on_block_retaining_observed_scope():
    app = create_scoring_app(); visits=[]
    class Intake:
        def __init__(self, permission, limits, **kwargs):
            assert limits.max_pages == 8 and limits.max_requests == 24 and limits.run_seconds == 75
        async def fetch(self,url):
            visits.append(url)
            if len(visits)>1:raise IntakeBlocked('robots disallows linked page')
            return page('<p>Our AI voice synthesis creates expressive voices for creative projects and applications.</p><a href="/projects">Projects</a><a href="/services">Services</a>')
    app.state.intake_factory=Intake
    with TestClient(app) as client:
        response=client.post('/scan',headers=client_token(client),json={'url':'https://example.com/','authorized':True,'topic_pages':True})
    assert response.status_code==200
    r=response.json()['topic_assessment']
    assert r['pages_reviewed']==1 and r['collection_notes']==['robots disallows linked page']
    assert len(visits)==2


def test_linked_scan_uses_maximum_eight_pages_and_two_link_levels():
    app=create_scoring_app();visits=[]
    class Intake:
        def __init__(self,*args,**kwargs):pass
        async def fetch(self,url):
            visits.append(url)
            return page('<p>Our AI voice synthesis creates expressive voices for creative projects and applications.</p>'+''.join(f'<a href="/projects/{i}">AI Voice project</a>' for i in range(20)),url)
    app.state.intake_factory=Intake
    with TestClient(app) as client:
        response=client.post('/scan',headers=client_token(client),json={'url':'https://example.com/','authorized':True,'topic_pages':True})
    r=response.json()['topic_assessment']
    assert len(visits)==8 and r['pages_reviewed']==8
    assert 'Eight-page' in r['collection_notes'][0]


def test_single_page_and_saved_html_do_not_follow_links():
    app=create_scoring_app();visits=[]
    class Intake:
        def __init__(self,*args,**kwargs):pass
        async def fetch(self,url):
            visits.append(url)
            return page('<h1>AI Voice</h1><p>Our AI voice synthesis creates expressive voices for creative projects and applications.</p><a href="/projects">Projects</a>')
    app.state.intake_factory=Intake
    with TestClient(app) as client:
        headers=client_token(client)
        live=client.post('/scan',headers=headers,json={'url':'https://example.com/','authorized':True}).json()
        saved=client.post('/analyze-html',headers=headers,json={'url':'https://example.com/','authorized':True,'topic_pages':True,'html':'<h1>AI Voice</h1><p>Our AI voice synthesis creates expressive voices for creative projects and applications.</p>'}).json()
    assert len(visits)==1
    assert live['topic_assessment']['scope']=='one page'
    assert saved['topic_assessment']['scope']=='one owner-supplied HTML file'
    assert saved['topic_assessment']['topics']


def test_specialist_links_precede_generic_projects_and_known_aliases_are_skipped():
    from sampan.topics import discovery_key
    assert discovery_key('https://example.com/index.html#research') == discovery_key('https://example.com/')
    links=related_links('https://example.com/',b'<a href="/project-generic">View project</a><a href="/voice">Cantonese singing voice synthesis project</a><a href="/solutions.html">Solutions</a>')
    assert links==['https://example.com/solutions.html','https://example.com/voice','https://example.com/project-generic']


def test_depth_two_does_not_expand_into_depth_three():
    app=create_scoring_app();visits=[]
    class Intake:
        def __init__(self,*args,**kwargs):pass
        async def fetch(self,url):
            visits.append(url)
            return page(f'<p>Our AI voice synthesis creates expressive voices for creative projects and applications.</p><a href="/projects/{len(visits)}">Projects</a>',url)
    app.state.intake_factory=Intake
    with TestClient(app) as client:
        r=client.post('/scan',headers=client_token(client),json={'url':'https://example.com/','authorized':True,'topic_pages':True})
    assert r.status_code==200 and len(visits)==3


def test_focused_page_keeps_follow_on_detail_without_keyword_repetition():
    p=page('<title>AI voice synthesis | Example</title><h1>AI voice synthesis</h1><p>Our AI voice synthesis creates expressive voices for creative projects and applications.</p><p>Recording and annotation supply the input dataset. '+('The performer records melodic examples at varied tempos and pitches. '*12)+'</p>')
    c=topic_with(analyze_topics([p]),'voice')
    assert c['seo_checks'][2]['points']==2
    assert c['geo_checks'][2]['points']==2


def test_same_url_new_content_changes_suggestions_and_sparse_input_has_no_filler():
    app=create_scoring_app()
    with TestClient(app) as client:
        headers=client_token(client)
        base={'url':'https://example.com/','authorized':True}
        a=client.post('/analyze-html',headers=headers,json={**base,'html':'<h1>Wedding Cakes</h1><p>Our wedding cakes are made to order with seasonal ingredients and careful decoration.</p>'}).json()['topic_assessment']
        b=client.post('/analyze-html',headers=headers,json={**base,'html':'<h1>Dental Implants</h1><p>Our dental implants consultation explains treatment stages and recovery for each patient.</p>'}).json()['topic_assessment']
    assert [c['label'] for c in a['topics']]==['Wedding Cakes']
    assert [c['label'] for c in b['topics']]==['Dental Implants']
    assert a['demand']['search_volume'] is None and b['demand']['search_volume'] is None


def test_maximum_nine_keywords_and_stopwords_do_not_join_unrelated_terms():
    from sampan.topics import extract_candidates
    body='<h1>Bread and Cakes</h1><p>Our fresh bread and cakes are baked every morning using seasonal ingredients.</p>'+''.join(f'<section><h2>Course Topic{chr(65+i)}</h2><p>Course Topic{chr(65+i)} includes practical exercises and guided sessions with a qualified tutor.</p></section>' for i in range(20))
    report=analyze_topics([page(body)])
    assert len(report['topics'])<=9
    assert all('bread cakes' not in c[3] for c in extract_candidates([page(body)]))


def test_labelled_client_names_are_not_service_keywords():
    p=page('<h1>ESG Reporting</h1><p>Our ESG reporting workflow collects business data and produces a traceable report for reviewers.</p><aside><div>Client / Context</div><h3>North Harbour Partners</h3><p>North Harbour Partners commissioned this ESG reporting project for its business teams.</p></aside>')
    cards=analyze_topics([p])['topics']
    assert cards and all('Harbour' not in c['label'] and 'Partners' not in c['label'] for c in cards)
