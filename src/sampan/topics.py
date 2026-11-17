"""Site-derived Chinese/English phrase discovery and experimental readiness signals.

Relevance is observed content salience, never search popularity or visibility.
"""
from sampan.audit_urls import normalize_audit_url
from sampan.search_terms import project_names, is_project_query, qualify_chinese
import hashlib
import re
from urllib.parse import urljoin, urlsplit

from bs4 import BeautifulSoup

from sampan.intake import IntakeBlocked, normalize_url
from sampan.language import HAN, han_count, content_units, substantive, keyword_features, keyword_valid, topic_language

TOPIC_VERSION = 'site-topics-0.7'
MAX_TOPICS = 9
# Linguistic/boilerplate filters, not an industry or topic catalog. Connecting
# words split candidate spans rather than joining unrelated words together.
STOP = set("""a an the and or to of for from with without in on at by as into across
is are was were be been being we our us you your they their it its this that these those
can could will would may might must should have has had do does did not no yes more most
all some any each other such than then when where which who how why what
turn turns turning make makes making made help helps helping get gets explore discover
learn read view see find start contact request tell use uses using used build built
create creates creating provide provides offering offers deliver delivers developed
home homepage about welcome overview selected project projects solution solutions
service services company limited ltd inc corporation group team teams website page pages
click here back next previous menu navigation login sign privacy policy terms cookies
copyright reserved rights subscribe newsletter latest news article articles blog
one two three first new real trusted forward together thank thanks please
available information details example examples useful important need needs want wants
business businesses product products system systems
""".split())
# Generic words may occur inside a useful phrase (business transformation,
# product scaling), but cannot form a useful topic on their own.
CONNECTORS = set("""a an the and or to of for from with without in on at by as into across
is are was were be been being we our us you your they their it its this that these those
can could will would may might must should have has had do does did not no yes more most
all some any each other such than then when where which who how why what
turn turns turning make makes making made help helps helping get gets explore discover
learn read view see find start contact request tell use uses using used build built
create creates creating provide provides offering offers deliver delivers developed
home homepage about welcome overview selected project projects solution solutions
service services company limited ltd inc corporation group team teams website page pages
click here back next previous menu navigation login sign privacy policy terms cookies
copyright reserved rights subscribe newsletter latest news article articles blog
one two three first new real trusted forward together thank thanks please
available information details example examples useful important need needs want wants
""".split())
CONNECTORS.update({'plan','retrieve','derive','moves','moving','key','results','core','capabilities','related','client','context','ecosystem'})
CONNECTORS.update({'through','execute','faster','starting','today','www','com','net','org','io'})
CONNECTORS.difference_update({'service','services','support','learning'})
TOKEN = re.compile(r"[A-Za-z][A-Za-z0-9]*(?:['’][A-Za-z]+)?")


def tokens(value):
    return [m.group().lower() for m in TOKEN.finditer(value)]


def phrase_pattern(phrase):
    if han_count(phrase):
        # Chinese phrases have no word boundaries; allow spacing around mixed
        # Latin terms without flattening unrelated words in the source.
        pieces=re.findall(HAN+r'|[A-Za-z0-9]+|[&+·()（）-]',phrase)
        return r'\s*'.join(re.escape(p) for p in pieces) if pieces else r'(?!)'
    parts=[]
    for t in tokens(phrase):
        if len(t)>4 and not t.endswith(('ss','is')):
            t=t[:-1] if t.endswith('s') else t
            parts.append(re.escape(t)+'s?')
        else:parts.append(re.escape(t))
    return r'(?<!\w)' + r'[\W_]+'.join(parts) + r'(?!\w)'


