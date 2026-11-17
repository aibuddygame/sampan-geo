import json
import pytest
from sampan.intake import FetchedPage
from sampan.scoring import score_page,summarize
from sampan.kimi import excerpts,validate_suggestions,KimiUnavailable,SYSTEM
from sampan.topics import analyze_topics

CONTEXT={'status_code':200,'x_robots_tag':'','robots_permitted':True}


def page(path,*,title='Workflow Engineering',description=None,canonical=None,name='Example',text=None):
    url='https://example.com'+path
    desc=description or 'We connect business records with practical workflow engineering and delivery support.'
    body=text or 'We build reliable workflow engineering for business teams, with a clear review and delivery process. '+path
    schema=json.dumps({'@context':'https://schema.org','@type':'Organization','name':name,'url':'https://example.com/','description':desc})
    html=f'<html lang="en"><head><title>{title}</title><meta name="description" content="{desc}"><link rel="canonical" href="{canonical or url}"><script type="application/ld+json">{schema}</script></head><body><h1>{title}</h1><p>{desc}</p><p>{body}</p><footer>{name}</footer></body></html>'
    return FetchedPage(url,html.encode())


def test_unresolved_checks_no_longer_disappear_from_headline_or_category_score():
    p=page('/');r=score_page(p.url,p.body,context=CONTEXT)
    for group in ('seo','geo'):
        s=r['scores'][group]
        assert s['score']<10 and s['unresolved_weight']>0
        assert s['score']<=s['score_ceiling']<=10
        assert s['observed_score']>=s['score']
        assert any(c['score']!=10 for c in s['categories'])
    assert r['visibility']['google_positions'] is None and r['visibility']['ai_citations'] is None
    assert r['score_maximum']==10


def test_unknown_becoming_fail_changes_certainty_not_previously_verified_credit():
    rows=[dict(group='seo',category='Test',weight=4,status='pass',earned=4),dict(group='seo',category='Test',weight=6,status='unknown',earned=None)]
    a=summarize(rows,'seo');rows[1].update(status='fail',earned=0);b=summarize(rows,'seo')
    assert a['score']==b['score']==4 and a['score_ceiling']==10 and b['score_ceiling']==4
    assert a['unresolved_weight']==6 and b['known_gap_weight']==6
    rows[1].update(status='pass',earned=6)
    assert summarize(rows,'seo')['score']==10  # No arbitrary ceiling for fully verified success.
    assert summarize([dict(group='seo',category='Test',weight=10,status='unknown',earned=None)],'seo')['score'] is None


def test_cross_page_metadata_and_content_duplicates_have_exact_source_evidence():
    first=page('/',text='Repeated substantive explanation for business teams. '*4)
    second=page('/other',canonical=first.url,text='Repeated substantive explanation for business teams. '*4)
    r=score_page(first.url,first.body,context=CONTEXT,related_pages=[first,second])
    checks={c['id']:c for c in r['checks']}
    for key in ('title','description','canonical','content'):
        c=checks['seo_sample_'+key]
        assert c['status']=='partial' and c['earned']==c['weight']/2
        assert c['source_urls']==[first.url,second.url]
    assert checks['geo_sample_identity']['status']=='pass'
    assert checks['geo_description_support']['status']=='pass'


def test_distinct_pages_pass_sample_checks_without_extra_network():
    first=page('/')
    second=page('/other',title='Document Review',description='Our document review covers data quality and practical delivery constraints for business teams.')
    r=score_page(first.url,first.body,context=CONTEXT,related_pages=[first,second])
    checks={c['id']:c for c in r['checks']}
    assert all(checks['seo_sample_'+key]['status']=='pass' for key in ('title','description','canonical','content'))
    single={c['id']:c for c in score_page(first.url,first.body,context=CONTEXT)['checks']}
    assert single['seo_sample_title']['status']=='unknown'


def test_paraphrased_description_and_different_legal_identity_remain_review_items():
    first=page('/')
    second=page('/subsidiary',name='Subsidiary business')
    # A valid paraphrase should require review rather than become a mismatch failure.
    body=first.body.replace(b'<p>We connect business records with practical workflow engineering and delivery support.</p>',b'<p>Our specialists engineer reliable workflows and integrate existing business systems.</p>')
    r=score_page(first.url,body,context=CONTEXT,related_pages=[second])
    checks={c['id']:c for c in r['checks']}
    assert checks['geo_description_support']['status']=='unknown'
    assert checks['geo_sample_identity']['status']=='unknown'


def test_topic_limit_is_nine_and_decimals_preserve_component_totals():
    p=page('/')
    labels=['Topic '+chr(65+i)+' Research' for i in range(12)]
    body='<h1>Independent Research</h1>'+''.join(f'<section><h2>{label}</h2><p>{label} provides practical research outputs and a documented review process for business teams.</p></section>' for label in labels)
    r=analyze_topics([FetchedPage(p.url,body.encode())])
    assert len(r['topics'])==9 and r['candidate_limit']==9 and r['score_maximum']==10
    for c in r['topics']:
        for g in ('seo','geo'):
            assert c[g]==pytest.approx(sum(x['points'] for x in c[g+'_checks']))
            assert sum(x['maximum'] for x in c[g+'_checks'])==10
            assert 0<=c[g]<=10
    assert 'Choose up to 9 distinct topics' in SYSTEM
    prepared,_=excerpts([p]);quote='We connect business records with practical workflow engineering and delivery support.'
    item={'keyword':'Workflow Engineering','search_queries':['workflow engineering'],'intent':'service','reason':'The page describes workflow engineering delivery.','evidence':[{'page_id':'p0','quote':quote}]}
    with pytest.raises(KimiUnavailable,match='invalid keyword structure'):validate_suggestions({'keywords':[item]*10},prepared,[p])
