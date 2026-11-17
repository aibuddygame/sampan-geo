# L004 — Scoring fairness and bounded audit compatibility

Verified locally on 2026-10-26. User explicitly requested fewer false flags and better support for other websites. This is a separate local scoring experiment; T001/P01-3 remains incomplete and its strict defaults are preserved.

## Objective, input/output and acceptance

Input: one authorized public HTTPS URL (ASCII/percent-encoded; IDNs must be punycoded), or owner-supplied UTF-8 HTML. Output: separate SEO/GEO scores under `weighted-page-0.3`, 49 check records with evidence, neutral review recommendations, collection provenance and the existing filters/report export. Simplest approach: revise deterministic checks and introduce AuditIntake using the existing IP-pinned transport, without dependencies, LLMs, queues or a production frontend.

Acceptance: legitimate footer/logo branding recognized; optional structures and editorial conventions do not become invented failures; actual noindex/malformed data remain reported; missing robots, allowed REP paths, www redirects and gzip/deflate work within limits; private targets, disallowed paths, access errors, unsafe redirects and expansion bombs stop; original strict intake tests still pass; UI shows the new version and review recommendations.

## Scoring changes

- Business-name consistency checks body, navigation, footer, nonempty image alt and aria-labels. Head/script/style/template/noscript/explicitly hidden nodes do not count. NFKC/case/whitespace normalization and Unicode word boundaries prevent accidental substring matches; declared alternateName/legalName aliases are supported. CSS visibility and factual company identity are not verified. No exact match produces review, not a proven contradiction.
- Named LocalBusiness and several explicit organization subtypes/full Schema.org type URLs are recognized. Context arrays and @vocab mappings are recognized without fetching external vocabularies. Missing business records on non-business pages and unfamiliar valid vocabularies/types need contextual review; valid JSON alone does not prove semantic correctness.
- Lists/tables, multiple H1s, skipped heading levels, unusual title/description lengths, missing paragraph patterns and absent English about/contact URL patterns become unscored review items instead of automatic failures. They can still appear in recommendations. A heading jump can warrant accessibility/editorial review without proving a Google indexing defect.
- Relative HTTPS canonicals resolve against the fetched URL. Apex/www references are recognized as the same declared site; a cross-domain canonical requires review. This does not verify the canonical destination or prove alias ownership. Missing/malformed canonical declarations still receive recommendations.
- Missing title/description is not double-penalized by the duplicate-element check. Unknown/N/A/partial/pass/fail and fixed 100-point category budgets remain explicit.
- Real HTML/available HTTP noindex remains a critical finding; missing/invalid JSON and other observed issues are not silently passed. Agent-scoped headers stay unknown pending full policy interpretation.
- Priority improvements now also include selected REVIEW recommendations, explicitly unscored with no defect established. Unknowns remain excluded, rather than receiving invented passes. The minimum 60% coverage rule is unchanged.

This version can yield a higher score by correcting a false flag or changing a deduction to review. That is a methodology change, not website improvement. Historical version 0.2 scores must not be directly interpreted as before/after optimization gains. Tab comparisons require matching versions, source modes and evaluated check IDs.

## Separate audit collection profile

The scoring app uses `AuditIntake`; T001 still uses `SafeIntake` and the deliberately strict `RobotsPolicy`. Shared transport extension hooks preserve the strict default's identity encoding, exact-origin policy, permission gate, DNS/IP pinning, Host/TLS names, deadlines, byte budgets and block handling. Original strict tests still pass.

Audit behavior:

