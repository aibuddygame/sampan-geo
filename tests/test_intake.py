import asyncio
from datetime import datetime, timezone

import httpx
import pytest
from pydantic import ValidationError

from sampan.intake import (
    CollectionPermission, CrawlLimits, IntakeBlocked, RobotsPolicy, SafeIntake,
    normalize_url, public_addresses,
)

URL = "https://vxreal.com/"


def reply(status, *, headers=None, content=b""):
    return httpx.Response(status, headers=headers, stream=httpx.ByteStream(content))


def permission(**changes):
    return CollectionPermission(**{
        "reviewer": "test reviewer", "reviewed_at": datetime(2026, 10, 16, tzinfo=timezone.utc),
        "reference": "synthetic test permission, not real owner approval",
        "collection_allowed": True, "terms_reviewed": True, **changes,
    })


@pytest.fixture
def harness(monkeypatch):
    requests, waits = [], []

    async def sleep(seconds):
        waits.append(seconds)

    monkeypatch.setattr("sampan.intake.asyncio.sleep", sleep)

    def make(handler=None, *, robots=b"User-agent: *\nDisallow: /private", resolver=None, **limits):
        async def public(host):
            assert host == "vxreal.com"
            return ["93.184.216.34"]

        def respond(request):
            requests.append(request)
            if request.url.path == "/robots.txt":
                return reply(200, headers={"content-type": "text/plain"}, content=robots)
            if handler:
                return handler(request)
            return reply(200, headers={"content-type": "text/html"}, content=b"<h1>synthetic</h1>")

        return SafeIntake(permission(), CrawlLimits(**limits), resolver=resolver or public,
                          transport=httpx.MockTransport(respond))

    return make, requests, waits


@pytest.mark.parametrize("url", [
    "file:///etc/passwd", "http://vxreal.com/", "https://localhost/",
    "https://127.0.0.1/", "https://[::1]/", "https://169.254.169.254/",
    "https://vxreal.com.evil.test/", "https://evilvxreal.com/", "https://www.vxreal.com/",
    "https://user:password@vxreal.com/", "https://vxreal.com:444/",
    "https://vxreal.com:/", "https://vxreal.com./", "https://vxreal.com\\@evil.test/",
    " https://vxreal.com/", "https://vxreal.com/\n", "https://vxreal.com/%zz",
    "https://vxreal.com/%252fprivate", "https://vxreal.com/%2e%2e/private",
    "https://vxreal.com/%00", "https://vxreal.com/%5cprivate",
])
def test_reject_unsafe_url(url):
    with pytest.raises(IntakeBlocked):
        normalize_url(url)


def test_normalize_url():
    assert normalize_url("https://VXREAL.COM:443/about#team") == URL + "about"


@pytest.mark.parametrize("address", [
    "127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.0.1", "169.254.169.254",
    "100.64.0.1", "0.0.0.0", "224.0.0.1", "192.0.2.1", "::1", "fe80::1",
    "fc00::1", "::ffff:8.8.8.8", "2002:0808:0808::1", "64:ff9b::808:808",
    "2001:db8::1", "not-an-ip",
])
def test_reject_any_unsafe_dns_answer(address):
    with pytest.raises(IntakeBlocked):
        public_addresses(["93.184.216.34", address])


def test_empty_dns():
    with pytest.raises(IntakeBlocked):
        public_addresses([])


@pytest.mark.parametrize("changes", [{"collection_allowed": False}, {"terms_reviewed": False}])
def test_permission_required_before_network(changes):
    with pytest.raises(IntakeBlocked):
        SafeIntake(permission(**changes))


@pytest.mark.parametrize("changes", [{"reviewer": " "}, {"reference": ""},
                                       {"reviewed_at": datetime(2026, 10, 16)}])
def test_permission_record_validation(changes):
    with pytest.raises(ValidationError):
        permission(**changes)


