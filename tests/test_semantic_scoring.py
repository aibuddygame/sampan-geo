import copy
import pytest

from sampan.intake import FetchedPage
from sampan.kimi import excerpts,validate_suggestions,KimiUnavailable
from sampan.topics import analyze_topics

BODY='''<title>Prototype Production | Example</title><h1>Launch Engineering</h1>
<section><h2>Production Delivery</h2><p>We turn experimental software into reliable products ready for real customers.</p>
<p>First we examine reliability, then synchronize records, and finally release the finished tool. This service covers existing prototypes, and sensitive records stay on your premises.</p>
<a href="/review">Get Your Prototype Reviewed</a></section>
<section><h2>Other work</h2><p>Our separate garden landscaping offering creates outdoor spaces for households and local communities.</p></section>'''
P=FetchedPage('https://example.com/',BODY.encode())
QUOTE='We turn experimental software into reliable products ready for real customers.'


def proposal(relation='equivalent'):
    prepared,_=excerpts([P]);segments=prepared[0]['segments']
    matches=[]
    for s in segments:
        if s['kind']=='body' and 'garden' in s['text']:continue
        matches.append({'segment_id':s['segment_id'],'relation':relation,'aspects':['explanation','process','detail','scope'] if s['kind']=='body' and 'First' in s['text'] else []})
    raw={'keywords':[{'keyword':'AI product scaling','search_queries':['prototype to production'],'intent':'service','reason':'Same production engineering capability, expressed using different wording.','evidence':[{'page_id':'p0','quote':QUOTE}],'semantic_matches':matches}]}
    accepted,_=validate_suggestions(raw,prepared,[P]);return accepted


def test_equivalent_meaning_earns_title_heading_and_link_credit_without_literal_phrase():
    accepted=proposal()
    semantic=analyze_topics([P],suggestions=accepted)['topics'][0]
    literal=analyze_topics([P],suggestions=[{**accepted[0],'semantic_matches':[]}])['topics'][0]
    assert 'AI product scaling' not in BODY
    assert semantic['seo_checks'][0]['points']==2 and literal['seo_checks'][0]['points']==0
    assert semantic['seo_checks'][4]['points']==2 and literal['seo_checks'][4]['points']==0
    assert semantic['seo']>literal['seo'] and semantic['geo']>literal['geo']
    assert semantic['matching_method']=='semantic + literal'
    assert all('garden' not in m['text'] for m in semantic['semantic_matches'])


def test_related_subject_gets_partial_credit_instead_of_equivalence():
    related=analyze_topics([P],suggestions=proposal('related'))['topics'][0]
    equivalent=analyze_topics([P],suggestions=proposal())['topics'][0]
    assert related['seo_checks'][0]['points']==1 and related['seo_checks'][4]['points']==1
    assert related['seo']<equivalent['seo'] and related['geo']<equivalent['geo']
    assert related['geo_checks'][2]['points']<=1


def test_semantic_process_detail_and_scope_need_no_fixed_trigger_words():
    c=analyze_topics([P],suggestions=proposal())['topics'][0]
    assert c['geo_checks'][2]['points']==2
    assert c['geo_checks'][4]['points']==2
    assert c['seo_checks'][2]['points']==2
    assert 'semantic' in c['geo_checks'][2]['evidence'].lower()


def test_semantic_segment_ids_must_exist_and_kinds_are_server_assigned():
    prepared,_=excerpts([P]);s=proposal()[0]
    # Build a valid response, then reference a nonexistent source ID.
    raw={'keywords':[{'keyword':s['keyword'],'search_queries':s['search_queries'],'intent':s['intent'],'reason':s['reason'],'evidence':[{'page_id':'p0','quote':QUOTE}],'semantic_matches':[{'segment_id':'p7s99','relation':'equivalent'}]}]}
    accepted,_=validate_suggestions(raw,prepared,[P]);assert accepted[0]['semantic_matches']==[]
    raw['keywords'][0]['semantic_matches']=[{'segment_id':'p0s0','relation':'equivalent','aspects':['process']}]
    accepted,_=validate_suggestions(raw,prepared,[P])
    assert accepted[0]['semantic_matches'][0]['kind']=='title'
    assert accepted[0]['semantic_matches'][0]['aspects']==[]
    raw['keywords'][0]['semantic_matches'][0]['kind']='body'
    with pytest.raises(KimiUnavailable):validate_suggestions(raw,prepared,[P])


def test_negative_offering_cannot_become_positive_service_evidence():
    quote='We do not offer production engineering or application development services to customers.'
    p=FetchedPage('https://example.com/',('<h1>Production Engineering</h1><p>'+quote+'</p>').encode())
    prepared,_=excerpts([p]);segment=next(s for s in prepared[0]['segments'] if s['kind']=='body')
    raw={'keywords':[{'keyword':'Production Engineering','search_queries':['production engineering'],'intent':'service','reason':'This must not be presented as an offered service.','evidence':[{'page_id':'p0','quote':quote}],'semantic_matches':[{'segment_id':segment['segment_id'],'relation':'equivalent'}]}]}
    with pytest.raises(KimiUnavailable):validate_suggestions(raw,prepared,[p])


def test_repetition_does_not_stack_points_and_source_hashes_are_preserved():
    accepted=proposal();a=analyze_topics([P],suggestions=accepted)
    duplicated=copy.deepcopy(accepted);duplicated[0]['semantic_matches']*=3
    b=analyze_topics([P],suggestions=duplicated)
    assert a['topics'][0]['seo']==b['topics'][0]['seo'] and a['topics'][0]['geo']==b['topics'][0]['geo']
    assert a['version']=='kimi-semantic-0.7'
    for group in ('seo','geo'):
        assert a['topics'][0][group]==sum(c['points'] for c in a['topics'][0][group+'_checks'])
        assert sum(c['maximum'] for c in a['topics'][0][group+'_checks'])==10
    assert all(m['content_sha256']==a['topics'][0]['content_sha256'] for m in a['topics'][0]['semantic_matches'])


def test_short_intro_label_does_not_hide_later_substantive_body_segments():
    p=FetchedPage('https://example.com/',b'<h1>Production Engineering</h1><p>Overview</p><p>We turn experimental AI software into reliable products ready for real customers.</p>')
    prepared,_=excerpts([p])
    assert any(s['kind']=='body' and 'reliable products' in s['text'] for s in prepared[0]['segments'])