- Only the submitted HTTPS/443 host and its exact added/removed `www.` counterpart are eligible for redirects. No arbitrary sibling subdomains, registrable-domain guesses, other sites, credentials, HTTP downgrade or nonstandard ports. Each connection is resolved and pinned to public IPs again. The target host must pass its own robots check before a content request.
- Robots HTTP 404/410 means no REP restrictions observed, not an SEO failure or permission grant. Operator authorization/terms confirmation remains mandatory. HTTP 401/403/429, server errors, bad TLS/DNS/network responses and policy blocks stop collection without fallback/retry.
- Robots is parsed as UTF-8 text; actual markup/binary bodies still stop for review. It is not rejected just because an otherwise plain-text policy has an unusual Content-Type. Empty policies can be usable. Unknown extension records are ignored for REP matching; an explicit applicable `Content-signal: search=no` is conservatively honored. No AI training occurs.
- Select the most specific matching agent groups, merge equally specific groups, use longest path matches and Allow for equal-length ties. Wildcards, terminal $, percent-encoded octets and Unicode path encoding are tested. Honor valid Crawl-delay/Request-rate. This is a bounded supported REP subset, not complete standards certification or a Googlebot simulator.
- Robots redirects are capped at 3 hops and limited to those same two hosts. Policy fetched through a redirect applies to the originally requested host; the www host still gets its own policy check for content. Every request consumes the common request/time budget.
- Advertise gzip/deflate. Cap both encoded and decoded response sizes (1 MB HTML / 64 KB robots), and separately cap encoded and decoded totals. Expansion beyond the cap, invalid/truncated/concatenated compressed streams and unsupported encodings stop. Raw deflate is supported through local decode fallback only, never a new HTTP request. Request audit byte counters represent wire bytes, while returned body/hash is decoded; API collection metadata reports both totals.
- Scoring run: 1 content page, at most 12 HTTP requests (robots/redirects included), at most 45 seconds, existing 10-second individual request deadline and minimum 1-second interval raised by policy. Existing total cap is 10 MB for wire and independently decoded bodies. No automatic retries. These are ceilings, not promises of a complete audit.

Still unsupported: login/paywall/CAPTCHA bypass, arbitrary cross-host migrations, Brotli or chained content encodings, HTTP-only sites, raw Unicode URLs, browser-rendered-only content, whole-site crawl and external indexing/AI visibility measurement. Report these as collection/coverage limits rather than low search probability.

## Version 0.3 check catalogue

Weights are declared budgets; not every check is applicable or automatically measurable. Unknown/N/A checks earn no points and are excluded from the evaluated denominator. Coverage is separately visible. A score of 100 means evaluated checks passed, not that every relevant aspect was tested.


### SEO — 100 points

| Category | Check | Weight | Method |
| --- | --- | ---: | --- |
| Access & indexing | HTTPS URL | 5 | HTML check |
| Access & indexing | Successful page response | 8 | Live fetch |
| Access & indexing | HTML indexing directives | 7 | HTML check |
| Access & indexing | HTTP indexing directives | 5 | Live response header |
| Access & indexing | Scanner permitted by robots policy | 5 | Live collector policy |
| Search presentation | Page title present | 5 | HTML check |
| Search presentation | One title element | 3 | HTML check |
| Search presentation | Title length review | 3 | Editorial heuristic |
| Search presentation | Meta description present | 4 | HTML check |
| Search presentation | One description element | 2 | HTML check |
| Search presentation | Description length review | 2 | Editorial heuristic |
| Search presentation | Document language declared | 3 | HTML check |
| Search presentation | Nonempty main heading | 3 | HTML check |
| Discovery & URL signals | Canonical declaration | 5 | HTML check |
| Discovery & URL signals | Canonical URL review | 3 | HTML check |
| Discovery & URL signals | Navigable same-host links | 5 | HTML check |
| Discovery & URL signals | Descriptive internal anchors | 3 | English-oriented heuristic |
| Discovery & URL signals | Link destination availability | 4 | Requires additional crawl |
| Structure & media | Main heading structure | 3 | Editorial heuristic |
| Structure & media | Heading sequence | 2 | HTML check |
| Structure & media | Image alternatives | 4 | HTML check |
| Structure & media | Image layout reservation | 2 | HTML check |
| Structure & media | Device-width viewport | 2 | HTML check |
| Structure & media | Rendered mobile usability | 2 | Requires browser test |
| Markup & resource signals | JSON-LD syntax | 3 | HTML check |
| Markup & resource signals | Schema.org vocabulary | 2 | HTML check |
| Markup & resource signals | Insecure resource references | 2 | HTML check |
| Markup & resource signals | Loading performance / Core Web Vitals | 3 | Requires performance data |