@pytest.mark.parametrize("changes", [{"max_pages": 11}, {"max_depth": -1},
    {"max_response_bytes": 1_000_001}, {"max_total_bytes": 10_000_001},
    {"request_seconds": float("inf")}, {"run_seconds": 121},
    {"interval_seconds": 0}, {"max_redirects": 4}, {"max_requests": 41}])
def test_limits_cannot_exceed_hard_caps(changes):
    with pytest.raises(ValidationError):
        CrawlLimits(**changes)


def test_fetch_pins_ip_preserves_tls_and_limits_rate(harness):
    make, requests, waits = harness
    run = make()
    page = asyncio.run(run.fetch(URL))
    assert page.url == URL and page.body == b"<h1>synthetic</h1>"
    assert run.pages == 1 and run.requests == 2
    for request in requests:
        assert request.url.host == "93.184.216.34"
        assert request.headers["host"] == "vxreal.com"
        assert request.extensions["sni_hostname"] == "vxreal.com"
        assert request.headers["accept-encoding"] == "identity"
        assert "cookie" not in request.headers and "authorization" not in request.headers
    assert len(waits) == 1 and 0 < waits[0] <= 1


def test_rebinding_blocked_before_second_connection(harness):
    make, requests, _ = harness
    answers = iter([["93.184.216.34"], ["127.0.0.1"]])

    async def resolver(host):
        return next(answers)

    with pytest.raises(IntakeBlocked, match="non-public"):
        asyncio.run(make(resolver=resolver).fetch(URL))
    assert len(requests) == 1


@pytest.mark.parametrize("location", ["http://vxreal.com/", "https://127.0.0.1/",
    "https://evil.test/", "/private", "/%70rivate", "https://vxreal.com:444/"])
def test_redirect_target_checked_before_connection(harness, location):
    make, requests, _ = harness
    run = make(lambda _: reply(302, headers={"location": location}))
    with pytest.raises(IntakeBlocked):
        asyncio.run(run.fetch(URL))
    assert len(requests) == 2


def test_safe_relative_redirect_and_fresh_dns(harness):
    make, requests, _ = harness
    answers = iter([["93.184.216.34"], ["93.184.216.35"], ["93.184.216.36"]])

    async def resolver(host):
        return next(answers)

    def handler(request):
        if request.url.path == "/":
            return reply(302, headers={"location": "/about#team"})
        return reply(200, headers={"content-type": "text/html"}, content=b"ok")

    page = asyncio.run(make(handler, resolver=resolver).fetch(URL))
    assert page.url == URL + "about"
    assert [r.url.host for r in requests] == ["93.184.216.34", "93.184.216.35", "93.184.216.36"]


@pytest.mark.parametrize("path", ["private", "%70rivate", "files/report.pdf", "search?key=secret"])
def test_robots_patterns_and_query(harness, path):
    make, requests, _ = harness
    robots = b"User-agent: *\nDisallow: /private\nAllow: /private\nDisallow: /*.pdf$\nDisallow: /search?key=*"
    with pytest.raises(IntakeBlocked, match="robots disallows"):
        asyncio.run(make(robots=robots).fetch(URL + path))
    assert len(requests) == 1


def test_robots_combines_applicable_groups_conservatively():
    policy = RobotsPolicy.parse(b"User-agent: *\nDisallow: /one\nUser-agent: SampanBot\nDisallow: /two\nAllow: /one\nCrawl-delay: 4\nRequest-rate: 1/6", 1)
    assert not policy.permits(URL + "one") and not policy.permits(URL + "two")
    assert policy.permits(URL + "three") and policy.interval == 6


@pytest.mark.parametrize("body", [b"<html>unavailable</html>", b"Disallow: /", b"\xff",
    b"User-agent: *\nCrawl-delay: nan", b"User-agent: *\nRequest-rate: 0/2",
    b"User-agent: *\nUnknown: yes", b"User-agent: *\nDisallow: /private extra",
    b"User-agent: *\nDisallow: /%invalid"])
