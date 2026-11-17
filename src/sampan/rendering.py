"""Optional offline JS rendering. All public assets use the bounded intake first."""
from sampan.audit_urls import normalize_audit_url
import asyncio
import hashlib
import importlib.util
import os
import re
from dataclasses import dataclass
from urllib.parse import urljoin,urlsplit

from bs4 import BeautifulSoup
from sampan.intake import FetchedPage,IntakeBlocked,normalize_url

from sampan.language import readable_extent

MAX_ASSETS=12
MAX_DOM_BYTES=1_000_000
RENDER_SECONDS=25


class RenderUnavailable(ValueError):pass


@dataclass(frozen=True)
class RenderedPage(FetchedPage):
    evidence_mode: str = 'offline JavaScript-rendered DOM'
    raw_sha256: str = ''


def installed():
    return importlib.util.find_spec('playwright') is not None


def content_profile(page):
    doc=BeautifulSoup(page.body,'html.parser')
    scripts=bool(doc.select('script[src],script[type="module"]'))
    mounts=doc.select('#root,#app,#__next,[data-reactroot]')
    empty_mount=any(not n.get_text(' ',strip=True) for n in mounts)
    local_module=any(n.get('type')=='module' and urlsplit(urljoin(page.url,n.get('src',''))).hostname==urlsplit(page.url).hostname for n in doc.select('script[src]'))
    sparse_mount=local_module and any(len(n.get_text(' ',strip=True))<600 and len(n.select('h1,h2,h3,h4'))<=1 and len(n.select('p'))<=1 for n in mounts)
    suspect_mount=empty_mount or sparse_mount
    for n in doc.select('head,script,style,template,noscript,nav,footer,form,[hidden],[aria-hidden="true"]'):n.decompose()
    value=doc.get_text(' ',strip=True)
    return dict(body_characters=len(value),headings=len(doc.select('h1,h2,h3,h4')),
        paragraphs=len(doc.select('p')),javascript_shell=scripts and (readable_extent(value)<100 or suspect_mount),
        capture_warning='Sparse application mount; static fallback may be incomplete.' if scripts and suspect_mount else None,
        usable_content=readable_extent(value)>=100)


def asset_url(base,value):
    try:
        parsed=urlsplit(urljoin(base,value))
        if parsed.hostname!=urlsplit(base).hostname or parsed.query or parsed.fragment:return None
        if not parsed.path.lower().endswith(('.js','.mjs','.css')):return None
        return normalize_audit_url(parsed.geturl(),host=parsed.hostname)
    except (ValueError,IntakeBlocked):return None


def asset_links(base,body,kind='html'):
    if kind=='html':
        doc=BeautifulSoup(body,'html.parser')
        values=[n.get('src','') for n in doc.select('script[src]')]
        values += [n.get('href','') for n in doc.select('link[rel="stylesheet"],link[rel="modulepreload"]')]
    else:
        # Literal imports only. Never evaluate bundles to discover network targets.
        source=body.decode('utf-8',errors='replace')
        values=re.findall(r'(?:\bfrom\s*|\bimport\s*\(?\s*|@import\s*(?:url\()?\s*)[\'\"]([^\'\"]+\.(?:m?js|css))[\'\"]',source)
    return list(dict.fromkeys(u for v in values if (u:=asset_url(base,v))))[:MAX_ASSETS+1]


async def preload(page,intake):
    assets={};queue=asset_links(page.url,page.body)
    while queue:
        url=queue.pop(0)
        if url in assets:continue
        if len(assets)>=MAX_ASSETS:raise RenderUnavailable('Static asset limit reached; render incomplete.')
        kind,body=await intake.fetch_asset(url)
        assets[url]=(kind,body)
        queue.extend(u for u in asset_links(url,body,kind) if u not in assets and u not in queue)
    if not assets:raise RenderUnavailable('No supported public script assets found.')
    return assets


