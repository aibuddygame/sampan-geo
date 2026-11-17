"""Bounded HTML-link inventory and private, hash-addressed source snapshots."""

import argparse
import asyncio
import hashlib
import json
import os
import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from urllib.parse import unquote, urljoin, urlsplit
from uuid import uuid4

from bs4 import BeautifulSoup
from pydantic import BaseModel, ConfigDict, Field

from sampan.intake import CollectionPermission, CrawlLimits, IntakeBlocked, SafeIntake, normalize_url

PRIVATE_ROOT = Path(__file__).resolve().parents[2] / "private"
MAX_CANDIDATES = 100
MAX_LINKS_PER_PAGE = 1000
DENIED_SEGMENTS = {
    "login", "logout", "admin", "account", "checkout", "cart", "search",
    "delete", "remove", "unsubscribe", "wp-admin", "wp-login.php",
    "privacy", "terms", "cookies", "api",
}
PRIORITIES = (
    ("about", "company"), ("service", "solution"), ("product",),
    ("project", "portfolio", "case", "work"), ("contact", "team"),
)


def now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass(frozen=True)
class Candidate:
    url: str
    depth: int
    discovered_from: str | None


def link_candidates(body: bytes, base_url: str) -> list[str]:
    """Treat HTML as data; ignore scripts, forms, base tags and canonical hints."""
    soup = BeautifulSoup(body, "html.parser")
    found: set[str] = set()
    for link in soup.find_all("a", href=True, limit=MAX_LINKS_PER_PAGE):
        href = link.get("href")
        if (not isinstance(href, str) or not href or href.startswith("#")
                or link.has_attr("download") or "nofollow" in link.get("rel", [])):
            continue
        try:
            url = normalize_url(urljoin(base_url, href))
        except (IntakeBlocked, ValueError):
            continue
        parsed = urlsplit(url)
        # Query variants can contain personal tokens or unbounded calendars.
        # No query-bearing URLs are stored or fetched by this inventory.
        if parsed.query or len(href) > 2048:
            continue
        path = unquote(parsed.path).lower()
        segments = set(re.split(r"[/_.-]+", path)) | set(path.split("/"))
        if segments & DENIED_SEGMENTS:
            continue
        suffix = Path(path).suffix
        if suffix and suffix not in {".html", ".htm"}:
            continue
        found.add(url)
    return sorted(found, key=lambda url: (priority(url), url))


def priority(url: str) -> int:
    path = unquote(urlsplit(url).path).lower()
    for rank, words in enumerate(PRIORITIES):
        if any(word in path for word in words):
            return rank
    return len(PRIORITIES)


class SourceRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source_id: str
    requested_url: str
    final_url: str
    discovered_from: str | None
    depth: int = Field(ge=0, le=2)
    fetched_at: datetime
    content_sha256: str = Field(pattern=r"^[a-f0-9]{64}$")
    body_bytes: int = Field(ge=0, le=1_000_000)
    snapshot_path: str
    duplicate_content_of: str | None = None


class SourceManifest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: Literal["source-inventory/0.1"] = "source-inventory/0.1"
    run_id: str
    seed_url: str
    started_at: datetime
    finished_at: datetime | None = None
    permission: CollectionPermission
    limits: CrawlLimits
    status: Literal["running", "exhausted", "page_limit", "candidate_limit", "blocked", "cancelled", "failed"] = "running"
    error: str | None = None
    sources: list[SourceRecord] = Field(default_factory=list)
    request_records: list[dict] = Field(default_factory=list)
    content_attempts: int = 0
    http_requests: int = 0
    body_bytes_received: int = 0
    candidates_seen: int = 1
    remaining_candidates: int = 0
    llm_calls: Literal[0] = 0
    model_tokens: Literal[0] = 0
    model_cost_usd: Literal[0] = 0


def _write_exclusive(path: Path, content: bytes) -> None:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "wb") as stream:
        stream.write(content)


def _new_directory(run_id: str) -> Path:
    # All artifacts stay under the repository's ignored private/ tree.
    for directory in (PRIVATE_ROOT, PRIVATE_ROOT / "inventories"):
        if directory.is_symlink():
            raise ValueError("private inventory directory must not be a symlink")
        directory.mkdir(mode=0o700, exist_ok=True)
    directory = PRIVATE_ROOT / "inventories" / run_id
    directory.mkdir(mode=0o700)
    (directory / "pages").mkdir(mode=0o700)
    return directory