def extract_english_candidates(pages):
    """Rank observed phrases, not generated catalog labels or search demand.

    At most 10,000 distinct 2–4-word candidates; capped source text and per-unit
    credit limit runtime and repeated-keyword inflation. Heading/title evidence
    weighs more than a body mention. Outputs may be fewer than ten.
    """
    sources = []
    brands = set()
    for page in pages:
        original = BeautifulSoup(page.body, 'html.parser')
        domain = urlsplit(page.url).hostname.removeprefix('www.').split('.')[0]
        brands.add(domain.lower())
        for node in original.select('nav [aria-label],header [aria-label],[role=navigation] [aria-label]'):
            if re.search(r'home|logo',str(node.get('aria-label','')),re.I) and 1<=len(tokens(node.get_text(' ',strip=True)))<=4:
                brands.add(' '.join(tokens(node.get_text(' ',strip=True))))
        # Explicitly labelled client/customer names are entity context, not the
        # site's own service-keyword opportunity. Product names remain eligible.
        for heading in original.select('h2,h3,h4')[:100]:
            previous = heading.find_previous_sibling()
            if previous and ' '.join(tokens(previous.get_text(' ',strip=True))) in {'client','customer','partner','client context','client name','customer name'}:
                brands.add(' '.join(tokens(heading.get_text(' ',strip=True))))
        for h in original.select('h3,h4')[:100]:
            context=h.find_parent('section')
            context_heading=context.find(['h2']) if context is not None else None
            if context_heading and re.search(r'\b(?:case|proof|portfolio|clients|projects)\b',context_heading.get_text(' ',strip=True),re.I):
                observed=TOKEN.findall(h.get_text(' ',strip=True))
                if observed and re.search(r'[a-z][A-Z]',observed[0]):brands.add(observed[0].lower())
        # Brand names are used only as exclusion hints, never as trusted facts.
        import json
        for script in original.select('script[type="application/ld+json"]')[:20]:
            try:
                stack = [json.loads(script.get_text())]
                for _ in range(300):
                    if not stack:break
                    value = stack.pop()
                    if isinstance(value, dict):
                        kind = value.get('@type', '')
                        if isinstance(kind,str) and kind in ('Organization', 'LocalBusiness', 'Corporation'):
                            for name in ('name','legalName','alternateName'):
                                raw = value.get(name)
                                if isinstance(raw,str):brands.add(' '.join(tokens(raw)))
                        stack.extend(value.values())
                    elif isinstance(value,list):stack.extend(value[:300])
            except (ValueError, RecursionError):
                pass
        soup, title, headings, blocks = clean_page(page.url, page.body)
        units = [(title.split('|')[0], 10)]
        units += [(h.get_text(' ',strip=True), 13 if h.name in {'h2','h3','h4'} and small_section(h) is not None else 9 if h.name=='h1' else 7) for h in soup.select('h1,h2,h3,h4')[:100] if not negative_question(h)]
        for m in original.select('meta[name="description"]')[:1]:
            units.append((str(m.get('content','')), 4))
        units += [(b,1) for b in blocks[:250]]
        sources.append((page.url, units))
    counts = {}
    for url, units in sources:
        page_counts = {}
        for raw, weight in units:
            if boilerplate(raw):continue
            raw=re.sub(r'\([A-Z0-9]{2,8}\)', '', raw[:2400])
            spans = re.split(r'[.!?;:|/,&\n–—]+|'+HAN+'+',raw)
            seen_unit = set()
            for span in spans:
                words = tokens(span)
                for i in range(len(words)):
                    for length in (2,3,4):
                        group = words[i:i+length]
                        if len(group)!=length or any(w in CONNECTORS for w in group):continue
                        if all(w in (STOP | {'ai','idea','ideas','innovation','assisted','driven','powered','based','guided','enhanced','ready','live','global','secure'}) or len(w)<2 for w in group):continue
                        # A generic word can qualify a specific phrase, but a
                        # generic-only fragment cannot become a topic.
                        if group[0] in {'live','ready','secure','better','custom','specialised','specialized','focused'}:continue
                        phrase = ' '.join(group)
                        if any(re.search(r'(?<!\w)'+re.escape(brand)+r'(?!\w)',phrase) or re.search(r'(?<!\w)'+re.escape(phrase)+r'(?!\w)',brand) for brand in brands if brand):continue
                        if phrase in seen_unit:continue
                        seen_unit.add(phrase)
                        if phrase not in counts and len(counts)>=10000:continue
                        original_words = TOKEN.findall(span)[i:i+length]
                        item = counts.setdefault(phrase, dict(label=' '.join(original_words), pages=set(), heading=False, complete_heading=False, service_section=False, scores={}))
                        item['pages'].add(url)
                        item['heading'] |= weight>=7
                        item['complete_heading'] |= weight>=7 and group==words
                        item['service_section'] |= weight>=13 and group==words
                        page_counts[phrase] = min(24,page_counts.get(phrase,0)+weight)
            # Per-unit presence, not raw repetition, earns candidate credit.
        for phrase, credit in page_counts.items():counts[phrase]['scores'][url]=credit
    ranked = []
    for phrase, item in counts.items():
        score = sum(item['scores'].values()) + 3*len(item['pages']) + (5 if item['heading'] else 0)
        if not item['heading'] and score<10:continue
        # Prefer informative observed phrases over broad two-word fragments.
        score *= 1 + .12*(len(tokens(phrase))-2)
        ranked.append((score, phrase, item))
    ranked.sort(key=lambda x:(not x[2]['service_section'],not x[2]['complete_heading'],not x[2]['heading'],-x[0],-len(tokens(x[1])),x[1]))
    selected = []
    for score, phrase, item in ranked:
        wordset=set(tokens(phrase))
        # Collapse overlapping phrases, including plural variants. No unrelated
        # industry label or synthetic 'AI' prefix is introduced.
        stem=lambda w:w[:-1] if len(w)>4 and w.endswith('s') and not w.endswith(('ss','is')) else w
        wordset={stem(w) for w in wordset}
        if any(wordset <= old or old <= wordset or len(wordset&old)/len(wordset|old)>=.5 for _,_,old,_ in selected):continue
        label = ' '.join(w if w.isupper() else w.capitalize() for w in item['label'].split())
        selected.append((phrase,label,wordset,round(score,2)))
        if len(selected)==60:break
    return [(hashlib.sha256(phrase.encode()).hexdigest()[:12],label,phrase_pattern(phrase),[phrase],score) for phrase,label,_,score in selected]


