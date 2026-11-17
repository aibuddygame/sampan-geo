import json
import re

import pytest
from fastapi.testclient import TestClient

from sampan.intake import FetchedPage
from sampan.pilot_reports import PilotReportStore,MAX_REPORTS,MAX_REPORT_BYTES
from sampan.scoring_app import create_client_preview_app, create_scoring_app


def setup(tmp_path):
    app=create_scoring_app();app.state.report_store=PilotReportStore(tmp_path/'reports');visits=[]
    class Intake:
        def __init__(self,*a,**kw):pass
        async def fetch(self,url):
            visits.append(url)
            return FetchedPage(url,b'<html lang="en"><title>Document Processing</title><h1>Document Processing</h1><p>Document processing extracts business records for review by the user and prepares structured evidence.</p></html>')
    app.state.intake_factory=Intake
    return app,visits


def headers(client):return {'x-scan-token':re.search('nonce="([^"]+)"',client.get('/').text)[1]}


def test_live_report_saved_reopened_and_survives_app_restart(tmp_path):
    app,visits=setup(tmp_path)
    with TestClient(app) as c:
        r=c.post('/scan',headers=headers(c),json={'url':'https://vxreal.com/','authorized':True,'pilot':'vx-real'})
        assert r.status_code==200
        report=r.json();ident=report['pilot_save']['id'];assert len(visits)==1
        saved=c.get('/pilot-api/reports/'+ident).json()
        assert saved['content_sha256']==report['content_sha256']
        assert saved['scores']==report['scores'] and saved['pilot_save']['status']=='saved'
        index=c.get('/pilot-api/reports').json()
        assert len(index[0]['reports'])==1 and index[1]['reports']==[]
        assert index[0]['reports'][0]['id']==ident
        assert len(visits)==1  # reopening never fetches the site again
    app2,_=setup(tmp_path)
    with TestClient(app2) as c:assert c.get('/pilot-api/reports/'+ident).status_code==200


def test_one_off_scan_and_saved_html_remain_transient(tmp_path):
    app,_=setup(tmp_path)
    with TestClient(app) as c:
        h=headers(c)
        assert c.post('/scan',headers=h,json={'url':'https://vxreal.com/','authorized':True}).status_code==200
        assert c.post('/analyze-html',headers=h,json={'url':'https://vxreal.com/','authorized':True,'pilot':'vx-real','html':'<p>Private saved file</p>'}).status_code==400
    assert not list(tmp_path.rglob('*.json'))


def test_pilot_host_mismatch_rejected_before_fetch(tmp_path):
    app,visits=setup(tmp_path)
    with TestClient(app) as c:
        r=c.post('/scan',headers=headers(c),json={'url':'https://example.com/','authorized':True,'pilot':'vx-real'})
        assert r.status_code==400 and not visits
        assert c.post('/scan',headers=headers(c),json={'url':'https://vxreal.com/','authorized':True,'pilot':'other'}).status_code==422


def test_save_requires_existing_scan_authorization_and_nonce(tmp_path):
    app,visits=setup(tmp_path)
    with TestClient(app) as c:
        body={'url':'https://vxreal.com/','authorized':True,'pilot':'vx-real'}
        assert c.post('/scan',json=body).status_code==403
        body['authorized']=False
        assert c.post('/scan',headers=headers(c),json=body).status_code==400
    assert not visits and not list(tmp_path.rglob('*.json'))


def test_storage_failure_does_not_lose_successful_audit(tmp_path):
    app,_=setup(tmp_path)
    class Broken:
        def save(self,*args):raise OSError('private secret path')
    app.state.report_store=Broken()
    with TestClient(app) as c:
        r=c.post('/scan',headers=headers(c),json={'url':'https://vxreal.com/','authorized':True,'pilot':'vx-real'})
        assert r.status_code==200 and r.json()['scores']
        assert r.json()['pilot_save']['status']=='not_saved' and 'secret' not in r.text


def minimal():
    return {'url':'https://vxreal.com/','scanned_at':'2026-11-02T00:00:00+00:00','source_mode':'live page',
            'rubric_version':'test','scores':{'seo':{'score':5},'geo':{'score':3}}}


