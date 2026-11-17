"""Bounded scoring fetcher; T001's SafeIntake keeps its strict policy defaults."""
from sampan.audit_urls import normalize_audit_url
import asyncio
import fnmatch
import math
import re
import time
import zlib
from dataclasses import dataclass
from urllib.parse import quote, urljoin, urlsplit

import httpx

from sampan.intake import AGENT, FetchedPage, IntakeBlocked, SafeIntake, normalize_url

_UNRESERVED = frozenset('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~')


def _octets(value: str) -> str:
    encoded = quote(value, safe="%/*?$&=:+,;@!()'-._~")
    return re.sub(r'%([0-9a-fA-F]{2})', lambda m: chr(int(m[1],16)) if chr(int(m[1],16)) in _UNRESERVED else '%'+m[1].upper(), encoded)


@dataclass(frozen=True)
class AuditPolicy:
    rules: tuple[tuple[bool, str], ...]
    interval: float = 1

    def permits(self, url: str) -> bool:
        path = _octets(httpx.URL(url).raw_path.decode('ascii'))
        matches = []
        for allow, pattern in self.rules:
            end = pattern.endswith('$')
            rule = _octets(pattern[:-1] if end else pattern)
            glob = rule.replace('[','[[]').replace('?','[?]') + ('' if end else '*')
            if fnmatch.fnmatchcase(path, glob):
                specificity = len(re.sub(r'%[0-9A-F]{2}', '_', rule.replace('*','')))
                matches.append((specificity, allow))
        return max(matches)[1] if matches else True  # Allow wins equal-length ties.

    @classmethod
    def parse(cls, body: bytes, minimum: float = 1) -> 'AuditPolicy':
        try:
            source = body.decode('utf-8-sig', errors='strict')
        except UnicodeError as exc:
            raise IntakeBlocked('robots policy needs review: not UTF-8') from exc
        if '\x00' in source or source.lstrip().startswith('<'):
            raise IntakeBlocked('robots endpoint returned markup/binary content, not a usable policy')
        groups = []
        agents, rules, delay, started = [], [], minimum, False
        for raw in source.splitlines():
            line = raw.split('#',1)[0].strip()
            if not line or ':' not in line:
                continue  # REP permits extracting usable records from malformed lines.
            key,value = (p.strip() for p in line.split(':',1));key=key.lower()
            if key == 'user-agent':
                if started:
                    groups.append((agents,rules,delay));agents,rules,delay,started=[],[],minimum,False
                if re.fullmatch(r'[A-Za-z0-9_-]+|\*',value):agents.append(value.lower())
                else:raise IntakeBlocked('robots agent syntax needs review')
                continue
            # Unknown extension fields do not end groups or change REP rules.
            if key not in {'allow','disallow','crawl-delay','request-rate','content-signal'}:
                continue
            if not agents:
                continue
            started=True
            if key in {'allow','disallow'}:
                if not value:continue
                if not value.startswith('/') or re.search(r'%(?![0-9A-Fa-f]{2})',value):
                    raise IntakeBlocked('robots path syntax needs review')
                rules.append((key=='allow',value))
            elif key=='content-signal':
                # This audit is not AI training. Honor an explicit search=no extension.
                if re.search(r'(?:^|,)\s*search\s*=\s*no(?:,|$)',value,re.I):rules.append((False,'/'))
            else:
                try:
                    if key=='request-rate':
                        count,seconds=map(float,value.split('/'))
                        if count<=0:raise ValueError
                        rate=seconds/count
                    else:rate=float(value)
                    if not math.isfinite(rate) or rate<0:raise ValueError
                    delay=max(delay,rate)
                except (ValueError,ZeroDivisionError) as exc:
                    raise IntakeBlocked('robots rate syntax needs review') from exc
        groups.append((agents,rules,delay))
        ranked=[]
        for agents,rules,delay in groups:
            lengths=[len(a) for a in agents if a!='*' and a in AGENT.lower()]
            specificity=max(lengths) if lengths else 0 if '*' in agents else -1
            ranked.append((specificity,rules,delay))
        best=max((x[0] for x in ranked),default=-1)
        chosen=[x for x in ranked if x[0]==best and best>=0]
        return cls(tuple(rule for _,rules,_ in chosen for rule in rules),max([minimum]+[d for _,_,d in chosen]))


