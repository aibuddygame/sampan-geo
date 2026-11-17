"""Bounded Chinese/English text heuristics, not a linguistic quality model.

Never rewrite quoted source text or convert scripts. A pair of Han characters
counts as one approximate content unit; this is not a Chinese word count.
"""
import re
import unicodedata

HAN = r"[\u3400-\u4dbf\u4e00-\u9fff\U00020000-\U0002fa1f]"
HAN_RE = re.compile(HAN)
LATIN_RE = re.compile(r"[A-Za-z][A-Za-z0-9]*(?:['’][A-Za-z]+)?")


def han_count(value):
    return len(HAN_RE.findall(value))


def content_units(value):
    # Preserve existing English whitespace counts. Count mixed strings without
    # treating a whole Chinese paragraph as a single word or double counting it.
    if not han_count(value):
        return len(value.split())
    return len(LATIN_RE.findall(value)) + han_count(value) / 2


def substantive(value):
    return (han_count(value) >= 8 and len(value) >= 12) or (
        len(value.split()) >= 4 and len(value) >= 30)


def passage(value):
    return len(value) >= 40 or han_count(value) >= 16


def readable_extent(value):
    # Approximate script-adjusted character extent, solely for old length gates.
    return len(value) + 1.5 * han_count(value)


def language_profile(value, declared=""):
    han = han_count(value)
    latin = len(LATIN_RE.findall(value))
    if re.search(r"[\u3041-\u3096\u30a1-\u30fa\uac00-\ud7af]", value) or declared.lower().startswith(('ja', 'ko')):
        language = 'other'
    else:
        language = 'mixed' if han >= 4 and latin >= 4 else 'zh' if han >= 4 else 'en' if latin else 'und'
    return dict(language=language, declared_language=declared[:40], han_characters=han,
                latin_tokens=latin, detection='observed-script heuristic; Chinese script/locale not inferred')


def keyword_valid(value):
    if not re.fullmatch(r"[A-Za-z0-9\u3400-\u4dbf\u4e00-\u9fff\U00020000-\U0002fa1f &+·()（）\-]+", value):
        return False
    count = han_count(value)
    latin = LATIN_RE.findall(value)
    return (2 <= count <= 24 and len(latin) <= 5) if count else 2 <= len(latin) <= 5


def keyword_features(value):
    value = unicodedata.normalize('NFKC', value).casefold()
    features = set(LATIN_RE.findall(value))
    for run in re.findall(HAN + '+', value):
        features.update(run[i:i+2] for i in range(max(1, len(run)-1)))
    return features


def topic_language(pages):
    from bs4 import BeautifulSoup
    profiles=[]
    for page in pages:
        doc=BeautifulSoup(page.body,'html.parser')
        declared=str(doc.html.get('lang','')) if doc.html else ''
        for node in doc.select('head,script,style,template,noscript,nav,footer,form,[hidden],[aria-hidden="true"]'):
            node.decompose()
        profiles.append(dict(source_url=page.url, **language_profile(doc.get_text(' ',strip=True),declared)))
    return profiles