def topic_hints(pages):
    """Observed own-brand and explicitly disclaimed third-party hints, not facts."""
    own, third = set(), set()
    import json
    for page in pages:
        doc=BeautifulSoup(page.body,'html.parser')
        for a in doc.select('a[href]')[:300]:
            target=urlsplit(urljoin(page.url,a['href']))
            label=a.get_text(' ',strip=True) or str(a.get('aria-label',''))
            if target.hostname==urlsplit(page.url).hostname and target.path in ('','/') and 1<=len(label)<=45:
                # Home CTAs are navigation, not identity.
                if label.lower() not in {'home','homepage','首頁','首页','返回選號','返回首页','back','返回免費選號工具'} and not re.search(r'返回|back|免費|free',label,re.I):own.add(label)
        for ld in doc.select('script[type="application/ld+json"]')[:20]:
            try:
                stack=[json.loads(ld.get_text())]
                for _ in range(300):
                    if not stack:break
                    n=stack.pop()
                    if isinstance(n,dict):
                        kinds=n.get('@type',[]);kinds=[kinds] if isinstance(kinds,str) else kinds
                        if isinstance(kinds,list) and set(kinds)&{'Organization','LocalBusiness','Corporation','WebSite','SoftwareApplication','WebApplication'}:
                            own.update(n[k] for k in ('name','legalName','alternateName') if isinstance(n.get(k),str))
                        stack.extend(n.values())
                    elif isinstance(n,list):stack.extend(n[:300])
            except (ValueError,RecursionError):pass
        for block in doc.select('p')[:300]:
            value=block.get_text(' ',strip=True)
            if re.search(r'not affiliated|independent.{0,60}(?:not|unaffiliated)|並非|并非|無隸屬|无隶属|無關|无关',value,re.I):
                third.update(re.findall(r'\b[A-Z][A-Z0-9]{2,}\b',value))
    return own,third


def boilerplate(value):
    # Generic disclosure labels, not any business phrase containing "analytics".
    value=' '.join(value.strip().split())
    return bool(re.fullmatch(r'(?:網站流量統計|网站流量统计|官方資料來源|官方资料来源|(?:official |data )?sources|website (?:traffic )?(?:analytics|statistics)|privacy(?: policy)?|cookie(?: policy| notice)?|遠離沉迷|远离沉迷|戒賭支援|戒赌支援|responsible gambling)',value,re.I) or re.search(r'(?:本(?:正式)?網站使用 Google Analytics|this (?:production )?website uses Google Analytics)',value,re.I))


def negative_question(heading):
    if not re.search(r'[?？]',heading.get_text()):return False
    section=small_section(heading)
    first=section.find('p') if section is not None else None
    return bool(first and re.match(r'^(?:不可以|不能|無法|无法|不會|不会|no[,.!\s]|not possible)',first.get_text(' ',strip=True),re.I))


def heading_subjects(value):
    """Trim question framing; return observed spans, never concatenate fragments."""
    if re.search(r'何時|何时|按甚麼次序|按什么次序|在哪裡|在哪里',value):return []
    value=re.sub(r'^[\s¿?？]+|[\s?？。！!]+$','',value)
    value=re.sub(r'^(?:甚麼是|什么是|何謂|如何|怎樣|怎样|在哪裡|在哪里)\s*','',value)
    value=re.sub(r'(?:有甚麼分別|有什麼區別|有什麼分別|是甚麼|是什么|怎樣計算|如何計算|如何计算|從哪裡來|从哪里来|有幫助嗎|準確嗎|幾點更新).*$','',value).strip()
    # Full-heading phrases and list members both must remain source substrings.
    return [x.strip() for x in re.split(r'[|｜·・、，,：:;；]|(?:和|與|与|及)(?=[^\s])',value) if x.strip()]


def positive_claims(value):
    # Preserve intact positive paragraphs and only split mixed denial contexts.
    if not re.search(r"不提供|不支援|不支持|不再|並非|并非|\b(?:do not|does not|don't|doesn't|not available|not offered|no longer)\b",value,re.I):return [value]
    # Split only at observed sentence/claim boundaries; retain source substrings.
    clauses=re.split(r'(?<=\.)\s+|(?<=[。！？!?;；])\s*|(?<=[，,])\s*(?=(?:並非|并非|不提供|不支援|不支持|does not|do not))',value)
    return [c.strip() for c in clauses if c.strip() and not explicitly_denies(c)]


