import json
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import parse_qs, urlsplit

import httpx
import pytest

from sampan.search_console import (SCOPE, TOKEN_URL, API, SearchConsoleError, authorize,
                                  client_config, fetch_performance, read_private, write_private)


def config(root):
    row={'installed':{'client_id':'test-client','client_secret':'test-secret',
                     'auth_uri':'https://accounts.google.com/o/oauth2/auth','token_uri':TOKEN_URL,
                     'redirect_uris':['http://localhost']}}
    write_private(root/'client_secret.json',row)
    write_private(root/'token.json',{'refresh_token':'test-refresh','client_id':'test-client','scopes':[SCOPE]})
    return row


def provider(sites=None,empty=False,fail=False):
    seen=[]
    def handle(request):
        seen.append(request)
        if str(request.url)==TOKEN_URL:
            assert request.method=='POST' and b'refresh_token=test-refresh' in request.content
            return httpx.Response(200,json={'access_token':'test-access','scope':SCOPE})
        assert request.headers['authorization']=='Bearer test-access'
        if str(request.url)==API:
            return httpx.Response(200,json={'siteEntry':sites if sites is not None else [{'siteUrl':'sc-domain:marksix.gold','permissionLevel':'siteOwner'}]})
        assert request.method=='POST' and '/searchAnalytics/query' in str(request.url)
        payload=json.loads(request.content)
        assert payload['type']=='web' and payload['dataState']=='final'
        assert payload['dimensionFilterGroups'][0]['filters'][0]['expression']=='hkg'
        if fail:return httpx.Response(403,text='test-secret test-refresh test-access')
        dims=payload['dimensions']
        row={'clicks':2,'impressions':10,'ctr':.2,'position':12.5}
        if dims:row['keys']=['2026-10-01'] if dims==['date'] else ['六合彩玩法指南','https://marksix.gold/guide','hkg','MOBILE']
        return httpx.Response(200,json={'rows':[] if empty else [row]})
    return httpx.MockTransport(handle),seen


def test_actual_adapter_preserves_filters_totals_dimensions_and_private_snapshot(tmp_path):
    config(tmp_path);transport,seen=provider()
    r=fetch_performance('2026-10-01','2026-10-28',root=tmp_path,transport=transport)
    assert r['property']=='sc-domain:marksix.gold' and r['status']=='observed_data'
    assert r['date_timezone']=='America/Los_Angeles' and len(seen)==5
    assert r['results']['totals']['rows'][0]['clicks']==2
    assert r['results']['queries']['rows'][0]['keys'][0]=='六合彩玩法指南'
    assert r['results']['queries']['request']['rowLimit']==1000
    paths=list((tmp_path/'performance').glob('*.json'));assert len(paths)==1
    assert paths[0].stat().st_mode&0o777==0o600
    text=paths[0].read_text()
    assert not any(secret in text for secret in ['test-access','test-secret','test-refresh'])
    assert 'probability' in text and 'anonymized' in text


def test_empty_rows_are_missing_evidence_not_zero_scores(tmp_path):
    config(tmp_path);transport,_=provider(empty=True)
    r=fetch_performance('2026-10-01','2026-10-28',root=tmp_path,transport=transport)
    assert r['status']=='no_rows_returned' and 'scores' not in r


@pytest.mark.parametrize('property,permission',[
    ('sc-domain:vxreal.com','siteOwner'),('sc-domain:marksix.gold.evil.example','siteOwner'),
    ('http://marksix.gold/','siteOwner'),('sc-domain:marksix.gold','siteUnverifiedUser')])
def test_other_properties_and_unverified_access_never_queried(tmp_path,property,permission):
    config(tmp_path);transport,seen=provider(sites=[{'siteUrl':property,'permissionLevel':permission}])
    with pytest.raises(SearchConsoleError,match='no supported'):fetch_performance('2026-10-01','2026-10-28',root=tmp_path,transport=transport)
    assert len(seen)==2 and not (tmp_path/'performance').exists()


def test_provider_failure_never_retries_or_leaks_tokens(tmp_path):
    config(tmp_path);transport,seen=provider(fail=True)
    with pytest.raises(SearchConsoleError) as error:fetch_performance('2026-10-01','2026-10-28',root=tmp_path,transport=transport)
    assert len(seen)==3 and not any(s in str(error.value) for s in ['test-access','test-secret','test-refresh'])
    assert not (tmp_path/'performance').exists()


@pytest.mark.parametrize('start,end,country',[
    ('not-a-date','2026-10-28','hkg'),('2026-10-28','2026-10-01','hkg'),
    ('2026-01-01','2026-10-28','hkg'),('2026-10-01','2999-01-01','hkg'),
    ('2026-10-01','2026-10-28','invalid')])