class AuditIntake(SafeIntake):
    """One authorized page; only its exact hostname and www counterpart may redirect."""
    accept_encoding = 'gzip, deflate'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        alternate=self.host[4:] if self.host.startswith('www.') else 'www.'+self.host
        self.allowed_hosts=frozenset((self.host,alternate))
        self.policies={}
        self.robots_status={}
        self.decoded_bytes=0

    def connection_host(self, url: str) -> str:
        try:host=urlsplit(url).hostname
        except ValueError as exc:raise IntakeBlocked('invalid URL') from exc
        if host not in self.allowed_hosts:
            raise IntakeBlocked('redirect outside the submitted host and its www counterpart')
        normalize_audit_url(url,host=host)
        return host

    def validate_encoding(self, encoding: str) -> None:
        if encoding not in {'identity','gzip','deflate'}:
            raise IntakeBlocked('unsupported response encoding; no fallback request made')

    def decode_body(self, body: bytes, encoding: str, cap: int) -> bytes:
        if encoding=='identity':decoded=body
        else:
            try:
                decoder=zlib.decompressobj(31 if encoding=='gzip' else 15)
                try:decoded=decoder.decompress(body,cap+1)
                except zlib.error:
                    if encoding!='deflate':raise
                    decoder=zlib.decompressobj(-15);decoded=decoder.decompress(body,cap+1)
                if len(decoded)>cap or decoder.unconsumed_tail:
                    raise IntakeBlocked('decompressed response byte limit reached')
                if not decoder.eof or decoder.unused_data:
                    raise IntakeBlocked('incomplete or concatenated compressed response')
            except zlib.error as exc:
                raise IntakeBlocked('malformed compressed response') from exc
        self.decoded_bytes+=len(decoded)
        if self.decoded_bytes>self.limits.max_total_bytes:
            raise IntakeBlocked('decoded run byte limit reached')
        return decoded

    async def policy_for(self, host: str) -> AuditPolicy:
        if host in self.policies:return self.policies[host]
        current='https://'+host+'/robots.txt';seen=set()
        for hop in range(self.limits.max_redirects+1):
            self.connection_host(current)
            if current in seen:raise IntakeBlocked('robots redirect loop')
            seen.add(current)
            status,headers,body=await self._request(current,robots=True)
            if status in (301,302,303,307,308):
                if hop==self.limits.max_redirects or not headers.get('location'):
                    raise IntakeBlocked('robots redirect limit or missing location')
                current=normalize_audit_url(urljoin(current,headers['location']),host=self.connection_host(urljoin(current,headers['location'])));continue
            if status in (404,410):
                policy=AuditPolicy((),self.limits.interval_seconds);state=f'HTTP {status}: no robots file; no REP restrictions observed'
            elif status==200:
                policy=AuditPolicy.parse(body,self.limits.interval_seconds);state='Parsed robots policy'
            else:raise IntakeBlocked('robots unavailable due to HTTP error; no content fetched')
            self.policies[host]=policy;self.robots_status[host]=state
            return policy
        raise IntakeBlocked('robots redirect limit reached')

    async def fetch(self, url: str, *, depth: int = 0) -> FetchedPage:
        async with self._lock:
            if self._closed:raise IntakeBlocked('run is closed')
            try:
                self.check_deadline()
                async with asyncio.timeout(max(0,self._deadline-time.monotonic())):
                    current=normalize_audit_url(url,host=self.connection_host(url))
                    if type(depth) is not int or not 0<=depth<=self.limits.max_depth:raise IntakeBlocked('depth limit reached')
                    if self.pages>=self.limits.max_pages:raise IntakeBlocked('page limit reached')
                    self.pages+=1
                    for hop in range(self.limits.max_redirects+1):
                        host=self.connection_host(current)
                        policy=await self.policy_for(host)
                        self._robots=policy
                        if not policy.permits(current):raise IntakeBlocked('robots disallows URL; no content fetched')
                        if current in self._seen:raise IntakeBlocked('duplicate URL or redirect loop')
                        self._seen.add(current)
                        status,headers,body=await self._request(current)
                        if status in (301,302,303,307,308):
                            if hop==self.limits.max_redirects or not headers.get('location'):
                                raise IntakeBlocked('redirect limit or missing location')
                            current=normalize_audit_url(urljoin(current,headers['location']),host=self.connection_host(urljoin(current,headers['location'])));continue
                        if status!=200:raise IntakeBlocked('unsuccessful page response')
                        if headers.get('content-type','').split(';',1)[0].strip().lower() not in {'text/html','application/xhtml+xml'}:
                            raise IntakeBlocked('response is not HTML')
                        return FetchedPage(current,body,x_robots_tag=headers.get('x-robots-tag'))
            except asyncio.CancelledError:
                self._closed=True;raise
            except (IntakeBlocked,httpx.HTTPError,OSError,TimeoutError) as exc:
                self._closed=True
                if isinstance(exc,IntakeBlocked):raise
                raise IntakeBlocked('network failure or time limit reached') from exc

    async def fetch_asset(self, url: str) -> tuple[str, bytes]:
        """Read-only same-site JS/CSS; shares the page run's DNS/robots/byte budgets."""
        async with self._lock:
            if self._closed:raise IntakeBlocked('run is closed')
            try:
                async with asyncio.timeout(max(0,self._deadline-time.monotonic())):
                    host=self.connection_host(url)
                    parsed=urlsplit(url)
                    if parsed.query or not parsed.path.lower().endswith(('.js','.mjs','.css')):
                        raise IntakeBlocked('renderer supports query-free static JS/CSS assets only')
                    policy=await self.policy_for(host);self._robots=policy
                    if not policy.permits(url):raise IntakeBlocked('robots disallows renderer asset')
                    if url in self._seen:raise IntakeBlocked('duplicate renderer asset')
                    self._seen.add(url)
                    status,headers,body=await self._request(url)
                    if status!=200:raise IntakeBlocked('renderer asset response unsuccessful; redirects are not followed')
                    kind=headers.get('content-type','').split(';',1)[0].strip().lower()
                    allowed={'text/css'} if parsed.path.lower().endswith('.css') else {'text/javascript','application/javascript','application/x-javascript'}
                    if kind not in allowed:raise IntakeBlocked('unexpected renderer asset content type')
                    return kind,body
            except asyncio.CancelledError:
                self._closed=True;raise
            except (IntakeBlocked,httpx.HTTPError,OSError,TimeoutError) as exc:
                self._closed=True
                if isinstance(exc,IntakeBlocked):raise
                raise IntakeBlocked('renderer asset network failure or deadline reached') from exc
