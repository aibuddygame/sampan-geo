# T001/P01-2 — Private safe intake

## Boundary and use
`sampan.intake.SafeIntake` is a private service for the later discovery pipeline, not a public fetch endpoint. Input: an explicit `CollectionPermission`, bounded `CrawlLimits`, and URL plus discovery depth. Output: `FetchedPage(url, body)` for one permitted HTML response, or `IntakeBlocked`. Returned bytes are untrusted private input; do not execute instructions or commit source bodies. This unit does not discover links, write manifests or call an LLM.

Before constructing a run, record a real reviewer, timezone-aware review date and permission/terms reference; explicitly confirm `collection_allowed` and `terms_reviewed`. Both flags default to false. This is an operator assertion, not automated legal verification or permission to publish. Keep real records in ignored `private/`; synthetic test records do not authorize collection. This commit includes no real permission record.

Call `await run.fetch(url, depth=depth)` from trusted discovery code. Depth 0 is the seed; discovery must pass parent depth + 1 for links. Reuse one run for the whole inventory. Calls are serialized; counters are `pages`, `requests`, `bytes_received`. Blocked/network/timeout failures and cancellation close the run. Review the cause before another run; never loop around blocks or rate limits.

## Enforced policy
- Exact `https://vxreal.com` origin, default/443 port only. Credentials, other domains/subdomains (including `www`), ambiguous authorities, controls, backslashes, malformed/nested percent escapes and dot path segments are rejected. Fragments are removed.
- Resolve before every request, including robots and redirects. Every DNS answer must be public unicast; mixed public/private, empty and IPv4-mapped/transition IPv6 answers fail closed. Dial one validated literal IP, preserve the original Host and verify TLS using HTTPX's `sni_hostname`. Environment proxies are disabled. No cookies or authorization are forwarded.
- Fetch `/robots.txt` once per run before content. Require HTTP 200 UTF-8 `text/plain`. Missing/redirected/unavailable policies, unsupported directives or malformed policy block collection pending review.
- Apply wildcard and matching SampanBot groups together. Every matching `Disallow` blocks, even with an `Allow` or specific-agent override. Support `*`, terminal `$`, encoded/decoded comparisons, `Crawl-delay` and numeric `Request-rate`. This intentionally restrictive subset can overblock; it does not claim full RFC 9309 equivalence. Robots alone grants no collection rights.
- Check origin and robots before each redirect target, then resolve again. No retries, fallback domains, proxy bypasses or block bypasses.
- Return only HTTP 200 HTML/XHTML. Request identity encoding and reject compression, unsupported content types, bad/oversized declared lengths and oversized raw streams. Close response/client resources on failures.

## Hard upper bounds (defaults)
| Budget | Limit |
| --- | --- |
| Content attempts per run | 10 |
| Discovery depth | 2 |
| Redirects per content attempt | 3 |
| All requests, including robots/redirects | 40 |
| Body bytes per response | 1,000,000 |
| Robots bytes | 64,000 or smaller configured response cap |
| Total body bytes, including robots/redirects/errors | 10,000,000 |
| Request deadline, including DNS/body | 10 seconds |
| Run lifetime, including rate waits | 120 seconds |
| Minimum interval between requests | 1 second, raised by robots |

Limits may be tightened, not raised. Stream overflow stops after the chunk crossing the cap; it is counted but never returned. Header overhead is excluded from body counters. Redirects consume requests; content attempts consume page slots. No model tokens/costs occur here; model budgets belong to P01-5.

## Verification and remaining work
Run `.venv/bin/python -m pytest -q` from the repository root. Synthetic HTTP streams/DNS test IP pinning, Host/TLS-name extensions, DNS changes, permissions, robots, redirects, limits, deadlines and cleanup without live site access. Mock transport does not prove a live TLS handshake or current site accessibility. Resolver/transport injection is trusted test infrastructure and must never come from external input.

P01-3 must integrate this service into bounded discovery, retain permission references and request outcomes in private run/manifest records, and review real site policy before collection. No live robots policy, terms review or owner permission is claimed here.

References: [HTTPX SNI extension](https://www.python-httpx.org/advanced/extensions/), [HTTPX transport testing](https://www.python-httpx.org/advanced/transports/), [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html).
