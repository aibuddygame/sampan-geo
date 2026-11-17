"""Versioned, evidence-backed readiness heuristics; no visibility predictions."""
import hashlib
import json
import math
import re
import unicodedata
from datetime import datetime, timezone
from urllib.parse import urljoin, urlsplit

from bs4 import BeautifulSoup
from urllib.parse import unquote
from sampan.language import han_count, passage, readable_extent

RUBRIC_VERSION = "verified-page-0.6"
EVALUATED = {"pass", "partial", "fail"}


def summarize(checks: list[dict], group: str) -> dict:
    """Verified credit uses all applicable weight; unknown is unresolved, not failure."""
    subset = [c for c in checks if c["group"] == group]
    def totals(rows):
        applicable = [c for c in rows if c["status"] != "na"]
        evaluated = [c for c in applicable if c["status"] in EVALUATED]
        possible = sum(c["weight"] for c in evaluated)
        denominator = sum(c["weight"] for c in applicable)
        earned = sum(c["earned"] for c in evaluated)
        unknown = max(0, denominator - possible)
        score = round(10 * earned / denominator, 1) if denominator and evaluated else None
        return dict(score=score, score_maximum=10,
            score_ceiling=round(10 * (earned + unknown) / denominator, 1) if denominator else None,
            observed_score=round(10 * earned / possible, 1) if possible else None,
            coverage=round(100 * possible / denominator) if denominator else 0,
            earned=round(earned, 4), evaluated_weight=round(possible, 4),
            applicable_weight=round(denominator, 4), unresolved_weight=round(unknown, 4),
            known_gap_weight=round(possible-earned, 4), tested=len(evaluated), total=len(rows),
            status="evidence incomplete" if unknown else "evaluated")
    result=totals(subset)
    result['categories']=[]
    for category in dict.fromkeys(c['category'] for c in subset):
        rows=[c for c in subset if c['category']==category]
        result['categories'].append(dict(name=category,weight=round(sum(c['weight'] for c in rows),4),**totals(rows)))
    return result


