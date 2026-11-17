"""Private, sequential VX Real intake. No discovery, persistence or API adapter.

Every request dials a validated IP with the original TLS name and Host header.
Robots handling is deliberately restrictive: all applicable disallows apply,
even when an allow or a more specific user-agent group could override them.
"""

import asyncio
import fnmatch
import hashlib
import ipaddress
import math
import re
import socket
import time
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from datetime import datetime, timezone
from urllib.parse import unquote, urljoin, urlsplit

import httpx
from pydantic import BaseModel, ConfigDict, Field, field_validator

HOST = "vxreal.com"
AGENT = "SampanBot"


class IntakeBlocked(ValueError):
    """Collection failed closed; message contains no remote content or secrets."""


class CollectionPermission(BaseModel):
    """Operator-supplied review record; never inferred from website text."""

    model_config = ConfigDict(frozen=True, extra="forbid")
    reviewer: str = Field(min_length=1, max_length=200)
    reviewed_at: datetime
    reference: str = Field(min_length=1, max_length=1000)
    collection_allowed: bool = False
    terms_reviewed: bool = False

    @field_validator("reviewer", "reference")
    @classmethod
    def nonblank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("review record must not be blank")
        return value

    @field_validator("reviewed_at")
    @classmethod
    def timezone_required(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("review timestamp requires timezone")
        return value


class CrawlLimits(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", allow_inf_nan=False)
    max_pages: int = Field(default=10, ge=1, le=10, strict=True)
    max_depth: int = Field(default=2, ge=0, le=2, strict=True)
    max_redirects: int = Field(default=3, ge=0, le=3, strict=True)
    max_requests: int = Field(default=40, ge=1, le=40, strict=True)
    max_response_bytes: int = Field(default=1_000_000, ge=1, le=1_000_000, strict=True)
    max_total_bytes: int = Field(default=10_000_000, ge=1, le=10_000_000, strict=True)
    request_seconds: float = Field(default=10, gt=0, le=10)
    run_seconds: float = Field(default=120, gt=0, le=120)
    interval_seconds: float = Field(default=1, ge=1, le=120)


def normalize_url(value: str, *, host: str = HOST) -> str:
    if not isinstance(value, str) or len(value) > 2048:
        raise IntakeBlocked("invalid URL")
    if any(ord(c) <= 32 or ord(c) >= 127 for c in value) or "\\" in value:
        raise IntakeBlocked("ambiguous URL encoding")
    try:
        parsed = urlsplit(value)
        if (parsed.scheme != "https" or parsed.hostname != host
                or parsed.username is not None or parsed.password is not None
                or parsed.port not in (None, 443)):
            raise IntakeBlocked("URL outside permitted HTTPS origin")
        # Reject alternate authority spellings, empty ports and encoded hosts.
        if parsed.netloc.lower() not in (host, host + ":443"):
            raise IntakeBlocked("ambiguous authority")
        if re.search(r"%(?![0-9a-fA-F]{2})", parsed.path + parsed.query):
            raise IntakeBlocked("invalid percent encoding")
        decoded = unquote(parsed.path + parsed.query)
        if (re.search(r"%25", parsed.path + parsed.query, re.I)
                or "\\" in decoded or any(ord(c) < 32 or ord(c) == 127 for c in decoded)
                or any(part in {".", ".."} for part in unquote(parsed.path).split("/"))):
            raise IntakeBlocked("ambiguous encoded path")
        return str(httpx.URL(value).copy_with(fragment=None))
    except (ValueError, httpx.InvalidURL) as exc:
        raise IntakeBlocked("invalid or disallowed URL") from exc


async def resolve_host(host: str) -> list[str]:
    records = await asyncio.get_running_loop().getaddrinfo(
        host, 443, type=socket.SOCK_STREAM
    )
    return list(dict.fromkeys(record[4][0] for record in records))


def public_addresses(addresses: list[str]) -> list[str]:
    if not addresses:
        raise IntakeBlocked("DNS returned no addresses")
    for address in addresses:
        try:
            ip = ipaddress.ip_address(address)
        except ValueError as exc:
            raise IntakeBlocked("invalid DNS address") from exc
        if (not ip.is_global or ip.is_multicast or "%" in address
                or (isinstance(ip, ipaddress.IPv6Address)
                    and (ip.ipv4_mapped or ip.sixtofour or ip.teredo
                         or ip not in ipaddress.ip_network("2000::/3")))):
            raise IntakeBlocked("DNS includes a non-public address")
    return addresses


@dataclass(frozen=True)
class RobotsPolicy:
    disallows: tuple[str, ...]
    interval: float

    @classmethod
    def parse(cls, body: bytes, base_interval: float) -> "RobotsPolicy":
        try:
            text = body.decode("utf-8-sig", errors="strict")
        except UnicodeError as exc:
            raise IntakeBlocked("robots is not UTF-8") from exc
        agents: list[str] = []
        has_rules = False
        disallows: list[str] = []
        interval = base_interval
        for line in text.splitlines():
            line = line.split("#", 1)[0].strip()
            if not line:
                continue
            if ":" not in line or "\x00" in line:
                raise IntakeBlocked("malformed robots policy")
            key, value = (part.strip() for part in line.split(":", 1))
            key = key.lower()
            if key == "user-agent":
                if has_rules:
                    agents, has_rules = [], False
                if not value or not re.fullmatch(r"[A-Za-z_-]+|\*", value):
                    raise IntakeBlocked("invalid robots agent")
                agents.append(value.lower())
                continue
            if key == "sitemap":
                continue
            if key not in {"allow", "disallow", "crawl-delay", "request-rate"}:
                raise IntakeBlocked("unsupported robots directive requires review")
            if not agents:
                raise IntakeBlocked("robots rule without agent")
            has_rules = True
            if not any(a == "*" or a in AGENT.lower() for a in agents):
                continue
            if key == "disallow" and value:
                if (not value.startswith("/") or any(c.isspace() for c in value)
                        or re.search(r"%(?![0-9a-fA-F]{2})", value)):
                    raise IntakeBlocked("ambiguous robots path")
                disallows.append(value)
            if key in {"crawl-delay", "request-rate"}:
                try:
                    if key == "request-rate":
                        count, seconds = map(float, value.split("/"))
                        delay = seconds / count if count > 0 else float("inf")
                    else:
                        delay = float(value)
                    if not math.isfinite(delay) or delay < 0:
                        raise ValueError
                    interval = max(interval, delay)
                except (ValueError, ZeroDivisionError) as exc:
                    raise IntakeBlocked("invalid robots rate") from exc
        return cls(tuple(disallows), interval)

    def permits(self, url: str) -> bool:
        target = httpx.URL(url).raw_path.decode("ascii")
        # Compare encoded and decoded variants conservatively to avoid encoded
        # path bypasses. Overblocking is intentional; no Allow override.
        variants = {target, unquote(target)}
        for pattern in self.disallows:
            for rule in {pattern, unquote(pattern)}:
                end = rule.endswith("$")
                rule = rule[:-1] if end else rule
                # Escape fnmatch character classes: robots only gives '*' its
                # wildcard meaning. fnmatch avoids pathological regex backtracking.
                glob = rule.replace("[", "[[]").replace("?", "[?]")
                glob += "" if end else "*"
                if any(fnmatch.fnmatchcase(path, glob) for path in variants):
                    return False
        return True


@dataclass(frozen=True)
class FetchedPage:
    url: str
    body: bytes
    fetched_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    x_robots_tag: str | None = None


@dataclass
class RequestRecord:
    url: str
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    finished_at: datetime | None = None
    status_code: int | None = None
    response_content_type: str | None = None
    outcome: str = "pending"
    body_bytes: int = 0
    body_sha256: str | None = None
    error: str | None = None


class SafeIntake:
    """One bounded run; instantiate only after operator policy review.

    Resolver/transport injection is for trusted tests, never remote input.
    All failures close the run; create a new run only after reviewing the cause.
    """

    accept_encoding = "identity"

    def connection_host(self, url: str) -> str:
        """Trusted policy hook; the strict intake remains exact-origin."""
        normalize_url(url, host=self.host)
        return self.host

    def validate_encoding(self, encoding: str) -> None:
        if encoding != "identity":
            raise IntakeBlocked("compressed responses not supported")

    def decode_body(self, body: bytes, encoding: str, cap: int) -> bytes:
        return body

    def __init__(
        self, permission: CollectionPermission, limits: CrawlLimits | None = None,
        *, resolver: Callable[[str], Awaitable[list[str]]] = resolve_host,
        transport: httpx.AsyncBaseTransport | None = None,
        host: str = HOST,
    ):
        if not permission.collection_allowed or not permission.terms_reviewed:
            raise IntakeBlocked("collection permission and terms review required")
        self.host = host
        normalize_url("https://" + host + "/", host=host)
        self.permission = permission
        self.limits = limits or CrawlLimits()
        self._resolver, self._transport = resolver, transport
        self._deadline = time.monotonic() + self.limits.run_seconds
        self._last_request: float | None = None
        self._robots: RobotsPolicy | None = None
        self._seen: set[str] = set()
        self._lock = asyncio.Lock()
        self._closed = False
        self.pages = self.requests = self.bytes_received = 0
        self.request_records: list[RequestRecord] = []

    @property
    def visited_urls(self) -> frozenset[str]:
        return frozenset(self._seen)

    def check_deadline(self) -> None:
        """Allow bounded discovery work to check the same run deadline."""
        self._check_deadline()

    async def _request(self, url: str, *, robots: bool = False) -> tuple[int, httpx.Headers, bytes]:
        record = RequestRecord(url)
        self.request_records.append(record)
        try:
            result = await self._perform_request(url, robots=robots, record=record)
            record.body_sha256 = hashlib.sha256(result[2]).hexdigest()
            record.outcome = "received"
            return result
        except asyncio.CancelledError:
            record.outcome, record.error = "cancelled", "request cancelled or timed out"
            raise
        except (IntakeBlocked, httpx.HTTPError, OSError, TimeoutError) as exc:
            record.outcome = "blocked"
            record.error = str(exc) if isinstance(exc, IntakeBlocked) else "network failure or timeout"
            raise
        finally:
            record.finished_at = datetime.now(timezone.utc)

    async def _perform_request(
        self, url: str, *, robots: bool, record: RequestRecord,
    ) -> tuple[int, httpx.Headers, bytes]:
        self._check_deadline()
        if self.requests >= self.limits.max_requests:
            raise IntakeBlocked("request limit reached")
        interval = self._robots.interval if self._robots else self.limits.interval_seconds
        if self._last_request is not None:
            await asyncio.sleep(max(0, self._last_request + interval - time.monotonic()))
        async with asyncio.timeout(self.limits.request_seconds):
            request_host = self.connection_host(url)
            addresses = public_addresses(await self._resolver(request_host))
            self._check_deadline()
            ip_url = httpx.URL(url).copy_with(host=addresses[0])
            self.requests += 1
            self._last_request = time.monotonic()
            async with httpx.AsyncClient(
                transport=self._transport, trust_env=False, follow_redirects=False,
                timeout=self.limits.request_seconds,
            ) as client:
                async with client.stream(
                    "GET", ip_url,
                    headers={"Host": request_host, "User-Agent": AGENT + "/0.1",
                             "Accept-Encoding": self.accept_encoding,
                             "Accept": "text/plain" if robots else "text/html"},
                    extensions={"sni_hostname": request_host},
                ) as response:
                    record.status_code = response.status_code
                    record.response_content_type = response.headers.get("content-type")
                    if response.status_code in (401, 403, 429):
                        raise IntakeBlocked("remote access blocked or rate limited")
                    encoding = response.headers.get("content-encoding", "identity").strip().lower()
                    self.validate_encoding(encoding)
                    cap = min(self.limits.max_response_bytes, 64_000) if robots else self.limits.max_response_bytes
                    length = response.headers.get("content-length")
                    if length is not None and (not length.isdecimal() or int(length) > cap):
                        raise IntakeBlocked("invalid or oversized content length")
                    content = bytearray()
                    async for chunk in response.aiter_raw():
                        self._check_deadline()
                        self.bytes_received += len(chunk)
                        record.body_bytes += len(chunk)
                        if (len(content) + len(chunk) > cap
                                or self.bytes_received > self.limits.max_total_bytes):
                            raise IntakeBlocked("response or run byte limit reached")
                        content.extend(chunk)
                    decoded = self.decode_body(bytes(content), encoding, cap)
                    self._check_deadline()
                    return response.status_code, response.headers, decoded

    def _check_deadline(self) -> None:
        if time.monotonic() >= self._deadline:
            raise IntakeBlocked("run time limit reached")

    async def fetch(self, url: str, *, depth: int = 0) -> FetchedPage:
        async with self._lock:
            if self._closed:
                raise IntakeBlocked("run is closed")
            try:
                self._check_deadline()
                async with asyncio.timeout(max(0, self._deadline - time.monotonic())):
                    current = normalize_url(url, host=self.host)
                    if type(depth) is not int or not 0 <= depth <= self.limits.max_depth:
                        raise IntakeBlocked("depth limit reached")
                    if self.pages >= self.limits.max_pages:
                        raise IntakeBlocked("page limit reached")
                    self.pages += 1  # Attempts count, including blocked pages.
                    if self._robots is None:
                        status, headers, body = await self._request("https://" + self.host + "/robots.txt", robots=True)
                        if status != 200 or headers.get("content-type", "").split(";", 1)[0].lower() != "text/plain":
                            raise IntakeBlocked("robots unavailable; operator review required")
                        self._robots = RobotsPolicy.parse(body, self.limits.interval_seconds)
                    for hop in range(self.limits.max_redirects + 1):
                        if current in self._seen:
                            raise IntakeBlocked("duplicate URL or redirect loop")
                        if not self._robots.permits(current):
                            raise IntakeBlocked("robots disallows URL")
                        self._seen.add(current)
                        status, headers, body = await self._request(current)
                        if status in (301, 302, 303, 307, 308):
                            if hop == self.limits.max_redirects or not headers.get("location"):
                                raise IntakeBlocked("redirect limit or missing location")
                            current = normalize_url(urljoin(current, headers["location"]), host=self.host)
                            continue
                        if status != 200:
                            raise IntakeBlocked("unsuccessful page response")
                        if headers.get("content-type", "").split(";", 1)[0].lower() not in {"text/html", "application/xhtml+xml"}:
                            raise IntakeBlocked("response is not HTML")
                        return FetchedPage(current, body, x_robots_tag=headers.get("x-robots-tag"))
                    raise IntakeBlocked("redirect limit reached")
            except (IntakeBlocked, httpx.HTTPError, OSError, TimeoutError) as exc:
                self._closed = True
                if isinstance(exc, IntakeBlocked):
                    raise
                raise IntakeBlocked("network failure or time limit reached") from exc
            except asyncio.CancelledError:
                self._closed = True
                raise