def test_bounded_append_only_store_does_not_overwrite_existing_reports(tmp_path):
    store=PilotReportStore(tmp_path)
    ids=[store.save('vx-real',minimal()) for _ in range(MAX_REPORTS)]
    assert len(set(ids))==MAX_REPORTS
    original={p.name:p.read_bytes() for p in (tmp_path/'vx-real').glob('*.json')}
    with pytest.raises(ValueError,match='limit'):store.save('vx-real',minimal())
    assert original=={p.name:p.read_bytes() for p in (tmp_path/'vx-real').glob('*.json')}
    with pytest.raises(ValueError):store.load('../../outside')
    with pytest.raises(ValueError):store.save('marksix-gold',minimal())


def test_oversized_and_symlink_records_are_not_read_or_written(tmp_path):
    store=PilotReportStore(tmp_path/'reports')
    with pytest.raises(ValueError,match='storage limit'):store.save('vx-real',dict(minimal(),large='x'*MAX_REPORT_BYTES))
    assert not list((tmp_path/'reports').rglob('*.json'))
    outside=tmp_path/'outside.json';outside.write_text(json.dumps({'private':'never return'}))
    ident='a'*24;(tmp_path/'reports/vx-real'/f'{ident}.json').symlink_to(outside)
    with pytest.raises(ValueError):store.load(ident)


def test_reporting_routes_are_loopback_only_and_do_not_expose_missing_paths(tmp_path):
    app,_=setup(tmp_path)
    with TestClient(app,client=('203.0.113.9',1234)) as c:
        for path in ['/pilots','/pilot-api/reports','/pilot-api/reports/'+'a'*24,'/pilot-api/marksix-search-queries']:assert c.get(path).status_code==403
    with TestClient(app) as c:
        r=c.get('/pilot-api/reports/'+'a'*24)
        assert r.status_code==404 and str(tmp_path) not in r.text
        assert c.get('/pilots').headers['cache-control']=='no-store'
        assert c.get('/pilot-api/marksix-search-queries').status_code==403


def test_marketing_audit_and_workspace_links_share_the_same_app(tmp_path):
    app,_=setup(tmp_path)
    with TestClient(app) as c:
        page=c.get('/').text
        assert 'Better search starts' in page and 'id="scan-form"' in page
        assert 'href="/pilots"' in page and 'id="pilot-select"' in page
        assert '__TOKEN__' not in page
        assert c.get('/pilots').status_code==200


def test_trial_preview_keeps_client_data_behind_sign_in(monkeypatch):
    monkeypatch.setenv('SAMPAN_MARKSIX_PORTAL_PASSWORD', 'local-test-password')
    monkeypatch.setattr('sampan.scoring_app.latest_hong_kong_query_pages',
                        lambda: {'start': '2026-10-11', 'end': '2026-11-07',
                                 'rows': [{'query': 'example private query'}]})
    with TestClient(create_client_preview_app()) as c:
        home = c.get('/')
        assert 'id="scan-form"' in home.text and 'id="pilot-select"' not in home.text
        assert 'href="/client"' in home.text
        for path in ('/pilots', '/pilot-api/reports', '/pilot-api/marksix-search-queries'):
            assert c.get(path, headers=headers(c)).status_code == 404
        for path in ('/client', '/client/search-queries'):
            assert c.get(path, headers=headers(c)).status_code == 401
            assert c.get(path, auth=('vx-real', 'local-test-password')).status_code == 401
        auth = ('marksix-gold', 'local-test-password')
        assert 'Proposed next improvement' in c.get('/client', auth=auth).text
        response = c.get('/client/search-queries', auth=auth)
        assert response.json()['rows'][0]['query'] == 'example private query'
        assert response.headers['cache-control'] == 'no-store'
        body = {'url': 'https://example.com/', 'authorized': True, 'pilot': 'vx-real'}
        assert c.post('/scan', headers=headers(c), json=body).status_code == 403
        saved_html = {'url': 'https://example.com/', 'authorized': True,
                      'html': '<title>Example</title><h1>Public website</h1><p>Example content</p>'}
        assert c.post('/analyze-html', headers=headers(c), json=saved_html).status_code == 200


def test_unreadable_record_is_reported_as_unavailable_not_silently_valid(tmp_path):
    store=PilotReportStore(tmp_path)
    folder=tmp_path/'vx-real';folder.mkdir()
    (folder/('b'*24+'.json')).write_text('{broken')
    row=store.index()[0]
    assert row['reports']==[] and row['unavailable_reports']==1
