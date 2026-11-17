"""Loopback-only scoring experiment. T001 intake remains VX Real by default."""
from sampan.audit_urls import normalize_audit_url
import asyncio
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from sampan.pilot_reports import PilotReportStore, PILOTS
from urllib.parse import urlsplit

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.trustedhost import TrustedHostMiddleware

from sampan.intake import CollectionPermission, CrawlLimits, IntakeBlocked, normalize_url
from sampan.scoring import score_page
from sampan.audit_intake import AuditIntake
from sampan.topics import analyze_topics, discovery_key, related_links
from sampan.config import Settings
from sampan.kimi import KimiAnalyzer, KimiUnavailable
from sampan.rendering import content_profile,installed,render_page,RenderUnavailable
from sampan.integrations import check_kimi, integration_status
from sampan.search_console import latest_hong_kong_query_pages


class ScanInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    url: str = Field(min_length=1, max_length=2048)
    authorized: bool = False
    topic_pages: bool = False
    use_kimi: bool = False
    render_js: bool = False
    pilot: Literal["vx-real", "marksix-gold"] | None = None


class SavedHTMLInput(ScanInput):
    html: str = Field(min_length=1, max_length=1_000_000)


def create_client_preview_app() -> FastAPI:
    return create_scoring_app(operator_workspace=False)