def extract_candidates(pages):
    """Conservative local Chinese fallback: complete source headings, no n-grams.

    Retain the existing English path. Chinese headings supply candidates only;
    actual substantive body support is still required by analyze_topics.
    """
    english=extract_english_candidates(pages)
    found={}
    generic={'首頁','首页','關於我們','关于我们','聯絡我們','联系我们','服務','服务',
             '我們的服務','我们的服务','解決方案','解决方案','最新消息','案例','產品','产品',
             '公司簡介','公司简介','了解更多','我們的優勢','我们的优势','專業服務','专业服务'}
    for page in pages:
        original=BeautifulSoup(page.body,'html.parser')
        brands=set()
        import json
        for ld in original.select('script[type="application/ld+json"]')[:20]:
            try:
                stack=[json.loads(ld.get_text())]
                for _ in range(300):
                    if not stack:break
                    n=stack.pop()
                    if isinstance(n,dict):
                        if n.get('@type') in ('Organization','LocalBusiness','Corporation'):
                            brands.update(v for k,v in n.items() if k in {'name','legalName','alternateName'} and isinstance(v,str) and han_count(v))
                        stack.extend(n.values())
                    elif isinstance(n,list):stack.extend(n[:300])
            except (ValueError,RecursionError):pass
        soup,title,_,_=clean_page(page.url,page.body)
        units=[(h.get_text(' ',strip=True),16 if h.name=='h1' else 13 if small_section(h) is not None else 9) for h in soup.select('h1,h2,h3,h4')[:100] if not negative_question(h)]
        units += [(part.strip(),7) for part in re.split(r'[|｜—–]',title)]
        for label,weight in [(part,w) for raw,w in units for part in heading_subjects(raw)]:
            if not han_count(label) or label in generic or not keyword_valid(label):continue
            if any(brand in label for brand in brands):continue
            key=label.casefold()
            # Use bigram features for duplicate overlap only, never as keywords.
            item=found.setdefault(key,[label,0,set()])
            if page.url not in item[2]:item[1]+=weight;item[2].add(page.url)
    chinese=[];seen=[]
    for key,(label,weight,_) in sorted(found.items(),key=lambda row:-row[1][1]):
        features=keyword_features(label)
        if any(len(features&old)/max(1,len(features|old))>=.8 for old in seen):continue
        seen.append(features)
        chinese.append((hashlib.sha256(key.encode()).hexdigest()[:12],label,phrase_pattern(label),[label],weight))
        if len(chinese)==60:break
    # Prefer Chinese headings on Chinese/mixed sites; English-only output stays
    # unchanged. The final scorer still caps supported cards at nine.
    own,third=topic_hints(pages)
    combined=[]
    for item in chinese+english:
        key,label,pattern,ideas,weight=item
        if boilerplate(label):continue
        # Explicitly disclaimed organizations are not the site's own offering.
        if any(re.search(r'(?<!\w)'+re.escape(name)+r'(?!\w)',label,re.I) for name in third):continue
        if any(name.casefold() in label.casefold() for name in own if name):continue
        combined.append(item)
    return combined


PROCESS = r'\b(?:review|assess|collect\w*|extract\w*|retriev\w*|train\w*|calculat\w*|integrat\w*|translat\w*|record\w*|annotat\w*|modelling|modeling|rigging|motion capture|workflow\w*)\b|評估|评估|收集|擷取|提取|檢索|检索|訓練|训练|計算|计算|整合|集成|翻譯|翻译|標註|标注|工作流程'
DETAIL = r'\b(?:inputs?|outputs?|security|cloud|deployment|scope [123]|ocr|phonetic|dataset|benchmark|methodology|motion capture)\b|輸入|输入|輸出|输出|安全|雲端|云端|部署|資料集|数据集|方法|語音|语音'
SCOPE = r'\b(?:research|preprint|benchmark|limitations?|may need|not guaranteed|designed for|project|scope [123]|prototype)\b|研究|預印本|预印本|限制|不保證|不保证|可能需要|項目|项目|原型'


def matches(pattern, value):
    return bool(re.search(pattern, value, re.I))


def discovery_key(url):
    parsed = urlsplit(url)
    path = re.sub(r'(?:/index\.html?|\.html?)$', '', parsed.path).rstrip('/') or '/'
    return (parsed.hostname.removeprefix('www.'), path, parsed.query)


def clean_page(url, body):
    soup = BeautifulSoup(body, 'html.parser')
    title = soup.title.get_text(' ', strip=True) if soup.title else ''
    for node in soup.select('head, script, style, template, noscript, nav, footer, form, [hidden], [aria-hidden="true"]'):
        node.decompose()
    for h in list(soup.select('h1,h2,h3,h4')):
        if not boilerplate(h.get_text(' ',strip=True)):continue
        section=h.find_parent(['section','aside'])
        if section is not None and len(section.select('h1,h2,h3,h4'))<=1:
            section.decompose()
        else:
            # Heading siblings until the next peer heading are one disclosure.
            for sibling in list(h.next_siblings):
                if getattr(sibling,'name',None) in {'h1','h2','h3','h4'}:break
                if getattr(sibling,'decompose',None):sibling.decompose()
            h.decompose()
    # Ignore large ancestor containers: otherwise unrelated terms anywhere in the
    # page could make a one-word topic appear AI-related.
    blocks = []
    for n in soup.select('p, li, dd, dt, blockquote'):
        value = n.get_text(' ', strip=True)
        if value and len(value) <= 2400 and value not in blocks:
            blocks.append(value)
    headings = ' '.join(n.get_text(' ', strip=True) for n in soup.select('h1,h2,h3,h4'))
    return soup, title, headings, blocks