### GEO — 100 points

| Category | Check | Weight | Method |
| --- | --- | ---: | --- |
| Retrieval & excerpts | Working retrievable page | 5 | Live fetch |
| Retrieval & excerpts | Substantive HTML text | 10 | Length heuristic; no rendering |
| Retrieval & excerpts | HTML/available header snippet controls | 5 | Available directives only |
| Retrieval & excerpts | Search/AI crawler-specific access | 5 | Requires crawler-policy audit |
| Business identity & context | Structured organization name | 5 | HTML check |
| Business identity & context | Descriptive body passage | 8 | Paragraph-presence heuristic |
| Business identity & context | Contact route discoverable | 4 | Link-pattern heuristic |
| Business identity & context | Company context route | 4 | English URL-pattern heuristic |
| Business identity & context | Business name matches accessible branding | 4 | HTML check |
| Answer-friendly organization | Descriptive subsection headings | 5 | HTML check |
| Answer-friendly organization | Readable paragraph structure | 5 | Structural heuristic |
| Answer-friendly organization | Lists or structured facts | 5 | Structural heuristic |
| Answer-friendly organization | Answers satisfy customer intent | 5 | Requires editorial review |
| Evidence & accountability | Supporting claims and sources | 8 | Requires claim/evidence review |
| Evidence & accountability | External source labels | 4 | HTML check |
| Evidence & accountability | Publication/update date review | 4 | Markup observation + editorial review |
| Evidence & accountability | Responsible author or organization | 4 | Requires editorial review |
| Machine-readable consistency | Structured data parses | 3 | HTML check |
| Machine-readable consistency | Relevant schema type present | 2 | HTML check |
| Machine-readable consistency | Organization website consistency | 2 | HTML check |
| Machine-readable consistency | Structured claims match visible facts | 3 | Requires factual review |

## Verification and rollback

`.venv/bin/python -m pytest -q --tb=short` — 181 passed, one pre-existing upstream TestClient warning. `.venv/bin/python -m pip check` — clean. `git diff --check` — passed. New synthetic tests cover the above scoring cases, default profile separation, missing/failed/redirected robots, www target policy, public-IP/TLS binding, private-target rejection, compression decoding/expansion/total caps, request/redirect bounds and cancellation closing the run. Synthetic request-waiting is stubbed only in the new test harness; existing transport pacing tests remain active.

Same saved live VX Real snapshots: homepage SEO 100→100/GEO 93→100; Solutions 100/100 unchanged; Portfolio SEO 98→100/GEO 87→100. This is rule correction, not a live website change. Snapshot comparison retained privately under `private/reports/scoring-rules-0.3-2026-10-26/`.

Browser: actual live Portfolio scan with the audit profile succeeded, displaying version 0.3, SEO 100 (87% weighted coverage), GEO 100 (65%), footer identity pass and neutral heading/list review items. Server remains loopback-only. No other domain was crawled, no client changes, no public deployment, no extraction/publication milestone completion or paid model/API calls.

Rollback: stop local server and revert only L004 edits to the audit/scoring files and transport hooks while preserving prior L001–L003 work and user changes. No history rewrite. Next: obtain a specific other authorized URL and test it; document observed compatibility limits rather than bypassing them.

Primary references: [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html) and [Google robots interpretation](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec). These guide the distinction between missing policies and access errors; SAMPAN's bounded implementation has the limits above. A robots policy is not an authorization mechanism.