def score_page(url: str, body: bytes, *, context: dict | None = None, related_pages=None) -> dict:
    """Context is trusted collector metadata; omit it for owner-supplied HTML."""
    context = context or {}
    soup = BeautifulSoup(body, "html.parser")
    checks = []

    def add(group, category, key, label, weight, result, evidence, why, fix, *, severity="warning", method="HTML check"):
        # Boolean -> full/zero credit; numeric .5 -> partial. Unknown/NA carry no earned credit.
        if isinstance(result, str):
            status, earned = result, None
        else:
            fraction = float(result)
            status = "pass" if fraction == 1 else "fail" if fraction == 0 else "partial"
            earned = round(weight * fraction, 2)
        checks.append(dict(group=group, category=category, id=group+"_"+key, label=label,
            weight=weight, earned=earned, status=status, severity=severity,
            evidence=evidence or "No value found", why=why, recommendation=fix, method=method, source_url=url))

    def meta(name, attr="name"):
        return soup.find_all("meta", attrs={attr: lambda v: isinstance(v, str) and v.lower() == name})

    def absurl(value):
        try:
            target = urlsplit(urljoin(url, str(value)))
            return target if target.scheme in {"https", "http"} and target.hostname else None
        except ValueError:
            return None

    def text(node):
        return node.get_text(" ", strip=True) if node else ""

    def norm(value):
        return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", value)).strip().casefold()

    # Branding may legitimately appear in shared navigation, footer, or an image label.
    brand_soup = BeautifulSoup(body, "html.parser")
    for node in brand_soup.select('head, script, style, template, noscript, [hidden], [aria-hidden="true"]'):
        node.decompose()
    branding_text = text(brand_soup) + " " + " ".join(
        str(n.get('alt') or n.get('aria-label') or '')
        for n in brand_soup.select('img[alt], [aria-label]'))

    def same_site(host):
        return bool(host and host.removeprefix('www.') == urlsplit(url).hostname.removeprefix('www.'))

    # Exclude shared navigation/footer only for substantive content heuristics.
    readable = BeautifulSoup(body, "html.parser")
    for node in readable.select('head, script, style, template, noscript, nav, footer, [hidden], [aria-hidden="true"]'):
        node.decompose()
    content = readable.body or readable
    content_text = text(content)
    paragraphs = [text(p) for p in content.find_all("p") if passage(text(p))]
    headings = [text(h) for h in content.find_all(["h2", "h3"]) if text(h)]
    h1s = soup.find_all("h1")
    titles = soup.find_all("title")
    title = text(titles[0]) if titles else ""
    descs = meta("description")
    description = str(descs[0].get("content", "")).strip() if descs else ""
    canonicals = soup.find_all("link", rel=lambda v: v and "canonical" in v)
    canonical = str(canonicals[0].get("href", "")) if canonicals else ""
    canonical_target = absurl(canonical) if canonical else None
    links = soup.find_all("a", href=True)
    internal = [a for a in links if absurl(a["href"]) and absurl(a["href"]).hostname == urlsplit(url).hostname]
    navigable = [a for a in internal if a["href"].strip() and not a["href"].startswith("#")]
    generic_anchors = {"click here", "here", "link", "read more", "learn more"}
    useful_anchors = [a for a in internal if (text(a) and norm(text(a)) not in generic_anchors) or str(a.get("aria-label", "")).strip() or any(str(im.get("alt", "")).strip() for im in a.find_all("img"))]
    robot_tags = meta("robots") + meta("googlebot")
    raw_meta_directives = " ".join(str(tag.get("content", "")).lower() for tag in robot_tags)
    directives = {d for d in re.split(r"[,\s]+", raw_meta_directives) if d}
    # Multiple HTTP directives may be user-agent scoped. No pass is inferred when present.
    header_directives = str(context.get("x_robots_tag", "")).lower()
    header_scoped = any(name not in {"max-snippet", "max-image-preview", "max-video-preview", "unavailable_after"}
                        for name in re.findall(r"(?:^|,)\s*([a-z][a-z0-9_-]*)\s*:", header_directives))
    images = soup.find_all("img")
    missing_alt = [im for im in images if not im.get("alt", "").strip()]
    mixed = [el.get(attr) for el, attr in [(n, "src") for n in soup.find_all(src=True)] + [(n, "href") for n in soup.find_all("link", href=True)] if str(el.get(attr, "")).startswith("http://")]

    nodes, invalid = [], 0
    blocks = soup.find_all("script", type="application/ld+json")
    for script in blocks:
        try:
            value = json.loads(script.string or script.get_text())
            stack = [value]
            while stack:
                item = stack.pop()
                if isinstance(item, dict):
                    nodes.append(item)
                    stack.extend(item.values())
                elif isinstance(item, list):
                    stack.extend(item)
        except (ValueError, RecursionError):
            invalid += 1
    def typed(node, kind):
        value = node.get("@type")
        values = [value] if isinstance(value, str) else value if isinstance(value, list) else []
        return any(v == kind or v in ('https://schema.org/'+kind, 'http://schema.org/'+kind)
                   for v in values if isinstance(v, str))
    business_types = ('Organization','LocalBusiness','Corporation','NGO','EducationalOrganization',
                      'ProfessionalService','MedicalOrganization','GovernmentOrganization')
    org = next((n for n in nodes if any(typed(n,k) for k in business_types)
                and isinstance(n.get("name"), str) and n["name"].strip()), None)
    names = []
    if org:
        for key in ('name','alternateName','legalName'):
            value = org.get(key)
            names.extend(v for v in (value if isinstance(value,list) else [value]) if isinstance(v,str) and v.strip())
    name_in_body = any((norm(n) in norm(branding_text)) if han_count(n) else re.search(r'(?<!\w)'+re.escape(norm(n))+r'(?!\w)', norm(branding_text)) for n in names)
    org_url = absurl(org.get("url", "")) if org and org.get("url") else None
    contexts = [n.get("@context") for n in nodes]
    def schema_context(value):
        if isinstance(value, str):
            return value.rstrip('/') in ('https://schema.org','http://schema.org')
        if isinstance(value, list):return any(schema_context(v) for v in value)
        if isinstance(value, dict):return schema_context(value.get('@vocab'))
        return False
    vocabulary = any(schema_context(v) for v in contexts)
    known_types = any(typed(n, kind) for n in nodes for kind in ("Organization", "WebPage", "WebSite", "Service", "Product", "Article", "LocalBusiness", "Person", "BlogPosting", "NewsArticle", "CollectionPage", "SoftwareApplication", "Event", "BreadcrumbList", "ItemList"))
    has_json = bool(blocks)
    headings_sequence = [int(h.name[1]) for h in content.find_all(re.compile(r"^h[1-6]$"))]
    hierarchy_ok = all(b <= a + 1 for a, b in zip(headings_sequence, headings_sequence[1:]))

    S, G = "seo", "geo"
    # SEO: 30 + 25 + 20 + 15 + 10 = 100.
    cat = "Access & indexing"
    add(S,cat,"https","HTTPS URL",5,urlsplit(url).scheme == "https",url,"Secure transport helps users and crawlers access the page.","Serve the preferred URL over HTTPS.")
    add(S,cat,"http","Successful page response",8,context.get("status_code") == 200 if "status_code" in context else "unknown",f"HTTP {context.get('status_code', 'not measured: saved HTML')}","A working response is a prerequisite for normal indexing.","Resolve the page's HTTP error response.",severity="error",method="Live fetch")
    add(S,cat,"index_meta","HTML indexing directives",7,not bool(directives & {"noindex", "none"}),"Directives: " + (", ".join(sorted(directives)) or "none declared"),"An explicit noindex prevents indexing by crawlers that honor it.","Review noindex if this page should be searchable.",severity="error")
    add(S,cat,"index_header","HTTP indexing directives",5,("unknown" if header_scoped else False if re.search(r"\b(noindex|none)\b",header_directives) else True) if "x_robots_tag" in context else "unknown",header_directives or "No header observed" if "x_robots_tag" in context else "Response headers not available", "HTTP headers can override page-level indexing intent.","Review the X-Robots-Tag response header and any agent-specific directives.",severity="error",method="Live response header")
    add(S,cat,"robots","Scanner permitted by robots policy",5,True if context.get("robots_permitted") is True else "unknown",str(context.get("robots_status", "SampanBot policy passed")) if context.get("robots_permitted") else "No crawler permission verified", "Scanner permission is different from permission for Googlebot or AI crawlers.","Review the robots policy without bypassing restrictions.",method="Live collector policy")
    cat = "Search presentation"
    add(S,cat,"title","Page title present",5,bool(title),title or "Missing title","A title describes the page in browser and search contexts.","Write a descriptive page title.")
    add(S,cat,"title_unique","One title element",3,"na" if not titles else len(titles)==1,f"{len(titles)} title elements; cross-page uniqueness not tested","Conflicting title elements make the document ambiguous.","Keep one title element in the head.")
    add(S,cat,"title_length","Title length review",3,"na" if not title else True if (8 if han_count(title) else 15)<=len(title)<=(40 if han_count(title) else 65) else "unknown",f"{len(title)} characters; 8–40 for Chinese/mixed titles, 15–65 for English: editorial heuristics, not Google limits","Very short or long titles may deserve an editorial review.","Review title specificity and likely display truncation.",severity="notice",method="Editorial heuristic")
    add(S,cat,"description","Meta description present",4,bool(description),description or "Missing description","A useful summary can help communicate the page's purpose.","Add a page-specific summary; display in search is not guaranteed.")
    add(S,cat,"description_unique","One description element",2,"na" if not descs else len(descs)==1,f"{len(descs)} description elements","Duplicate summaries can conflict.","Use one meta description.")
    add(S,cat,"description_length","Description length review",2,"na" if not description else True if (20 if han_count(description) else 50)<=len(description)<=(100 if han_count(description) else 170) else "unknown",f"{len(description)} characters; 20–100 for Chinese/mixed summaries, 50–170 for English: editorial heuristics","Summary usefulness matters more than a fixed character count.","Review the description for clarity, specificity and length.",severity="notice",method="Editorial heuristic")
    add(S,cat,"language","Document language declared",3,bool(soup.html and str(soup.html.get('lang','')).strip()),str(soup.html.get('lang','')) if soup.html else "Missing html/lang","Language metadata supports interpretation and accessibility.","Set the appropriate lang attribute on html.")
    add(S,cat,"main_heading","Nonempty main heading",3,any(text(h) for h in h1s)," / ".join(text(h) for h in h1s) or "Missing nonempty H1","A descriptive main heading helps communicate the page topic.","Add a main heading that describes this page.")
    cat = "Discovery & URL signals"
    add(S,cat,"canonical","Canonical declaration",5,len(canonicals)==1 and bool(canonical),canonical or "Missing canonical","A canonical expresses the preferred URL; it is not an indexing guarantee.","Declare one preferred canonical URL.")
    add(S,cat,"canonical_format","Canonical URL review",3,"na" if not canonical else True if canonical_target and canonical_target.scheme=="https" and same_site(canonical_target.hostname) else "unknown" if canonical_target else False,"Target: " + (canonical or "not declared") + "; destination not fetched","Relative and cross-domain canonicals can be valid but need contextual review.","Check that the canonical resolves to the intended preferred page.")
    add(S,cat,"links","Navigable same-host links",5,bool(navigable),f"{len(navigable)} same-host links; destinations not fetched","Navigation helps users and crawlers discover related pages.","Add useful links to related pages.")
    add(S,cat,"anchor_text","Descriptive internal anchors",3,"na" if not internal else True if len(useful_anchors)==len(internal) else .5 if useful_anchors else False,f"{len(useful_anchors)}/{len(internal)} links have labels beyond our generic English anchor list","Meaningful labels explain the linked destination.","Review generic or empty link labels.",method="English-oriented heuristic")
    def link_key(value):
        parsed=urlsplit(value)
        return (parsed.hostname,parsed.path.rstrip('/') or '/',parsed.query)
    observed={link_key(p.url) for p in (related_pages or [])} if context.get('status_code')==200 else set()
    targets={link_key(urljoin(url,a['href'])) for a in navigable}
    checked=targets & observed
    link_result=True if targets and checked==targets else 'unknown'
    add(S,cat,"link_destinations","Link destination availability",4,link_result,
        f"{len(checked)}/{len(targets)} linked destinations observed in the permitted sample; remaining destinations untested. Redirect aliases not inferred.",
        "Observed responses establish availability only for those exact destinations, not a whole-site pass.",
        "Check remaining destinations within the permitted crawl budget.",method="Bounded observed destination reconciliation")
    cat = "Structure & media"
    add(S,cat,"h1_single","Main heading structure",3,True if len(h1s)==1 else "unknown",f"{len(h1s)} H1 elements; one H1 is our editorial convention, not a Google requirement","A clear main heading makes the report easier to interpret.","Review the main heading hierarchy.",severity="notice",method="Editorial heuristic")
    add(S,cat,"heading_order","Heading sequence",2,"na" if len(headings_sequence)<2 else True if hierarchy_ok else "unknown",str(headings_sequence),"Ordered headings support navigability; they do not prove content quality.","Review skipped heading levels.",severity="notice")
    alt_result = "na" if not images else "unknown" if missing_alt else True
    add(S,cat,"alt","Image alternatives",4,alt_result,f"{len(images)} images; {len(missing_alt)} empty/missing alt attributes","Decorative images can correctly use empty alt; human review is needed.","Give informative images useful alt text and keep decorative images appropriately empty.")
    dimensions = sum(bool(im.get("width") and im.get("height")) for im in images)
    add(S,cat,"dimensions","Image layout reservation",2,"na" if not images else True if dimensions==len(images) else "unknown",f"{dimensions}/{len(images)} explicit dimensions; stylesheet aspect ratios not evaluated","Explicit dimensions or equivalent CSS can reserve image space.","Check dimensions or CSS aspect ratios to reduce layout shifts.",severity="notice")
    viewports = meta('viewport')
    add(S,cat,"viewport","Device-width viewport",2,any('width=device-width' in str(v.get('content','')).lower().replace(' ','') for v in viewports),"Viewport declaration only; not a layout test","A device-width viewport supports responsive layouts.","Declare a device-width viewport and verify the mobile page.")
    add(S,cat,"mobile","Rendered mobile usability",2,"unknown","No browser layout or interaction measurements collected","A viewport tag does not prove usability.","Test the page at mobile sizes.",method="Requires browser test")
    cat = "Markup & resource signals"
    add(S,cat,"jsonld","JSON-LD syntax",3,"na" if not has_json else not invalid and bool(nodes),f"{len(blocks)} blocks; {invalid} malformed; syntax only","Malformed structured data cannot reliably communicate the intended record.","Fix malformed JSON-LD; validate relevant types separately.")
    add(S,cat,"schema_context","Schema.org vocabulary",2,"na" if not has_json else True if vocabulary else "unknown","Schema.org context present" if vocabulary else "No recognized Schema.org context","A vocabulary identifies the meaning of structured fields.","Review JSON-LD context and use an appropriate vocabulary.",severity="notice")
    add(S,cat,"mixed","Insecure resource references",2,not mixed,f"{len(mixed)} HTTP src/stylesheet references; network behavior not tested","HTTP assets on an HTTPS page may be blocked or upgraded by browsers.","Review HTTP resource URLs and use HTTPS where supported.")
    add(S,cat,"performance","Loading performance / Core Web Vitals",3,"unknown","No field or lab performance measurement","HTML inspection cannot establish loading speed or Core Web Vitals.","Collect PageSpeed/Lighthouse or real-user performance data.",method="Requires performance data")

    # GEO: 25 + 25 + 20 + 20 + 10 = 100. Heuristics are explicitly labelled.
    cat = "Retrieval & excerpts"
    add(G,cat,"http","Working retrievable page",5,context.get("status_code")==200 if "status_code" in context else "unknown",f"HTTP {context.get('status_code','not measured')}","A successful scanner fetch is access evidence for this scanner only.","Resolve page response errors.",severity="error",method="Live fetch")
    add(G,cat,"readable","Substantive HTML text",10,True if readable_extent(content_text)>=400 else .5 if readable_extent(content_text)>=100 else False,f"{len(content_text)} body-text characters after exclusions; Han characters count 2.5 in the length heuristic, not a quality assessment","Retrievable text makes facts available without executing scripts; length does not prove usefulness.","Provide concise, substantive information as readable page text.",method="Length heuristic; no rendering")
    html_snippet_blocked = bool(directives & {'nosnippet','none','noindex'}) or bool(re.search(r'max-snippet\s*:\s*0(?:\D|$)', raw_meta_directives))
    snippet_blocked = html_snippet_blocked or (not header_scoped and bool(re.search(r'\b(nosnippet|noindex)\b|max-snippet\s*:\s*0(?:\D|$)',header_directives)))
    snippet_result = False if snippet_blocked else 'unknown' if header_scoped or 'x_robots_tag' not in context else True
    add(G,cat,"snippets","HTML/available header snippet controls",5,snippet_result,"Restrictive directive observed" if snippet_blocked else "No restrictive directive in available inputs; not a complete platform policy audit","Snippet controls can limit eligible excerpts in Google Search; other AI systems differ.","Review intentional snippet and indexing restrictions.",method="Available directives only")
    add(G,cat,"ai_policies","Search/AI crawler-specific access",5,"unknown","Googlebot, OAI-SearchBot and other platform policies not independently evaluated","SampanBot access does not establish platform-specific access or training inclusion.","Review search/retrieval crawler rules and edge controls separately from training preferences.",method="Requires crawler-policy audit")
    cat = "Business identity & context"
    add(G,cat,"identity","Structured organization name",5,True if org else "unknown",org['name'] if org else "No named business record recognized; this may be a non-business page","A named record can reduce identity ambiguity; structured data is optional for AI search.","If appropriate, add an accurate Organization record matching the visible company.")
    add(G,cat,"intro","Descriptive body passage",8,True if paragraphs else "unknown",f"{len(paragraphs)} passages of at least 40 characters or 16 Han characters; meaning not assessed","A substantive introduction can explain who you are and what you do.","Explain the company, offering and intended customers in plain text.",method="Paragraph-presence heuristic")
    contact_links = [a for a in links if str(a['href']).startswith(('mailto:','tel:')) or re.search(r'contact|enquir|聯絡|联系|聯繫|聯絡我們|查詢|查询',unquote(str(a['href']))+' '+text(a),re.I)]
    add(G,cat,"contact","Contact route discoverable",4,True if contact_links else "unknown",f"{len(contact_links)} contact/email/phone links; delivery not tested","A contact route gives visitors a practical next step and identity context.","Provide an appropriate contact page, email or phone route.",method="Link-pattern heuristic")
    about_links = [a for a in links if re.search(r'about|company|story|team|關於|关于|公司簡介|公司简介|團隊|团队',unquote(str(a['href']))+' '+text(a),re.I)]
    add(G,cat,"about","Company context route",4,True if about_links else "unknown",f"{len(about_links)} about/company/story/team links","Company context can help a reader understand the organization.","Link to substantive company or team information.",method="Chinese/English link-label and URL heuristic")
    add(G,cat,"consistent_name","Business name matches accessible branding",4,"na" if not org else True if name_in_body else "unknown","Name or declared alias found in body/footer/navigation/image labels; CSS visibility not verified" if name_in_body else "Name not located; review branding/aliases rather than infer a mismatch","Consistency helps reduce conflicting identity signals.","Align structured and visible names; check legitimate aliases.")
    cat = "Answer-friendly organization"
    add(G,cat,"sections","Descriptive subsection headings",5,True if headings else "unknown"," / ".join(headings[:5]) or "No H2/H3 section labels","Section labels help readers locate specific information.","Use useful headings for services, process or other relevant topics.")
    add(G,cat,"passages","Readable paragraph structure",5,True if len(paragraphs)>=2 else "unknown",f"{len(paragraphs)} substantive paragraphs; not an answer-quality assessment","Separate passages can make information easier to locate and quote accurately.","Organize useful facts into concise, self-contained passages.",method="Structural heuristic")
    lists = content.find_all(['ul','ol','dl','table'])
    add(G,cat,"facts","Lists or structured facts",5,True if lists else "unknown",f"{len(lists)} lists/definition lists/tables","Structured facts can make specifications or steps easier to interpret.","Use a relevant list or table where it improves understanding; avoid filler.",method="Structural heuristic")
    add(G,cat,"answer_quality","Answers satisfy customer intent",5,"unknown","No target question set or human content review","Markup and word count do not prove the page answers customer questions.","Review the page against real prospective-customer questions.",method="Requires editorial review")
    cat = "Evidence & accountability"
    external = [a for a in content.find_all('a',href=True) if absurl(a['href']) and absurl(a['href']).hostname != urlsplit(url).hostname]
    add(G,cat,"sources","Supporting claims and sources",8,"unknown",f"{len(external)} external body links observed; relevance, independence and claims not verified","An arbitrary outbound link is not proof of a claim.","Support material claims with relevant evidence and review its accuracy.",method="Requires claim/evidence review")
    labelled_external = [a for a in external if len(text(a))>=4 or a.get('aria-label')]
    add(G,cat,"source_labels","External source labels",4,"na" if not external else True if len(labelled_external)==len(external) else .5 if labelled_external else False,f"{len(labelled_external)}/{len(external)} external body links labelled","Labels help readers understand a linked source; authority is not measured.","Use descriptive labels for relevant external references.")
    dates = content.find_all('time')
    dated = any(str(t.get('datetime','')).strip() or text(t) for t in dates)
    add(G,cat,"dates","Publication/update date review",4,True if dated else "unknown",f"{len(dates)} time elements; missing dates are not automatically defects","Dates matter for time-sensitive claims, but may be unnecessary on an evergreen page.","Review whether time-sensitive information needs a clear publication or update date.",method="Markup observation + editorial review")
    add(G,cat,"authorship","Responsible author or organization",4,"unknown","No independent authorship/accountability validation","A name or logo alone does not establish expertise or accountability.","Identify the responsible organization or author where appropriate and verify their role.",method="Requires editorial review")
    cat = "Machine-readable consistency"
    add(G,cat,"jsonld","Structured data parses",3,"na" if not has_json else not invalid and bool(nodes),f"{len(blocks)} JSON-LD blocks; {invalid} malformed","Consistent machine-readable records can complement useful visible text.","Repair malformed structured data; markup is not required for AI search.")
    add(G,cat,"schema_type","Relevant schema type present",2,"na" if not has_json else True if known_types else "unknown","Recognized business/page type found" if known_types else "No supported type identified","An appropriate type describes what the record represents; suitability still needs review.","Use a relevant Schema.org type and validate its fields.")
    add(G,cat,"org_url","Organization website consistency",2,"na" if not org else "unknown" if not org.get("url") else True if org_url and same_site(org_url.hostname) else "unknown" if org_url else False,str(org.get('url','')) if org else "No named Organization","The company website field should identify the intended official site.","Review the Organization URL, including any legitimate aliases or primary host.")
    structured_desc = org.get('description') if org else None
    add(G,cat,"fact_consistency","Structured claims match visible facts",3,"unknown",("Organization description present; semantic match not verified" if structured_desc else "No semantic claim consistency review"),"Valid JSON can still contain unsupported or inconsistent claims.","Compare material structured claims against visible, approved evidence.",method="Requires factual review")

    # Reserve 20% for six deeper source checks; keep ten points per group.
    for check in checks:
        check['weight']=round(check['weight']*.08, 4)
        if check['earned'] is not None:check['earned']=round(check['earned']*.08, 4)
    sample={url:body}
    for page in (related_pages or [])[:8]:
        if same_site(urlsplit(page.url).hostname) and page.url not in sample and len(sample)<8:
            sample[page.url]=page.body
    records=[]
    for sample_url,sample_body in sample.items():
        doc=BeautifulSoup(sample_body,'html.parser')
        title_node=doc.find('title')
        desc_node=doc.find('meta',attrs={'name':re.compile('^description$',re.I)})
        canonical_nodes=doc.find_all('link',rel=lambda v:v and 'canonical' in v)
        canonical_value=''
        if len(canonical_nodes)==1:
            try:
                target=urlsplit(urljoin(sample_url,str(canonical_nodes[0].get('href',''))))
                if canonical_nodes[0].get('href') and target.scheme=='https' and target.hostname and not target.username:
                    canonical_value=target._replace(fragment='').geturl()
            except ValueError:pass
        declared_names=set()
        for script in doc.select('script[type="application/ld+json"]')[:20]:
            try:
                stack=[json.loads(script.get_text())]
                for _ in range(5000):
                    if not stack:break
                    item=stack.pop()
                    if isinstance(item,dict):
                        if any(typed(item,k) for k in business_types):
                            for key in ('name','alternateName','legalName'):
                                value=item.get(key)
                                declared_names.update(norm(v) for v in (value if isinstance(value,list) else [value]) if isinstance(v,str) and v.strip())
                        stack.extend(item.values())
                    elif isinstance(item,list):stack.extend(item)
            except (ValueError,RecursionError):pass
        sample_title=norm(text(title_node));sample_description=norm(str(desc_node.get('content',''))) if desc_node else ''
        for node in doc.select('head,script,style,template,noscript,nav,footer,[hidden],[aria-hidden="true"]'):node.decompose()
        main=norm(text(doc.body or doc))
        records.append(dict(url=sample_url,title=sample_title,
            description=sample_description,
            canonical=canonical_value,content=main if len(main)>=100 else '',names=declared_names))
    def distinct(field):
        values=[r[field] for r in records]
        if len(records)<2 or not all(values):return 'unknown'
        return True if len(set(values))==len(values) else .5
    for field,label,fix in (
        ('title','Distinct page titles in sample','Review duplicate titles and give distinct pages descriptive titles.'),
        ('description','Distinct summaries in sample','Review reused summaries; intentional duplication needs editorial context.'),
        ('canonical','Distinct preferred URLs in sample','Review shared canonical targets; legitimate aliases may be intentional.'),
        ('content','Distinct main content in sample','Review identical main text on distinct sampled URLs; aliases may be intentional.'),
    ):
        values=[r[field] for r in records]
        evidence=f'{len(records)} sampled pages; {sum(bool(v) for v in values)} usable values; {len(set(v for v in values if v))} distinct. Exact normalized comparison only; intentional aliases require review.'
        add(S,'Sample consistency','sample_'+field,label,.5,distinct(field),evidence,
            'Page-specific information helps distinguish destinations. This is a sample observation, not a duplicate-content penalty claim.',fix,method='Bounded sampled-page comparison')
        checks[-1]['source_urls']=[r['url'] for r in records]
    description_supported=bool(isinstance(structured_desc,str) and (len(norm(structured_desc))>=30 or han_count(structured_desc)>=12) and norm(structured_desc) in norm(content_text))
    add(G,'Evidence depth','description_support','Structured description supported by visible text',1,
        True if description_supported else 'unknown',
        'Organization description located verbatim in substantive visible text.' if description_supported else 'No direct normalized description match; a paraphrase may be valid and needs review.',
        'Syntax alone does not establish visible support. A literal match shows consistency, not independent truth.',
        'Review the organization description against visible approved wording.',method='Literal provenance check; no semantic truth validation')
    identities=[r['names'] for r in records]
    consistent=bool(len(identities)>=2 and all(identities) and set.intersection(*identities))
    add(G,'Evidence depth','sample_identity','Consistent declared identity across sample',1,
        True if consistent else 'unknown',
        f'{sum(bool(n) for n in identities)}/{len(records)} sampled pages declare a business name/alias; '+('shared identity found.' if consistent else 'shared identity not established; subsidiaries and aliases need review.'),
        'A shared declared identity supplies cross-page consistency evidence without verifying ownership or credentials.',
        'Review primary business records and legitimate aliases across the sampled pages.',method='Bounded structured-identity comparison')
    checks[-1]['source_urls']=[r['url'] for r in records]
    assert all(math.isclose(sum(c['weight'] for c in checks if c['group']==g),10) for g in (S,G))
    scores = {group: summarize(checks, group) for group in (S,G)}
    issues = [c for c in checks if c['status'] in {'fail','partial'}]
    severity_rank = {'error':0,'warning':1,'notice':2}
    issues.sort(key=lambda c:(severity_rank[c['severity']],-(c['weight']-(c['earned'] or 0)),c['id']))
    return dict(url=url, scanned_at=datetime.now(timezone.utc).isoformat(), rubric_version=RUBRIC_VERSION,
        source_mode="live page" if context.get('status_code') else "owner-supplied HTML", content_sha256=hashlib.sha256(body).hexdigest(),
        scores=scores, score_maximum=10, checks=checks, top_issues=issues[:5],
        audit_scope=dict(primary_url=url,sampled_urls=list(sample),sample_checks=6),
        verification_items=sorted([c for c in checks if c['status']=='unknown'],key=lambda c:-c['weight']),
        visibility=dict(status="not measured",google_positions=None,ai_citations=None,search_demand=None,
            next_steps=["Connect Google Search Console or supply a dated query/page performance export.","Measure positions for agreed keywords, country, device and date.","Run a fixed AI-question/citation benchmark with provider and date recorded."]),
        review_items=[c for c in checks if c['status']=='unknown' and c['id'] in {
            'seo_title_length','seo_description_length','seo_h1_single','seo_heading_order',
            'seo_canonical_format','geo_consistent_name','geo_facts','geo_identity','geo_contact','geo_about'}][:5],
        counts={status:sum(c['status']==status for c in checks) for status in ('pass','partial','fail','unknown','na')},
        limitations=["Primary-page audit plus six checks on the bounded page sample; not a comprehensive domain audit.",
            "Weighted readiness heuristics, not rankings, citation probability or an official Google score. GEO has no universal scoring standard.",
            "Verified readiness is earned credit divided by all applicable weight, on a 0–10 scale. Unknown weight remains unresolved, not a failure; N/A is excluded. The ceiling assumes all unresolved checks pass.",
            "Only supplied sampled pages contribute to comparisons. No sitemap fetch, rendered mobile test, field performance, search index data, backlink database or AI-answer observations.",
            "Editorial conventions and optional structures trigger review instead of failures; unknowns remain visible as unresolved credit. Metadata and valid JSON do not prove factual quality.",
            "llms.txt, training inclusion and automatic agent discovery are not scored. Higher readiness does not guarantee traffic or citations."])
