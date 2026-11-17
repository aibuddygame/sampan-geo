import asyncio
import hashlib
import json
import stat
from datetime import datetime, timezone

import httpx
import pytest

from sampan import discovery
from sampan.discovery import SourceManifest, discover, link_candidates
from sampan.intake import CollectionPermission, CrawlLimits, SafeIntake

ROOT = "https://vxreal.com/"


@pytest.fixture
def inventory(tmp_path, monkeypatch):
    monkeypatch.setattr(discovery, "PRIVATE_ROOT", tmp_path / "private")
    requests = []

    async def sleep(seconds):
        pass

    monkeypatch.setattr("sampan.intake.asyncio.sleep", sleep)

    def make(pages, *, robots=b"User-agent: *\nDisallow: /private", **limits):
        permission = CollectionPermission(
            reviewer="synthetic test reviewer", reviewed_at=datetime.now(timezone.utc),
            reference="synthetic permission; no live-site authorization",
            collection_allowed=True, terms_reviewed=True,
        )

        async def resolver(host):
            return ["93.184.216.34"]

        def handler(request):
            requests.append(request.url.path)
            if request.url.path == "/robots.txt":
                code, headers, body = 200, {"content-type": "text/plain"}, robots
            else:
                value = pages.get(request.url.path, (404, {}, b""))
                if isinstance(value, bytes):
                    code, headers, body = 200, {"content-type": "text/html"}, value
                else:
                    code, headers, body = value
            return httpx.Response(code, headers=headers, stream=httpx.ByteStream(body))

        return SafeIntake(permission, CrawlLimits(**limits), resolver=resolver,
                          transport=httpx.MockTransport(handler))

    return make, requests


def load(path):
    return SourceManifest.model_validate_json(path.read_bytes())


def test_inventory_hashes_snapshots_and_provenance(inventory):
    make, requests = inventory
    bodies = {"/": b'<a href="/contact">Contact</a><a href="/about">About</a>',
              "/about": b"<h1>synthetic about</h1>", "/contact": b"<h1>synthetic contact</h1>"}
    run = make(bodies)
    path = asyncio.run(discover(run))
    manifest = load(path)
    assert manifest.status == "exhausted"
    assert requests == ["/robots.txt", "/", "/about", "/contact"]
    assert [s.depth for s in manifest.sources] == [0, 1, 1]
    assert manifest.sources[1].discovered_from == ROOT
    assert manifest.permission == run.permission
    assert manifest.http_requests == 4 and manifest.content_attempts == 3
    assert manifest.llm_calls == manifest.model_tokens == manifest.model_cost_usd == 0
    for source in manifest.sources:
        snapshot = path.parent / source.snapshot_path
        assert hashlib.sha256(snapshot.read_bytes()).hexdigest() == source.content_sha256
        assert len(snapshot.read_bytes()) == source.body_bytes
        assert stat.S_IMODE(snapshot.stat().st_mode) == 0o600
        assert source.fetched_at.tzinfo is not None
    assert stat.S_IMODE(path.stat().st_mode) == 0o600
    assert stat.S_IMODE(path.parent.stat().st_mode) == 0o700
    assert all(record["body_sha256"] for record in manifest.request_records)
    assert manifest.request_records[0]["url"] == ROOT + "robots.txt"
    assert manifest.request_records[0]["response_content_type"] == "text/plain"
    assert "<h1>" not in path.read_text()


def test_filters_and_stable_relevance_order():
    body = b'''<base href="https://evil.test/"><a href="/contact">Contact</a>
        <a href="/about#team">About</a><a href="/about#other">Duplicate</a>
        <a href="https://evil.test/about">External</a><a href="http://vxreal.com/">HTTP</a>
        <a href="/services.html">Services</a><a href="/brochure.pdf">PDF</a>
        <a href="/account">Account</a><a href="/search?q=secret">Query</a>
        <a href="/page?token=secret">Token</a><a href="/terms.html">Terms</a>
        <a href="/download" download>Download</a><a href="/nofollow" rel="nofollow">No</a>
        <a href="#here">Anchor</a><a href="javascript:alert(1)">JS</a>
        <script>fetch("/do-not-fetch")</script>'''
    assert link_candidates(body, ROOT) == [ROOT + "about", ROOT + "services.html", ROOT + "contact"]


def test_deduplicates_redirect_target_and_content(inventory):
    make, requests = inventory
    run = make({"/": b'<a href="/about">About</a><a href="/company">Company</a><a href="/contact">Contact</a>',
                "/about": (302, {"location": "/company"}, b""),
                "/company": b"same synthetic body", "/contact": b"same synthetic body"})
    manifest = load(asyncio.run(discover(run)))
    assert manifest.status == "exhausted"
    assert requests.count("/company") == 1
    assert len(manifest.sources) == 3
    assert manifest.sources[1].requested_url == ROOT + "about"
    assert manifest.sources[1].final_url == ROOT + "company"
    assert manifest.sources[2].duplicate_content_of == manifest.sources[1].source_id
    assert len(list((discovery.PRIVATE_ROOT / "inventories" / manifest.run_id / "pages").iterdir())) == 2


