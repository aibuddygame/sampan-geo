import asyncio
import re

import httpx
import pytest
from fastapi.testclient import TestClient

from sampan.integrations import check_kimi
from sampan.kimi import KimiAnalyzer
from sampan.scoring_app import create_scoring_app


@pytest.mark.parametrize('code,payload,status',[
    (200,{'data':[{'id':'kimi-k3.1-pro'}]},'verified'),
    (200,{'data':[{'id':'different-model'}]},'model_unavailable'),
    (401,{'error':'secret'},'authentication_failed'),
    (302,{'location':'https://elsewhere.invalid'},'provider_unavailable'),
])
def test_auth_check_is_bounded_read_only_and_never_a_completion(code,payload,status):
    seen=[]
    def transport(request):
        seen.append(request)
        assert request.method=='GET' and str(request.url)=='https://api.moonshot.ai/v1/models'
        return httpx.Response(code,json=payload)
    analyzer=KimiAnalyzer('private-test-key',transport=httpx.MockTransport(transport))
    result=asyncio.run(check_kimi(analyzer))
    assert result['status']==status and result['checked_at']
    assert len(seen)==1 and analyzer.calls==0 and analyzer.records==[]
    assert 'secret' not in str(result) and 'private-test-key' not in str(result)


def test_missing_credentials_and_invalid_or_failed_response_are_explicit():
    def unexpected(request):pytest.fail('No key must mean no network')
    assert asyncio.run(check_kimi(KimiAnalyzer('',transport=httpx.MockTransport(unexpected))))['status']=='not_configured'
    for response in [httpx.Response(200,text='not-json private-test-key'),httpx.Response(200,content=b'x'*128001)]:
        analyzer=KimiAnalyzer('private-test-key',transport=httpx.MockTransport(lambda r:response))
        result=asyncio.run(check_kimi(analyzer))
        assert result['status'] in {'connection_failed','invalid_response'} and 'private-test-key' not in str(result)
    def failed(request):raise httpx.ConnectError('secret private-test-key',request=request)
    result=asyncio.run(check_kimi(KimiAnalyzer('private-test-key',transport=httpx.MockTransport(failed))))
    assert result['status']=='connection_failed' and 'secret' not in str(result)


def test_local_routes_keep_credentials_private_and_dont_probe_on_get():
    app=create_scoring_app();seen=[]
    def transport(request):
        seen.append(request)
        return httpx.Response(200,json={'data':[{'id':'kimi-k3.1-pro'}]})
    app.state.kimi=KimiAnalyzer('private-test-key',transport=httpx.MockTransport(transport))
    with TestClient(app) as c:
        r=c.get('/integrations');assert r.status_code==200 and not seen
        assert r.json()['kimi']['connection']['status']=='not_checked'
        assert r.json()['search_console']['status']=='not_connected'
        assert r.json()['ai_citations']['status']=='not_measured'
        assert c.post('/integrations/check').status_code==403 and not seen
        page=c.get('/pilots').text;token=re.search('nonce="([^"]+)"',page)[1]
        for _ in range(2):
            r=c.post('/integrations/check',headers={'x-scan-token':token})
            assert r.json()['kimi']['connection']['status']=='verified'
            assert 'private-test-key' not in r.text and r.headers['cache-control']=='no-store'
        assert len(seen)==1  # cached model-list check, never a paid completion
        assert 'Verify Kimi connection' in page and '__TOKEN__' not in page
    with TestClient(app,client=('203.0.113.9',1234)) as c:
        assert c.get('/integrations').status_code==403
        assert c.post('/integrations/check').status_code==403