def test_invalid_scope_dates_rejected_before_files_or_network(tmp_path,start,end,country):
    with pytest.raises(SearchConsoleError):fetch_performance(start,end,country,root=tmp_path)
    assert not list(tmp_path.iterdir())


def test_private_files_no_overwrite_symlink_or_broad_endpoint(tmp_path):
    row=config(tmp_path)
    with pytest.raises(FileExistsError):write_private(tmp_path/'token.json',{})
    p=tmp_path/'client_secret.json';p.chmod(0o644)
    with pytest.raises(SearchConsoleError,match='0600'):client_config(tmp_path)
    p.chmod(0o600)
    row['installed']['token_uri']='https://evil.invalid/token'
    write_private(p,row,replace=True)
    with pytest.raises(SearchConsoleError,match='endpoints'):client_config(tmp_path)
    link=tmp_path/'link';link.symlink_to(tmp_path/'token.json')
    with pytest.raises(SearchConsoleError):read_private(link)
    with pytest.raises(SearchConsoleError):write_private(link,{})


def test_authorize_uses_google_helper_pkce_loopback_and_only_readonly_scope(tmp_path,monkeypatch):
    InstalledAppFlow=pytest.importorskip("google_auth_oauthlib.flow").InstalledAppFlow
    row=config(tmp_path);(tmp_path/'token.json').unlink()
    seen={}
    class Flow:
        def run_local_server(self,**kwargs):
            seen.update(kwargs)
            return SimpleNamespace(granted_scopes=[SCOPE],scopes=[SCOPE],refresh_token='test-refresh')
    def create(config,**kwargs):
        assert config==row and kwargs=={'scopes':[SCOPE],'autogenerate_code_verifier':True}
        return Flow()
    monkeypatch.setattr(InstalledAppFlow,'from_client_config',create)
    authorize(tmp_path)
    assert seen['host']==seen['bind_addr']=='127.0.0.1' and seen['port']==0
    assert seen['timeout_seconds']==180 and seen['include_granted_scopes']=='false'
    saved=read_private(tmp_path/'token.json')
    assert saved['scopes']==[SCOPE] and 'access_token' not in saved
    with pytest.raises(SearchConsoleError,match='already exists'):authorize(tmp_path)


def test_broader_scope_or_denied_consent_does_not_save_token(tmp_path,monkeypatch):
    InstalledAppFlow=pytest.importorskip("google_auth_oauthlib.flow").InstalledAppFlow
    config(tmp_path);(tmp_path/'token.json').unlink()
    for fail in [False,True]:
        class Flow:
            def run_local_server(self,**kwargs):
                if fail:raise RuntimeError('private authorization code')
                return SimpleNamespace(granted_scopes=[SCOPE,'extra'],refresh_token='secret')
        monkeypatch.setattr(InstalledAppFlow,'from_client_config',lambda *a,**kw:Flow())
        with pytest.raises(SearchConsoleError) as error:authorize(tmp_path)
        assert 'private authorization code' not in str(error.value)
        assert not (tmp_path/'token.json').exists()


def test_official_flow_generates_state_and_s256_pkce_without_network(tmp_path):
    InstalledAppFlow=pytest.importorskip("google_auth_oauthlib.flow").InstalledAppFlow
    row=config(tmp_path)
    flow=InstalledAppFlow.from_client_config(row,scopes=[SCOPE],autogenerate_code_verifier=True)
    flow.redirect_uri='http://127.0.0.1:12345/'
    url,state=flow.authorization_url(access_type='offline')
    query=parse_qs(urlsplit(url).query)
    assert query['state']==[state] and state
    assert query['scope']==[SCOPE] and query['code_challenge_method']==['S256']
    assert query['code_challenge'] and flow.code_verifier not in url
    assert 'test-secret' not in url


def test_invalid_provider_rows_and_oversized_bodies_are_rejected(tmp_path):
    config(tmp_path)
    for mode in ['oversized','invalid_ctr','bad_keys']:
        def handle(request):
            if str(request.url)==TOKEN_URL:return httpx.Response(200,json={'access_token':'test-access'})
            if str(request.url)==API:return httpx.Response(200,json={'siteEntry':[{'siteUrl':'https://marksix.gold/','permissionLevel':'siteFullUser'}]})
            if mode=='oversized':return httpx.Response(200,content=b'x'*2_000_001)
            row={'clicks':1,'impressions':2,'ctr':2 if mode=='invalid_ctr' else .5,'position':3}
            if mode=='bad_keys':row['keys']=''
            return httpx.Response(200,json={'rows':[row]})
        with pytest.raises(SearchConsoleError):fetch_performance('2026-10-01','2026-10-28',root=tmp_path,transport=httpx.MockTransport(handle))
    assert not (tmp_path/'performance').exists()