def test_malformed_robots_fails_closed(harness, body):
    make, requests, _ = harness
    with pytest.raises(IntakeBlocked):
        asyncio.run(make(robots=body).fetch(URL))
    assert len(requests) == 1


@pytest.mark.parametrize("status", [301, 404, 401, 403, 429, 500])
def test_unavailable_robots_prevents_page_fetch(status):
    requests = []

    async def resolver(host):
        return ["93.184.216.34"]

    def handler(request):
        requests.append(request)
        return reply(status, headers={"content-type": "text/plain", "location": URL})

    run = SafeIntake(permission(), resolver=resolver, transport=httpx.MockTransport(handler))
    with pytest.raises(IntakeBlocked):
        asyncio.run(run.fetch(URL))
    assert len(requests) == 1


@pytest.mark.parametrize("status", [401, 403, 429, 500])
def test_http_failure_stops_run_without_retry(harness, status):
    make, requests, _ = harness
    run = make(lambda _: reply(status))

    async def scenario():
        with pytest.raises(IntakeBlocked):
            await run.fetch(URL)
        with pytest.raises(IntakeBlocked, match="closed"):
            await run.fetch(URL + "about")

    asyncio.run(scenario())
    assert len(requests) == 2


@pytest.mark.parametrize("headers,body", [
    ({"content-type": "application/json"}, b"{}"),
    ({"content-type": "text/html", "content-encoding": "gzip"}, b""),
    ({"content-type": "text/html", "content-length": "1000001"}, b""),
    ({"content-type": "text/html", "content-length": "bad"}, b""),
    ({"content-type": "text/html"}, b"x" * 1_000_001),
], ids=["json", "compression", "declared-size", "bad-length", "stream-size"])
def test_response_type_encoding_and_size_limits(harness, headers, body):
    make, _, _ = harness
    with pytest.raises(IntakeBlocked):
        asyncio.run(make(lambda _: reply(200, headers=headers, content=body)).fetch(URL))


@pytest.mark.parametrize("limits,depth", [({"max_depth": 0}, 1), ({}, -1), ({}, True)])
def test_depth_limit_before_network(harness, limits, depth):
    make, requests, _ = harness
    with pytest.raises(IntakeBlocked):
        asyncio.run(make(**limits).fetch(URL, depth=depth))
    assert requests == []


@pytest.mark.parametrize("limit", ["max_pages", "max_requests", "max_total_bytes"])
def test_run_limits(harness, limit):
    make, requests, _ = harness
    run = make(**{limit: {"max_pages": 1, "max_requests": 2, "max_total_bytes": 60}[limit]})

    async def scenario():
        await run.fetch(URL)
        with pytest.raises(IntakeBlocked):
            await run.fetch(URL + "about")

    asyncio.run(scenario())
    expected_requests = 3 if limit == "max_total_bytes" else 2
    assert len(requests) == run.requests == expected_requests
    if limit == "max_pages":
        assert run.pages == 1


def test_duplicate_and_redirect_loop(harness):
    make, requests, _ = harness
    run = make(lambda _: reply(302, headers={"location": URL + "#same"}))
    with pytest.raises(IntakeBlocked, match="duplicate"):
        asyncio.run(run.fetch(URL))
    assert len(requests) == 2


def test_redirect_limit(harness):
    make, requests, _ = harness
    run = make(lambda r: reply(302, headers={"location": str(r.url.path) + "next"}), max_redirects=1)
    with pytest.raises(IntakeBlocked, match="redirect limit"):
        asyncio.run(run.fetch(URL))
    assert len(requests) == 3


def test_deadline_includes_dns_and_closes_run(harness):
    make, requests, _ = harness

    async def resolver(host):
        await asyncio.Event().wait()

    run = make(resolver=resolver, request_seconds=0.01, run_seconds=0.02)
    with pytest.raises(IntakeBlocked, match="time limit"):
        asyncio.run(run.fetch(URL))
    assert requests == []