async def render_offline(page,assets):
    """No live browser traffic: offline + fulfilled allowlist + blocked websocket/SW."""
    try:
        from playwright.async_api import async_playwright
    except ImportError as exc:raise RenderUnavailable('Optional renderer is not installed.') from exc
    browser=None
    async with async_playwright() as driver:
        try:
            browser=await driver.chromium.launch(headless=True,chromium_sandbox=True,
                env={name:os.environ[name] for name in ('PATH','TMPDIR','LANG','LC_ALL','SYSTEMROOT','WINDIR') if name in os.environ},
                args=['--disable-background-networking','--disable-component-update','--no-pings','--js-flags=--max-old-space-size=128',
                      '--host-resolver-rules=MAP * ~NOTFOUND','--force-webrtc-ip-handling-policy=disable_non_proxied_udp'])
            context=await browser.new_context(offline=True,service_workers='block',accept_downloads=False,
                user_agent='SampanBot/0.1 (offline content renderer)')
            await context.route_web_socket('**/*',lambda route:route.close())
            blocked=[]
            csp="default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src data:; connect-src 'none'; worker-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'self'; object-src 'none'"
            async def handle(route):
                request=route.request
                if request.method!='GET':blocked.append('non-GET');await route.abort();return
                if request.url==page.url and request.resource_type=='document' and request.frame==target.main_frame:
                    await route.fulfill(status=200,body=page.body,headers={'content-type':'text/html; charset=utf-8','content-security-policy':csp});return
                if request.url in assets and request.resource_type in {'script','stylesheet'}:
                    kind,body=assets[request.url]
                    await route.fulfill(status=200,body=body,headers={'content-type':kind,'access-control-allow-origin':urlsplit(page.url).scheme+'://'+urlsplit(page.url).netloc});return
                blocked.append(request.resource_type);await route.abort()
            await context.route('**/*',handle)
            target=await context.new_page()
            await target.goto(page.url,wait_until='load',timeout=12000)
            await target.wait_for_function("document.body && document.body.innerText.trim().length >= 100",timeout=5000)
            interactions=[]
            # Some apps first show a local navigation gate. Only expand a bounded,
            # explicit content button in the offline copy; never submit a form.
            before=await target.locator('body').inner_text()
            if len(before)<500:
                for button in await target.locator('button').all():
                    label=' '.join((await button.inner_text()).split())
                    if not re.fullmatch(r'(?:business (?:ai )?consulting|(?:our |explore )?(?:services|solutions|products|ai workforce|ai employees)|(?:我們的|我们的)?(?:服務|服务|解決方案|解决方案|產品|产品)|企業AI顧問|企业AI顾问)',label,re.I):continue
                    if await button.evaluate('(node) => Boolean(node.closest("form"))'):continue
                    await button.click(timeout=1500)
                    interactions.append(label)
                    try:await target.wait_for_function('(n) => document.body.innerText.length > n + 150',arg=len(before),timeout=2500)
                    except Exception:pass
                    break
            # Snapshot DOM data only. Forms and scripts are not evidence content.
            body=await target.evaluate("""() => {
                const copy=document.documentElement.cloneNode(true);
                copy.querySelectorAll('script,form,iframe,object,embed').forEach(n=>n.remove());
                return '<!doctype html>'+copy.outerHTML;
            }""")
            encoded=body.encode()
            if len(encoded)>MAX_DOM_BYTES:raise RenderUnavailable('Rendered DOM byte limit reached.')
            rendered_url=normalize_audit_url(target.url,host=urlsplit(page.url).hostname)
            result=RenderedPage(rendered_url,encoded,fetched_at=page.fetched_at,x_robots_tag=page.x_robots_tag,
                                raw_sha256=hashlib.sha256(page.body).hexdigest())
            if not content_profile(result)['usable_content']:raise RenderUnavailable('Rendered content is still insufficient.')
            return result,dict(status='rendered',assets=len(assets),blocked_requests=len(blocked),
                interactions=interactions,raw_url=page.url,rendered_location=rendered_url,raw_sha256=result.raw_sha256,rendered_sha256=hashlib.sha256(encoded).hexdigest(),
                browser_network='offline; only preloaded public JS/CSS fulfilled',limitations='No external scripts, API calls, images, frames, workers or form submissions; at most one explicit offline content-navigation click; no layout/performance certification.')
        except RenderUnavailable:raise
        except Exception as exc:
            raise RenderUnavailable('JavaScript rendering unavailable or incomplete ('+type(exc).__name__+').') from None
        finally:
            if browser is not None:await browser.close()


async def render_page(page,intake):
    if not installed():raise RenderUnavailable('Optional renderer is not installed.')
    try:
        async with asyncio.timeout(RENDER_SECONDS):
            assets=await preload(page,intake)
            rendered,metadata=await render_offline(page,assets)
            intake.check_deadline()
            policy=await intake.policy_for(urlsplit(rendered.url).hostname)
            if not policy.permits(rendered.url):raise RenderUnavailable('Robots disallows the rendered content location; no content scores produced from it.')
            return rendered,metadata
    except (TimeoutError,IntakeBlocked) as exc:
        raise RenderUnavailable(str(exc) if isinstance(exc,IntakeBlocked) else 'Rendering deadline reached.') from None