def explicitly_denies(value):
    denied = matches(r"\b(?:do not|does not|don't|doesn't|no longer)\s+(?:offer|provide|support|build|develop|sell)\b|\b(?:not available|not offered)\b|(?:不再|並不|并不|不|未)(?:提供|支援|支持|承接|開發|开发|銷售|销售)|(?:並非|并非).{0,12}(?:服務|服务)", value)
    if not denied:return False
    clauses=re.split(r'\.\s+|[。！？!?;；]|[，,](?=\s*(?:並非|并非|不提供|不支援|does not|do not))',value)
    for clause in clauses:
        if not clause.strip() or clause==value:continue
        if re.search(r'(?:提供|支援|支持|\b(?:provide|offer|support)s?\b)',clause,re.I) and not re.search(r'不|未|\b(?:not|no)\b',clause,re.I):return False
    return True


def small_section(node):
    """Nearest bounded service card, including button/div cards; never a whole hub."""
    for section in node.parents:
        if section.name not in {'button','div','a','section','article'}:continue
        if len(section.select('h1,h2,h3,h4'))<=3 and section.select('p,li,dd,dt'):
            if len(section.get_text(' ',strip=True))<=2400:return section
    return None


def page_segments(page, index, *, budget=2400):
    """Representative heading/description pairs, not just the start of a long page."""
    soup,title,_,blocks=clean_page(page.url,page.body)
    rows=[];seen=set()
    def add(kind,value,limit):
        nonlocal budget
        value=re.sub(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}', '[email omitted]',value)
        value=' '.join(value.split())[:min(limit,budget)]
        if not value or (kind,value) in seen or (kind=='body' and not substantive(value)):return
        seen.add((kind,value));rows.append((kind,value));budget-=len(value)
    add('title',title,160)
    for h in soup.select('h1')[:1]:add('heading',h.get_text(' ',strip=True),100)
    # One short introductory passage plus balanced service/card representation.
    if blocks:add('body',blocks[0],180)
    sections=[];names=set()
    for h in soup.select('h2,h3,h4')[:100]:
        name=' '.join(h.get_text(' ',strip=True).split())
        section=small_section(h)
        if section is not None and name.casefold() not in names:
            sections.append((h,section));names.add(name.casefold())
    sections.sort(key=lambda pair:pair[0].name!='h3')
    selected=sections[:9]
    pair_budget=max(70,min(220,(budget-160)//max(1,len(selected))))
    for h,section in selected:
        add('heading',h.get_text(' ',strip=True),min(75,pair_budget//3))
        for node in section.select('p,li,dd,dt'):
            value=node.get_text(' ',strip=True)
            if substantive(value):
                add('body',value,max(45,pair_budget-min(75,pair_budget//3)));break
    if not selected:
        for h in soup.select('h2,h3,h4')[:9]:add('heading',h.get_text(' ',strip=True),80)
    for value in blocks[:80]:
        if budget<40:break
        add('body',value,200)
        if len(rows)>=30:break
    for n in soup.select('a[href]'):
        if budget<20:break
        if str(n.get('href','')).startswith(('mailto:','tel:')):continue
        add('link',n.get_text(' ',strip=True),70)
        if sum(k=='link' for k,_ in rows)>=3:break
    return [dict(segment_id=f'p{index}s{i}',kind=k,text=v) for i,(k,v) in enumerate(rows)]


def related_links(url, body):
    """Bounded same-origin HTML candidates only; no query, asset or API links."""
    soup = BeautifulSoup(body, 'html.parser')
    found = {}
    host = urlsplit(url).hostname
    for a in soup.select('a[href]')[:500]:
        try:
            target = normalize_audit_url(urljoin(url, a['href']), host=host)
            parsed = urlsplit(target)
            if parsed.query or parsed.path.startswith(('/api/', '/cdn-cgi/')):
                continue
            if re.search(r'\.[a-z0-9]+$', parsed.path, re.I) and not parsed.path.endswith(('.html', '.htm')):
                continue
            # Collapse common static aliases for discovery only; actual fetch still
            # uses the observed URL and validates every redirect.
            key = discovery_key(target)[1]
            label = a.get_text(' ', strip=True)
            hint = label + ' ' + parsed.path
            if not label.strip() or matches(r'\b(?:privacy|cookies?|terms|login|sign in|checkout|logout)\b|私隱|隐私|條款|条款|登入|登錄|登录|登出|結帳|结账', hint):
                continue
            hub = key in ('/solutions','/services','/portfolio','/projects','/products','/menu','/treatments','/courses','/collections')
            # Descriptive links before generic calls to action, with stable DOM
            # order. No AI-specific discovery vocabulary.
            generic = matches(r'^(?:view project|read more|learn more|click here|了解更多|閱讀更多|阅读更多|查看項目|查看项目|按此)$',label.strip())
            priority = 0 if hub else 2 if generic else 1
            found.setdefault(key, (priority, target))
        except (ValueError, IntakeBlocked):
            continue
    return [target for _, target in sorted(found.values(), key=lambda x: x[0])][:40]


def analyze_topics(pages, *, suggestions=None):
    """Choose one strongest observed page per site-derived phrase.

    Five independently exposed 0–2 signal checks per group. Repetition does
    not earn extra points. Every score describes only its selected source page.
    """
    prepared = []
    for page in pages:
        soup, title, headings, blocks = clean_page(page.url, page.body)
        blocks=[c for b in blocks for c in positive_claims(b)]
        prepared.append((page, soup, title, headings, blocks))
    cards = []
    proposals = {hashlib.sha256(s['keyword'].casefold().encode()).hexdigest()[:12]: s for s in suggestions or []}
    choices = [(key, s['keyword'], phrase_pattern(s['keyword']), s['search_queries'], None) for key, s in proposals.items()] if suggestions is not None else extract_candidates(pages)
    seen_sections={}
    own,third=topic_hints(pages)
    projects=project_names(pages)
    for key, label, pattern, ideas, relevance in choices:
        if is_project_query(label,projects):continue
        if any((matches(phrase_pattern(c['label']),label) or matches(pattern,c['label'])) and min(len(re.sub(r'\s+','',label)),len(re.sub(r'\s+','',c['label'])))>=4 for c in cards):continue
        if boilerplate(label) or any(n.casefold() in label.casefold() for n in own if n) or any(re.search(r'(?<!\w)'+re.escape(n)+r'(?!\w)',label,re.I) for n in third):continue
        candidates = []
        for page, soup, title, headings, blocks in prepared:
            display_label,qualification=qualify_chinese(label,page)
            if display_label is None:continue
            proposal = proposals.get(key)
            semantic = [m for m in (proposal or {}).get('semantic_matches',[]) if m['source_url']==page.url and not explicitly_denies(m['text'])]
            if proposal and page.url not in {e['source_url'] for e in proposal['evidence']} and not semantic:
                continue
            relevant = [b for b in blocks if matches(pattern, b) and not explicitly_denies(b)]
            for m in semantic:
                if m['kind']=='body':
                    for b in blocks:
                        if m['text'].casefold() in b.casefold() and b not in relevant and not explicitly_denies(b):relevant.append(b)
                if m['kind'] in {'body','heading'} and m['relation']=='equivalent':
                    for node in soup.select('p,li,h1,h2,h3,h4'):
                        if m['text'].casefold() not in node.get_text(' ',strip=True).casefold():continue
                        section=small_section(node)
                        if section is not None and len(section.select('h1,h2,h3,h4'))<=3:
                            for child in section.select('p,li'):
                                value=child.get_text(' ',strip=True)
                                if value and len(value)<=2400 and not explicitly_denies(value) and value not in relevant:relevant.append(value)
            if proposal:
                for item in proposal['evidence']:
                    if item['source_url'] != page.url:continue
                    quote = item['quote']
                    if explicitly_denies(quote):continue
                    context_blocks = [b for b in blocks if ' '.join(quote.split()).casefold() in ' '.join(b.split()).casefold()]
                    for value in context_blocks:
                        if value not in relevant:relevant.append(value)
                    # A short matched quote is a locator, not the entire topic
                    # description. Include its small semantic section so a
                    # service with detailed adjacent steps is not scored as an
                    # eleven-word offer. Never borrow an unrelated section.
                    for node in soup.select('p,li,h1,h2,h3,h4'):
                        if ' '.join(quote.split()).casefold() not in ' '.join(node.get_text(' ',strip=True).split()).casefold():continue
                        section=small_section(node)
                        if section is not None and len(section.select('h1,h2,h3,h4'))<=3:
                            for child in section.select('p,li'):
                                value=child.get_text(' ',strip=True)
                                if value and len(value)<=2400 and not explicitly_denies(value) and value not in relevant:relevant.append(value)
            # A focused title + H1 supplies context to follow-on paragraphs;
            # recording/annotation details need not repeat 'voice' every time.
            # Heading context also applies to a small section/card's following
            # description, without borrowing other sections on the page.
            for heading in soup.select('h1,h2,h3,h4'):
                if not matches(pattern,heading.get_text(' ',strip=True)):continue
                for sibling in heading.find_next_siblings():
                    if sibling.name in {'h1','h2','h3','h4','section','article','aside'}:break
                    if sibling.name in {'p','li'}:
                        for value in positive_claims(sibling.get_text(' ',strip=True)):
                            if value and len(value)<=2400 and value not in relevant:relevant.append(value)
                section=small_section(heading)
                if section is not None and len(section.select('h1,h2,h3,h4'))<=3:
                    for node in section.select('p,li'):
                        value=node.get_text(' ',strip=True)
                        if value and len(value)<=2400 and not explicitly_denies(value) and value not in relevant:relevant.append(value)
            h1 = ' '.join(n.get_text(' ', strip=True) for n in soup.select('h1'))
            relevant=list(dict.fromkeys(c for b in relevant for c in positive_claims(b)))
            explanations = [b for b in relevant if content_units(b) >= 20]
            substantive_blocks = [b for b in relevant if substantive(b)]
            if not substantive_blocks:
                continue
            joined = ' '.join(substantive_blocks)
            words = content_units(joined)
            heading_hit = matches(pattern, headings)
            title_hit = matches(pattern, title)
            def alignment(kind, literal=False):
                return max([1.0 if literal else 0.0]+[1.0 if m['relation']=='equivalent' else .5 for m in semantic if m['kind']==kind])
            title_alignment=alignment('title',title_hit)
            heading_alignment=alignment('heading',heading_hit)
            if qualification:
                # Separate qualifier/subject presence is partial alignment, not
                # an invented literal match for the composed search query.
                title_alignment=1.0 if matches(phrase_pattern(display_label),title) else .5 if title_hit and qualification['text'] in title else 0.0
                heading_alignment=1.0 if matches(phrase_pattern(display_label),headings) else .5 if heading_hit and qualification['text'] in headings else 0.0
            def aspect(name):
                return max([0.0]+[1.0 if m['relation']=='equivalent' else .5 for m in semantic if m['kind']=='body' and name in m.get('aspects',[])])
            related_only=bool(semantic) and not any(m['relation']=='equivalent' for m in semantic) and not any(matches(pattern,b) for b in substantive_blocks)
            content_cap=10 if related_only else 20
            page_words = sum(content_units(b) for b in blocks)
            focus = min(1, words / max(1, page_words))
            links = [a for a in soup.select('a[href]') if matches(pattern, a.get_text(' ', strip=True))]
            link_alignment=alignment('link',bool(links))
            # Only HTTPS links actually in a relevant content section supply a
            # provenance signal; no fetch or authority/accuracy claim is made.
            references = []
            for a in soup.select('a[href]'):
                container = a.find_parent(['section', 'article'])
                semantic_context=container is not None and any(m['relation']=='equivalent' and m['kind'] in {'body','heading'} and m['text'].casefold() in container.get_text(' ',strip=True).casefold() for m in semantic)
                if container is None or not (matches(pattern, container.get_text(' ', strip=True)) or semantic_context):
                    continue
                try:
                    dest = urlsplit(urljoin(page.url, a['href']))
                    if dest.scheme == 'https' and dest.hostname and dest.hostname != urlsplit(page.url).hostname and not dest.username and not dest.password:

                        if matches(pattern,a.get_text(' ',strip=True)):references.append(dest.geturl())
                except ValueError:
                    continue
            direct=[b for b in substantive_blocks if matches(pattern,b)]
            evidence = (direct[0] if direct else substantive_blocks[0])[:320]
            def row(name, points, observation, action):
                return dict(label=name, points=points, maximum=20, evidence=observation, recommendation=action)
            seo = [
                row('Topic alignment in title / headings', round(10*(title_alignment+heading_alignment)), f'Title alignment: {title_alignment}; heading alignment: {heading_alignment}. Exact or equivalent = 1; related = 0.5.', 'Describe the topic clearly in its title and heading; equivalent wording is accepted.'),
                row('Explanatory topic content', min(content_cap,max(20 if words >= 100 else 10,round(20*aspect('explanation')))), f'{words:g} content units (English words / Chinese-character pairs) in matched blocks; semantic explanation strength: {aspect("explanation")}.', 'Explain the user need and how this capability addresses it; equivalent wording counts.'),
                row('Practical detail signals', min(content_cap,max(20 if matches(DETAIL, joined) and words >= 100 else 10 if matches(DETAIL, joined) else 0,round(20*aspect('detail')))), f'Practical terms: {matches(DETAIL,joined)}; semantic detail strength: {aspect("detail")}.', 'Describe relevant inputs, outputs and delivery constraints with concrete examples.'),
                row('Content focus', min(content_cap,20 if focus >= .45 else 10 if focus >= .15 else 0), f'{round(focus*100)}% of extracted content words occur in matched blocks.', 'Provide a coherent topic section; a separate page is optional.'),
                row('Descriptive topic links', round(20*link_alignment), f'Link alignment: {link_alignment}; exact or equivalent labels receive full credit; destinations not checked.', 'Use descriptive links connecting this topic with related evidence or service details; natural equivalent wording counts.'),
            ]
            geo = [
                row('Topic explanation', min(content_cap,max(20 if explanations else 10,round(20*aspect('explanation')))), f'Source-backed topic explanation; semantic strength: {aspect("explanation")}.', 'Write a self-contained explanation of the capability and who it helps.'),
                row('Provider association', 20 if matches(r'\b(?:we|our)\b|我們|我们|本公司', joined)  else 10, 'First-person provider wording observed; punctuation is not identity evidence. Identity still needs human review.', 'Explicitly identify the provider and its role in the described capability.'),
                row('Process signals', min(content_cap,max(20 if matches(PROCESS, joined) and words >= 100 else 10 if matches(PROCESS, joined) else 0,round(20*aspect('process')))), f'Process terms: {matches(PROCESS,joined)}; semantic process strength: {aspect("process")}.', 'Explain the steps, inputs and resulting outputs in plain language.'),
                row('Linked supporting material', 10 if references else 0, f'{len(set(references))} external HTTPS links with topic-matching labels in bounded sections; link presence only; claim support not verified.', 'Where appropriate, link relevant original research, demonstrations or verified case evidence.'),
                row('Scope signals', min(content_cap,max(20 if matches(SCOPE, joined) and words >= 100 else 10 if matches(SCOPE, joined) else 0,round(20*aspect('scope')))), f'Scope terms: {matches(SCOPE,joined)}; semantic scope strength: {aspect("scope")}; correctness unverified.', 'State whether this is research, a past project or a current service and describe its limitations.'),
            ]
            result = dict(id=key, label=display_label, seo=sum(x['points'] for x in seo), geo=sum(x['points'] for x in geo),
                          source_url=page.url, content_sha256=hashlib.sha256(page.body).hexdigest(), evidence=evidence,
                          evidence_mode=getattr(page,'evidence_mode','initial HTTP HTML'), raw_sha256=getattr(page,'raw_sha256',None),
                          query_ideas=[display_label] if qualification else ideas, query_construction=qualification, relevance_score=relevance, demand_status='not measured', selection_method='observed site phrases', seo_checks=seo, geo_checks=geo,
                          recommendations=list(dict.fromkeys(c['recommendation'] for c in seo+geo if c['points'] < 20))[:3])
            if proposal:
                result.update(selection_method='Kimi suggestion with source-matched quotations', rationale=proposal['reason'], intent=proposal['intent'], supporting_evidence=proposal['evidence'],
                              semantic_matches=semantic, matching_method='semantic + literal' if semantic else 'literal + quoted context')
            if qualification:result['matching_method']='context-qualified source subject'
            candidates.append((result['seo']+result['geo'], words, result))
        if candidates:
            winner=max(candidates,key=lambda x:(x[0],x[1]))[2]
            if any(re.sub(r'\s+','',c['label']).casefold()==re.sub(r'\s+','',winner['label']).casefold() for c in cards):continue
            section_keys=set()
            for pp,ss,_,_,_ in prepared:
                for hh in ss.select('h1,h2,h3,h4'):
                    if not matches(pattern,hh.get_text(' ',strip=True)):continue
                    parent=hh if hh.get('id') else hh.find_parent(id=True)
                    original=BeautifulSoup(pp.body,'html.parser')
                    alternates=[urljoin(pp.url,a.get('href','')) for a in original.select('link[rel="alternate"][hreflang][href]') if urlsplit(urljoin(pp.url,a.get('href',''))).hostname==urlsplit(pp.url).hostname]
                    if parent and alternates:section_keys.add((tuple(sorted(set([pp.url]+alternates))),parent['id']))
            script='zh' if han_count(label) else 'en'
            if any(k in seen_sections and seen_sections[k]!=script for k in section_keys):continue
            seen_sections.update({k:script for k in section_keys})
            cards.append(winner)
            if len(cards)==MAX_TOPICS:break
    for card in cards:
        for group in ('seo','geo'):
            card[group]=round(card[group]/10,1)
            for check in card[group+'_checks']:
                check['points']=round(check['points']/10,1)
                check['maximum']=2
    semantic_used=any(c.get('semantic_matches') for c in cards)
    return dict(version='kimi-semantic-0.7' if semantic_used else 'kimi-keywords-0.6' if suggestions is not None else TOPIC_VERSION, status='experimental content signals', topics=cards, pages_reviewed=len({p.url for p in pages}), capture_variants_reviewed=len(pages),
                candidate_limit=MAX_TOPICS, score_maximum=10, content_languages=topic_language(pages), selection='Up to nine source-supported discovery queries; project names excluded and short Chinese subjects qualified from observed page context. Relevance is not search popularity.', demand={'status':'not measured','source':None,'search_volume':None,'competition':None},
                limitations=['Scores reflect text/structure signals on the selected page; they are not ranking percentages or AI citation probabilities.',
                             'Query ideas are unvalidated suggestions; popularity, cost and competition are not measured.',
                             'Research and past-project mentions do not establish a currently available service.',
                             'Chinese/English extraction is experimental. Local Chinese suggestions use observed headings, not a segmentation dictionary; script variants and synonyms require semantic review. Content units are heuristics, not word counts or quality judgments. Missing phrases do not establish site-wide absence.',
                             'Not comparable with manual keyword-editorial-pilot-0.1 scores or the technical page rubric.'])