def test_expired_run_never_connects(harness, monkeypatch):
    make, requests, _ = harness
    run = make()
    monkeypatch.setattr("sampan.intake.time.monotonic", lambda: run._deadline + 1)
    with pytest.raises(IntakeBlocked, match="time limit"):
        asyncio.run(run.fetch(URL))
    assert requests == []


def test_duplicate_successful_page_is_not_fetched_again(harness):
    make, requests, _ = harness
    run = make()

    async def scenario():
        await run.fetch(URL)
        with pytest.raises(IntakeBlocked, match="duplicate"):
            await run.fetch(URL + "#same")

    asyncio.run(scenario())
    assert len(requests) == 2


def test_network_error_fails_closed(harness):
    make, requests, _ = harness

    def handler(request):
        raise httpx.ConnectError("synthetic network error")

    run = make(handler)
    with pytest.raises(IntakeBlocked, match="network failure"):
        asyncio.run(run.fetch(URL))
    assert run._closed


def test_stream_deadline_and_response_cleanup(harness):
    make, _, _ = harness
    closed = []

    class StalledStream(httpx.AsyncByteStream):
        async def __aiter__(self):
            yield b"<html>"
            await asyncio.Event().wait()

        async def aclose(self):
            closed.append(True)

    run = make(lambda _: httpx.Response(200, headers={"content-type": "text/html"},
                                        stream=StalledStream()), request_seconds=0.01)
    with pytest.raises(IntakeBlocked, match="time limit"):
        asyncio.run(run.fetch(URL))
    assert closed == [True] and run._closed


def test_robots_delay_used_for_following_requests(harness):
    make, _, waits = harness
    run = make(robots=b"User-agent: *\nCrawl-delay: 5")
    asyncio.run(run.fetch(URL))
    assert len(waits) == 1 and 4 < waits[0] <= 5


def test_robots_byte_cap(harness):
    make, requests, _ = harness
    with pytest.raises(IntakeBlocked, match="byte limit"):
        asyncio.run(make(robots=b"#" + b"x" * 64_000).fetch(URL))
    assert len(requests) == 1


def test_robots_wrong_content_type_never_fetches_page(harness):
    async def resolver(host):
        return ["93.184.216.34"]

    requests = []

    def handler(request):
        requests.append(request)
        return reply(200, headers={"content-type": "text/html"}, content=b"<html></html>")

    run = SafeIntake(permission(), resolver=resolver, transport=httpx.MockTransport(handler))
    with pytest.raises(IntakeBlocked, match="robots unavailable"):
        asyncio.run(run.fetch(URL))
    assert len(requests) == 1


def test_total_deadline_includes_real_rate_wait():
    requests = []

    async def resolver(host):
        return ["93.184.216.34"]

    def handler(request):
        requests.append(request)
        return reply(200, headers={"content-type": "text/plain"},
                     content=b"User-agent: *\nCrawl-delay: 10")

    run = SafeIntake(permission(), CrawlLimits(run_seconds=0.05), resolver=resolver,
                     transport=httpx.MockTransport(handler))
    with pytest.raises(IntakeBlocked, match="time limit"):
        asyncio.run(run.fetch(URL))
    assert len(requests) == 1 and run._closed


def test_cancellation_closes_response_and_run(harness):
    make, _, _ = harness
    closed = []

    async def scenario():
        started = asyncio.Event()

        class Stream(httpx.AsyncByteStream):
            async def __aiter__(self):
                started.set()
                await asyncio.Event().wait()
                yield b"unreachable"

            async def aclose(self):
                closed.append(True)

        run = make(lambda _: httpx.Response(200, headers={"content-type": "text/html"},
                                            stream=Stream()))
        task = asyncio.create_task(run.fetch(URL))
        await started.wait()
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        assert run._closed

    asyncio.run(scenario())
    assert closed == [True]