def _checkpoint(directory: Path, manifest: SourceManifest, run: SafeIntake) -> None:
    manifest.request_records = [asdict(record) for record in run.request_records]
    manifest.content_attempts = run.pages
    manifest.http_requests = run.requests
    manifest.body_bytes_received = run.bytes_received
    temporary = directory / "manifest.pending"
    _write_exclusive(temporary, manifest.model_dump_json(indent=2).encode() + b"\n")
    temporary.replace(directory / "manifest.json")


async def discover(run: SafeIntake, seed_url: str = "https://vxreal.com/") -> Path:
    """Inventory using one fresh intake run; return its private manifest path."""
    seed = normalize_url(seed_url)
    if urlsplit(seed).query:
        raise ValueError("inventory seed must not contain a query")
    if run.pages or run.request_records:
        raise ValueError("discovery requires a fresh intake run")
    manifest = SourceManifest(
        run_id=str(uuid4()), seed_url=seed, started_at=now(),
        permission=run.permission, limits=run.limits,
    )
    directory = _new_directory(manifest.run_id)
    pending = [Candidate(seed, 0, None)]
    known = {seed}
    content_ids: dict[str, str] = {}
    candidate_limit_hit = False
    _checkpoint(directory, manifest, run)
    try:
        while pending and run.pages < run.limits.max_pages:
            run.check_deadline()
            # Breadth first, then relevant business paths, then stable URL order.
            pending.sort(key=lambda item: (item.depth, priority(item.url), item.url))
            candidate = pending.pop(0)
            if candidate.url in run.visited_urls:
                continue
            page = await run.fetch(candidate.url, depth=candidate.depth)
            digest = hashlib.sha256(page.body).hexdigest()
            source_id = "src-" + hashlib.sha256(page.url.encode()).hexdigest()[:16]
            snapshot = directory / "pages" / (digest + ".html")
            if not snapshot.exists():
                _write_exclusive(snapshot, page.body)
            manifest.sources.append(SourceRecord(
                source_id=source_id, requested_url=candidate.url, final_url=page.url,
                discovered_from=candidate.discovered_from, depth=candidate.depth,
                fetched_at=page.fetched_at, content_sha256=digest,
                body_bytes=len(page.body), snapshot_path="pages/" + snapshot.name,
                duplicate_content_of=content_ids.get(digest),
            ))
            content_ids.setdefault(digest, source_id)
            if candidate.depth < run.limits.max_depth:
                links = link_candidates(page.body, page.url)
                run.check_deadline()
                for url in links:
                    if url in known or url in run.visited_urls:
                        continue
                    if len(known) >= MAX_CANDIDATES:
                        candidate_limit_hit = True
                        break
                    known.add(url)
                    pending.append(Candidate(url, candidate.depth + 1, page.url))
            manifest.candidates_seen = len(known)
            manifest.remaining_candidates = len(pending)
            _checkpoint(directory, manifest, run)
        manifest.status = "page_limit" if pending else "exhausted"
        if candidate_limit_hit and manifest.status == "exhausted":
            manifest.status = "candidate_limit"
    except IntakeBlocked as exc:
        manifest.status, manifest.error = "blocked", str(exc)
    except asyncio.CancelledError:
        manifest.status, manifest.error = "cancelled", "inventory cancelled"
        raise
    except Exception:
        manifest.status, manifest.error = "failed", "inventory processing or storage failure"
        raise
    finally:
        manifest.finished_at = now()
        manifest.remaining_candidates = len(pending)
        _checkpoint(directory, manifest, run)
    return directory / "manifest.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Private bounded VX Real source inventory")
    parser.add_argument("--permission", required=True, type=Path, help="private operator permission JSON")
    parser.add_argument("--seed", default="https://vxreal.com/")
    args = parser.parse_args()
    try:
        permission = CollectionPermission.model_validate_json(args.permission.read_bytes())
        path = asyncio.run(discover(SafeIntake(permission), args.seed))
        manifest = json.loads(path.read_text())
        print(json.dumps({"manifest": str(path), "status": manifest["status"],
                          "source_count": len(manifest["sources"])}))
        return 2 if manifest["status"] == "blocked" else 0
    except (ValueError, OSError) as exc:
        # Avoid echoing private permission fields or remote input in errors.
        print(json.dumps({"status": "error", "error_type": type(exc).__name__}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