def create_scoring_app(*, operator_workspace: bool = True) -> FastAPI:
    app = FastAPI(title="SAMPAN local readiness experiment", docs_url=None, redoc_url=None, openapi_url=None)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "[::1]", "testserver"])
    token = secrets.token_urlsafe(32)
    busy = asyncio.Lock()
    app.state.renderer = render_page
    app.state.intake_factory = AuditIntake  # trusted test injection only
    app.state.report_store = PilotReportStore(Path("private/pilot-reports"))
    settings = Settings()
    app.state.kimi = KimiAnalyzer(settings.kimi_api_key.get_secret_value(), settings.kimi_model)
    app.state.kimi_connection = {"status": "not_checked", "checked_at": None}
    connection_check = asyncio.Lock()
    portal_login = HTTPBasic(auto_error=False, realm="SAMPAN client preview")

    def require_client(credentials: HTTPBasicCredentials | None = Depends(portal_login)):
        password = settings.marksix_portal_password.get_secret_value()
        if (not password or not credentials or credentials.username != 'marksix-gold'
                or not secrets.compare_digest(credentials.password.encode(), password.encode())):
            raise HTTPException(401, "Client sign-in required.",
                                headers={"WWW-Authenticate": 'Basic realm="SAMPAN client preview"'})

    def render_page_file(filename):
        page = Path(__file__).with_name(filename).read_text()
        if '__SEARCH_TABLE__' in page:
            page = page.replace('__SEARCH_TABLE__', Path(__file__).with_name('search_query_table.html').read_text())
        return page.replace('__TOKEN__', token)

    @app.middleware("http")
    async def local_only(request: Request, call_next):
        if not request.client or request.client.host not in {"127.0.0.1", "::1", "testclient"}:
            return JSONResponse({"detail": "Local connections only."}, status_code=403)
        if not operator_workspace and (
            request.url.path in {'/pilots', '/integrations', '/integrations/check'}
            or request.url.path.startswith('/pilot-api/')
        ):
            return JSONResponse({"detail": "Not found."}, status_code=404)
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Content-Security-Policy"] = "default-src 'none'; script-src 'nonce-" + token + "'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
        return response

    @app.get("/", response_class=HTMLResponse)
    def home():
        page = render_page_file('scoring_ui.html')
        if not operator_workspace:
            before, pilot_section = page.split('<!--OPERATOR_START-->', 1)
            page = before + pilot_section.split('<!--OPERATOR_END-->', 1)[1]
            page = page.replace('href="/pilots#readiness"', 'href="/client"').replace('href="/pilots"', 'href="/client"')
            for original in ('Pilot workspace', 'Explore the pilot workspace', 'Local pilot workspace', 'See the pilot preparation checklist'):
                page = page.replace(original, 'Client sign-in')
            page = page.replace('Start with VX Real and marksix.gold.', 'Start with your own website.')
            page = page.replace('website checks, evidence reports and saved pilot history.', 'website checks and evidence reports.')
        return (page
                .replace('__RENDER_OPTION__','checked' if installed() else 'disabled')
                .replace('__RENDER_STATUS__','Renderer installed; browser availability is checked per scan.' if installed() else 'Optional renderer not installed; JavaScript sites will be labelled incomplete.')
                .replace('__KIMI_OPTION__', 'checked' if operator_workspace and app.state.kimi.configured else 'disabled')
                .replace('__KIMI_STATUS__', 'Kimi is configured on this server.' if operator_workspace and app.state.kimi.configured else 'Local analysis is available.'))

    @app.get('/pilots',response_class=HTMLResponse)
    def pilots():
        return render_page_file('pilot_ui.html').replace('__SEARCH_ENDPOINT__', '/pilot-api/marksix-search-queries')

    @app.get('/client', response_class=HTMLResponse, dependencies=[Depends(require_client)])
    def client_portal():
        return render_page_file('client_ui.html').replace('__SEARCH_ENDPOINT__', '/client/search-queries')

    @app.get('/client/search-queries', dependencies=[Depends(require_client)])
    def client_search_queries():
        return latest_hong_kong_query_pages()

    @app.get('/integrations')
    def integrations():
        return integration_status(app.state.kimi, app.state.kimi_connection, installed())

    @app.post('/integrations/check')
    async def verify_integrations(request: Request):
        if not secrets.compare_digest(request.headers.get("x-scan-token", ""), token):
            raise HTTPException(403, "Open the local page to check connections.")
        if connection_check.locked():
            raise HTTPException(429, "A connection check is running.")
        async with connection_check:
            # Cache checks briefly; never spend completion tokens or follow redirects.
            previous = app.state.kimi_connection.get('checked_at')
            if not previous or (datetime.now(timezone.utc)-datetime.fromisoformat(previous)).total_seconds() >= 60:
                app.state.kimi_connection = await check_kimi(app.state.kimi)
        return integrations()

    @app.get('/pilot-api/reports')
    def pilot_index():
        return app.state.report_store.index()

    @app.get('/pilot-api/marksix-search-queries')
    def marksix_search_queries(request: Request):
        if not secrets.compare_digest(request.headers.get("x-scan-token", ""), token):
            raise HTTPException(403, "Open the local pilot workspace to view search data.")
        return latest_hong_kong_query_pages()

    @app.get('/pilot-api/reports/{ident}')
    def pilot_report(ident:str):
        try:
            row=app.state.report_store.load(ident)
            row['report']['pilot_save']={'status':'saved','pilot':row['pilot'],'id':ident}
            return row['report']
        except (ValueError,OSError):
            raise HTTPException(404,'Saved report unavailable.') from None

    @app.post("/scan")
    async def scan(data: ScanInput, request: Request):
        if not secrets.compare_digest(request.headers.get("x-scan-token", ""), token):
            raise HTTPException(403, "Open the local page to start a scan.")
        if not data.authorized:
            raise HTTPException(400, "Confirm authorization and terms review before scanning.")
        if not operator_workspace and (data.pilot or data.use_kimi):
            raise HTTPException(403, "This preview supports one-off local analysis.")
        if busy.locked():
            raise HTTPException(429, "A scan is already running. Wait for it to finish.")
        async with busy:
            try:
                host = urlsplit(data.url).hostname
                if not host:
                    raise IntakeBlocked("Enter a full HTTPS URL, such as https://vxreal.com/.")
                url = normalize_audit_url(data.url, host=host)
                if data.pilot and host not in {PILOTS[data.pilot]['host'],'www.'+PILOTS[data.pilot]['host']}:
                    raise HTTPException(400,'The URL does not match the selected pilot.')
                permission = CollectionPermission(reviewer="Local operator", reviewed_at=datetime.now(timezone.utc),
                    reference="Authorization and terms confirmation submitted through local scoring form",
                    collection_allowed=True, terms_reviewed=True)
                limits = CrawlLimits(max_pages=8, max_requests=24, run_seconds=75) if data.topic_pages else CrawlLimits(max_pages=1, max_requests=12, run_seconds=45)
                intake = app.state.intake_factory(permission, limits, host=host)
                page = await intake.fetch(url)
                pages, notices = [page], []
                if data.topic_pages:
                    # Independent from T001 inventory. Fixed depth, candidate,
                    # response, request and deadline budgets; never follow a
                    # discovered host or query string supplied by page text.
                    queue = [(u, 1) for u in related_links(page.url, page.body)]
                    seen = {discovery_key(url), discovery_key(page.url)}
                    while queue and len(pages) < 8:
                        candidate, depth = queue.pop(0)
                        if discovery_key(candidate) in seen:
                            continue
                        seen.add(discovery_key(candidate))
                        try:
                            linked = await intake.fetch(candidate)
                        except (IntakeBlocked, ValueError) as exc:
                            notices.append(str(exc))
                            break  # No retry or alternate route around a block.
                        seen.add(discovery_key(linked.url))
                        if linked.url in {p.url for p in pages}:
                            continue
                        pages.append(linked)
                        if depth < 2:
                            queue.extend((u, depth+1) for u in related_links(linked.url, linked.body))
                            queue = queue[:80]
                    if queue and len(pages) == 8:
                        notices.append('Eight-page review limit reached; additional pages were not checked.')
                report = score_page(page.url, page.body, context={
                    "status_code": 200, "x_robots_tag": page.x_robots_tag or "",
                    "robots_permitted": True,
                    "robots_status": getattr(intake, "robots_status", {}).get(urlsplit(page.url).hostname, "Robots checked by collector"),
                }, related_pages=pages)
                raw_profile=content_profile(page)
                effective_pages=list(pages)
                capture=dict(raw=raw_profile,effective=raw_profile,status='initial HTML',render_attempted=False)
                if raw_profile['javascript_shell']:
                    capture.update(status='limited: JavaScript-dependent initial HTML')
                    if data.render_js:
                        capture['render_attempted']=True
                        try:
                            rendered,metadata=await app.state.renderer(page,intake)
                            effective_pages[0]=rendered
                            capture.update(metadata,effective=content_profile(rendered))
                            report['rendered_audit']=score_page(rendered.url,rendered.body,context={
                                'status_code':200,'x_robots_tag':page.x_robots_tag or '',
                                'robots_permitted':True,'robots_status':getattr(intake,'robots_status',{}).get(urlsplit(page.url).hostname,'Checked by collector'),
                            },related_pages=effective_pages)
                            report['rendered_audit']['source_mode']='offline JavaScript-rendered DOM'
                        except RenderUnavailable as exc:
                            capture.update(status='limited: render unavailable',reason=str(exc))
                            notices.append(str(exc))
                    else:notices.append('JavaScript-dependent page; enable isolated rendering to review its content.')
                report['page_audits']=[score_page(p.url,p.body,context={
                    'status_code':200,'x_robots_tag':p.x_robots_tag or '',
                    'robots_permitted':True,
                },related_pages=effective_pages) for p in effective_pages[1:]]
                report['score_scope']='Submitted page plus six sampled-page checks; not a whole-site score.'
                report['content_capture']=capture
                usable=any(content_profile(p)['usable_content'] for p in effective_pages)
                if not usable:
                    report['topic_assessment']=analyze_topics([])
                    report['topic_assessment']['pages_reviewed']=len(effective_pages)
                    report['topic_assessment']['analysis']=dict(provider='none',status='limited_content',reason='No substantive body content captured. Titles alone cannot support keyword content scores; AI call skipped.')
                    notices.append('Content capture is incomplete; this does not establish poor Google or AI visibility.')
                elif data.use_kimi:
                    try:
                        report['topic_assessment'] = await app.state.kimi.analyze(effective_pages)
                    except KimiUnavailable as exc:
                        report['topic_assessment'] = analyze_topics(effective_pages)
                        report['topic_assessment']['analysis'] = dict(provider='local', requested_provider='kimi', status='fallback', reason=str(exc),
                            usage=app.state.kimi.records[-1] if app.state.kimi.records else None)
                else:
                    topic_inputs=([page]+effective_pages)[:8] if capture.get('rendered_sha256') and content_profile(page)['usable_content'] else effective_pages
                    report['topic_assessment'] = analyze_topics(topic_inputs)
                    report['topic_assessment']['analysis'] = dict(provider='local', status='selected')
                    if len(topic_inputs)!=len(effective_pages):notices.append('Local topic discovery retains the readable initial page alongside its rendered capture; each card identifies its scored evidence mode.')
                report['topic_assessment']['collection_notes'] = notices
                report['topic_assessment']['reviewed_urls'] = [p.url for p in effective_pages]
                report['topic_assessment']['scope'] = 'bounded linked-page sample' if data.topic_pages else 'one page'
                report["collection"] = {
                    "profile": "bounded-audit", "requested_url": url, "final_url": page.url,
                    "requests": getattr(intake, "requests", None),
                    "wire_bytes": getattr(intake, "bytes_received", None),
                    "decoded_bytes": getattr(intake, "decoded_bytes", None),
                    "topic_pages_reviewed": len(pages),
                }
                if data.pilot:
                    try:
                        ident=app.state.report_store.save(data.pilot,report)
                        report['pilot_save']={'status':'saved','pilot':data.pilot,'id':ident}
                    except (ValueError,OSError):
                        report['pilot_save']={'status':'not_saved','reason':'Local storage unavailable or report limit reached. You can still download this report.'}
                return report
            except (IntakeBlocked, ValueError) as exc:
                raise HTTPException(422, str(exc)) from exc

    @app.post("/analyze-html")
    async def analyze_html(data: SavedHTMLInput, request: Request):
        if not secrets.compare_digest(request.headers.get("x-scan-token", ""), token):
            raise HTTPException(403, "Open the local page to analyze saved HTML.")
        if not data.authorized:
            raise HTTPException(400, "Confirm permission to analyze this HTML.")
        if data.pilot:
            raise HTTPException(400,"Saved HTML stays transient; pilot history accepts live reports only.")
        if data.render_js:
            raise HTTPException(400, "Saved HTML stays offline; live rendering is unavailable in this mode.")
        if data.use_kimi:
            raise HTTPException(400, "Kimi is available in live URL mode only. Saved HTML remains offline.")
        try:
            host = urlsplit(data.url).hostname
            if not host:
                raise IntakeBlocked("Enter the original public HTTPS page URL.")
            url = normalize_audit_url(data.url, host=host)
            body = data.html.encode("utf-8")
            if len(body) > 1_000_000:
                raise HTTPException(413, "Saved HTML must be no larger than 1 MB.")
            # No network fetch, execution, persistence, or inference of live access.
            report = score_page(url, body)
            from sampan.intake import FetchedPage
            report['topic_assessment'] = analyze_topics([FetchedPage(url, body)])
            report['topic_assessment'].update(scope='one owner-supplied HTML file', collection_notes=[], reviewed_urls=[url])
            return report
        except (IntakeBlocked, ValueError) as exc:
            raise HTTPException(422, str(exc)) from exc

    return app
