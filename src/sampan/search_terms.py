"""Source-derived project exclusions and contextual Chinese discovery queries.

These are editorial heuristics, not entity ownership or keyword-demand evidence.
"""
import json
from collections import Counter
import re
from urllib.parse import urljoin, urlsplit

from bs4 import BeautifulSoup

from sampan.language import HAN, han_count


def normalized(value):
    return ' '.join(re.findall(r'[A-Za-z0-9]+|'+HAN, value.casefold()))


def project_names(pages):
    """Only name-role evidence: project cards, detail routes, or typed works.

    Explicit Service records override a matching exclusion. A project description
    remains a source of general capabilities; do not blacklist its component words.
    """
    names, services = set(), set()
    for page in pages:
        doc=BeautifulSoup(page.body,'html.parser')
        for card in doc.select('[data-cat], .project-card, .portfolio-card, [data-project]')[:200]:
            heading=card.find(['h2','h3','h4'])
            marker=' '.join(card.get('class',[]))+' '+card.get_text(' ',strip=True)
            portfolio_page=bool(re.search(r'/(?:portfolio|projects?|case-studies|cases)(?:/|$)',urlsplit(page.url).path))
            if heading and (portfolio_page or re.search(r'project[- ]card|portfolio[- ]card|view project|case study|查看項目|項目|案例',marker,re.I)):
                names.add(heading.get_text(' ',strip=True))
        for article in doc.select('article.paper-panel, article.publication, [data-publication]')[:40]:
            heading=article.find(['h2','h3'])
            if heading:names.add(heading.get_text(' ',strip=True))
        path=urlsplit(page.url).path
        # Detail URLs supply a role hint; hub H1s are not project names.
        if re.search(r'/(?:portfolio|projects?|case-studies|cases)/[^/]+/?$',path) and not re.search(r'/index\.html?$',path):
            for h in doc.select('h1')[:1]:names.add(h.get_text(' ',strip=True))
        for block in doc.select('script[type="application/ld+json"]')[:20]:
            try:
                stack=[json.loads(block.get_text())]
                for _ in range(300):
                    if not stack:break
                    item=stack.pop()
                    if isinstance(item,dict):
                        kinds=item.get('@type',[]);kinds=[kinds] if isinstance(kinds,str) else kinds
                        if isinstance(kinds,list):
                            values=[item[k] for k in ('name','alternateName') if isinstance(item.get(k),str)]
                            if 'Service' in kinds:services.update(values)
                            if set(kinds)&{'CreativeWork','SoftwareSourceCode','ResearchProject','Project'}:names.update(values)
                        stack.extend(item.values())
                    elif isinstance(item,list):stack.extend(item[:300])
            except (ValueError,RecursionError):pass
    names={re.sub(r'\s*[（(][A-Z0-9 -]{2,12}[)）]\s*','',n).strip() for n in names}
    return {n for n in names if n and normalized(n) not in {normalized(s) for s in services}}


def is_project_query(label, names):
    query=' '+normalized(label)+' '
    return any(' '+normalized(n)+' ' in query or (len(query.split())>=3 and query in ' '+normalized(n)+' ') for n in names if normalized(n))


def chinese_context(page):
    """A short title/H1 subject, or their repeated prefix in other headings.

    No industry dictionary or translation. A qualifier must be an observed Han
    substring at the start of the title and a heading, not a hostname or brand guess.
    """
    doc=BeautifulSoup(page.body,'html.parser')
    title=doc.title.get_text(' ',strip=True) if doc.title else ''
    head=[h.get_text(' ',strip=True) for h in doc.select('h1,h2,h3')[:80]]
    first=re.match(HAN+'+',title)
    if not first:return None
    run=first.group()
    candidates=[]
    for heading in head:
        other=re.match(HAN+'+',heading)
        if not other:continue
        length=0
        for a,b in zip(run,other.group()):
            if a!=b:break
            length+=1
        prefix=run[:length]
        if 2<=len(prefix)<=6 and prefix not in {'如何','我們','我们','甚麼','什么','今日','最新','免費','免费'}:
            candidates.append(prefix)
    if not candidates:return None
    # Prefer the repeatedly supported subject over an accidental shorter overlap.
    counts=Counter(candidates)
    context=max(counts,key=lambda n:(counts[n],len(n),n))
    return dict(text=context,source_url=page.url,title=title[:180],method='observed title/heading subject')


def qualify_chinese(label,page):
    """Add a proven page subject only to ambiguous 2–3-Han standalone labels."""
    if not re.fullmatch(HAN+'{2,3}',label):return label,None
    context=chinese_context(page)
    if not context or label in context['text']:return None,None
    return context['text']+label,dict(base_phrase=label,**context)