def test_depth_is_propagated_and_limited(inventory):
    make, requests = inventory
    run = make({"/": b'<a href="/about">A</a>', "/about": b'<a href="/about/team">Team</a>',
                "/about/team": b'<a href="/about/team/deeper">Too deep</a>'})
    manifest = load(asyncio.run(discover(run)))
    assert [s.depth for s in manifest.sources] == [0, 1, 2]
    assert "/about/team/deeper" not in requests


def test_page_limit_is_normal_stop_not_block(inventory):
    make, requests = inventory
    run = make({"/": b'<a href="/about">A</a><a href="/contact">C</a>',
                "/about": b"about"}, max_pages=2)
    manifest = load(asyncio.run(discover(run)))
    assert manifest.status == "page_limit" and manifest.remaining_candidates == 1
    assert len(manifest.sources) == 2 and "/contact" not in requests


def test_candidate_queue_bounded(inventory):
    make, _ = inventory
    body = "".join(f'<a href="/page-{i}">page</a>' for i in range(200)).encode()
    manifest = load(asyncio.run(discover(make({"/": body}, max_pages=1))))
    assert manifest.status == "page_limit"
    assert manifest.candidates_seen == 100 and manifest.remaining_candidates == 99


def test_partial_manifest_saved_on_remote_block_no_retry(inventory):
    make, requests = inventory
    run = make({"/": b'<a href="/about">About</a><a href="/contact">Contact</a>',
                "/about": (429, {"retry-after": "60"}, b""), "/contact": b"never"})
    manifest = load(asyncio.run(discover(run)))
    assert manifest.status == "blocked" and len(manifest.sources) == 1
    assert requests == ["/robots.txt", "/", "/about"]
    assert manifest.request_records[-1]["status_code"] == 429
    assert manifest.request_records[-1]["outcome"] == "blocked"
    assert manifest.finished_at is not None


def test_robot_block_has_empty_manifest_and_policy_hash(inventory):
    make, requests = inventory
    manifest = load(asyncio.run(discover(make({"/": b"never"}, robots=b"User-agent: *\nDisallow: /"))))
    assert manifest.status == "blocked" and manifest.sources == []
    assert requests == ["/robots.txt"]
    assert manifest.request_records[0]["body_sha256"] == hashlib.sha256(b"User-agent: *\nDisallow: /").hexdigest()


def test_each_run_has_own_directory_and_does_not_overwrite(inventory):
    make, _ = inventory
    first = asyncio.run(discover(make({"/": b"one"})))
    content = first.read_bytes()
    second = asyncio.run(discover(make({"/": b"two"})))
    assert first != second and first.read_bytes() == content


def test_symlink_private_root_rejected_before_network(inventory, tmp_path, monkeypatch):
    make, requests = inventory
    actual = tmp_path / "actual"
    actual.mkdir()
    target = tmp_path / "linked"
    target.symlink_to(actual, target_is_directory=True)
    monkeypatch.setattr(discovery, "PRIVATE_ROOT", target)
    with pytest.raises(ValueError, match="symlink"):
        asyncio.run(discover(make({"/": b"never"})))
    assert requests == []


def test_nonfresh_run_and_query_seed_rejected(inventory):
    make, requests = inventory
    run = make({"/": b"page"})
    asyncio.run(run.fetch(ROOT))
    with pytest.raises(ValueError, match="fresh"):
        asyncio.run(discover(run))
    before = len(requests)
    with pytest.raises(ValueError, match="query"):
        asyncio.run(discover(make({}), ROOT + "?token=secret"))
    assert len(requests) == before


def test_cli_missing_permission_has_no_network(monkeypatch, capsys, tmp_path):
    monkeypatch.setattr("sys.argv", ["discovery", "--permission", str(tmp_path / "missing.json")])
    assert discovery.main() == 2
    assert json.loads(capsys.readouterr().out)["status"] == "error"


def test_processing_failure_records_failed_not_complete(inventory, monkeypatch):
    make, _ = inventory

    def bad_parser(*args):
        raise ValueError("synthetic parser failure")

    monkeypatch.setattr(discovery, "link_candidates", bad_parser)
    with pytest.raises(ValueError, match="synthetic parser failure"):
        asyncio.run(discover(make({"/": b"<html>test</html>"})))
    path = next(discovery.PRIVATE_ROOT.glob("inventories/*/manifest.json"))
    manifest = load(path)
    assert manifest.status == "failed" and len(manifest.sources) == 1
    assert manifest.finished_at is not None


def test_cancelled_run_retains_partial_manifest(inventory):
    make, _ = inventory
    run = make({})

    async def cancelled(*args, **kwargs):
        raise asyncio.CancelledError

    run.fetch = cancelled
    with pytest.raises(asyncio.CancelledError):
        asyncio.run(discover(run))
    path = next(discovery.PRIVATE_ROOT.glob("inventories/*/manifest.json"))
    assert load(path).status == "cancelled"
