# L026 — marksix.gold managed pilot and local Search Console connector

Prepared 2026-11-03–04 (Asia/Singapore). Development/preparation only; no public release.

## Acceptance unit
User asked to start other tasks with marksix.gold while VX Real DNS verification waits. Objective: prepare actual read-only Search Console integration and a concrete marksix pilot baseline/target/change brief. Inputs: existing permitted three-page/Kimi report, owner-confirmed existing Search Console property and a future Desktop OAuth client. Outputs: tested local CLI, private managed-pilot JSON/Markdown, missing-access instructions. Simplest approach: existing httpx for API requests plus optional official Google OAuth helper; no web callback, database or stack migration. Acceptance: test consent boundary/PKCE/state, read-only scope, exact pilot property allowlist, safe persistence, explicit empty/error states and filtered date/query/page/country/device capture; validate target/question evidence. Live Google consent/data retrieval remains conditional on actual credentials/access.

## Owner setup needed once
The owner selected “not created yet” for the Google Cloud OAuth project. Do not wait for VX Real DNS. Under aibuddygame:
1. Create/select the dedicated SAMPAN testing Google Cloud project; enable Google Search Console API.
2. Configure OAuth consent/testing, add the actual Google account as a test user, request only `https://www.googleapis.com/auth/webmasters.readonly`.
3. Create a **Desktop app** OAuth client and download its JSON. The CLI does not use a Web client or a callback on the scoring server.
4. Save it at `private/google/client_secret.json` in this checkout. Restrict its permissions to 0600. Never paste its contents into chat or put it in Git/browser code.

```sh
mkdir -p private/google
chmod 700 private/google
# Place the downloaded Desktop OAuth JSON here before the next command.
chmod 600 private/google/client_secret.json
.venv/bin/python -m sampan.search_console authorize
```

The official helper opens the system browser; **the owner signs in and grants consent themselves**. It binds only 127.0.0.1 on an ephemeral port with a 180-second timeout and PKCE/state validation. Only an explicitly read-only offline authorization is saved. It does not replace an existing token automatically. For refresh/revocation failure, retain/archive old material explicitly before reauthorization; do not silently delete it. Testing-mode Google refresh tokens may expire after seven days; this is not a permanent production authorization setup.

The read-only OAuth scope can cover every Search Console property that Google account can access; Google does not offer a per-property version of this scope. This pilot's API adapter only queries exact allowed marksix properties. It does not list properties publicly or alter user permissions.

## Fetch a real baseline after authorization
Example of a fixed historical 28-day window (not a claim that data exists):

```sh
.venv/bin/python -m sampan.search_console fetch --start 2026-10-03 --end 2026-10-30 --country hkg
```

Country values: `hkg`, `sgp`, or `all`. Hong Kong is a proposed starting market, to be confirmed. All devices are included and query rows retain device. Date range must be 1–90 past calendar days; Google report dates use Pacific Time, retained explicitly. Uses `type=web`, `dataState=final` and the original start/end/filter payload. No language filter is inferred from country; query language requires separate review.

Each fetch refreshes credentials, lists actual property access and selects the first accessible of `sc-domain:marksix.gold`, `https://marksix.gold/`, `https://www.marksix.gold/`. Unsupported HTTP/subpath properties require deliberate configuration review, not silent widening. Owner/full/restricted properties are allowed; unverified access is rejected. Requests: one refresh, one sites list, three reports (totals, daily, top1000 query/page/country/device rows); fixed Google endpoints, redirects/proxies disabled, 20-second network timeouts, two-MB response cap, no retry. No provider body/token appears in console errors or reports.

Snapshots are append-only 0600 JSON under ignored `private/google/performance/`; refresh token is separate at `private/google/token.json`, access tokens stay in memory. Empty data is `no_rows_returned`, not zero readiness or zero visibility. Privacy suppression/internal Google limits remain; top query rows are not a complete keyword universe, and their totals need not equal property totals. Average position is not first-page probability. This CLI does not change existing readiness scores or claim measured GEO citations. It does not yet render Google snapshots in the pilot dashboard or schedule fetches.

Optional install on another development machine: `.venv/bin/python -m pip install -e '.[google]'`. Normal app/scoring dependencies do not require Google OAuth to run. OAuth-helper-specific tests skip when this optional extra is absent.

## Prepared marksix pilot artifacts
Private review pack: `private/pilots/marksix-gold/2026-11-04/PLAN.md` and `pilot.json`. Based on saved scan997f433b85e18b51e5907a40, not an additional live crawl or paid call. Includes:
- Source-hashed page baselines, explicit initial/rendered distinction and independent target dates.
- Nine descriptive Traditional Chinese keyword candidates mapped to observed pages/quotes, with demand/position left null. Third-party support-directory phrase excluded from acquisition candidates.
- Ten fixed AI questions with source-backed expected-answer boundaries, unmeasured result fields and provider/date/search-mode instructions.
- Prioritized change briefs: initial-HTML content parity, useful query explanations, accurate tool identity/schema, dated sources, mobile/performance and approved release/rollback. Unknown observations are not automatic defects.

This is a proposed working plan, not owner-approved targets or applied client changes. Existing forms, gameplay, source code, tracking, official-source disclaimers and no-prediction limitations are preserved. Daily changes, automated backlinks/publication, result generation and betting interactions are excluded.

## Validation and current limits
See docs/10-PROGRESS.md for exact test evidence. No actual Google client, token, consent or Search Console response is available yet; integration is implemented and mock-verified, not live-connected. Account setup is the next dependency. Public SAMPAN deployment is unnecessary.

References: [Google Desktop OAuth](https://developers.google.com/identity/protocols/oauth2/native-app), [Search Analytics query/limits](https://developers.google.com/webmaster-tools/v1/searchanalytics/query), [property access list](https://developers.google.com/webmaster-tools/v1/sites/list), [OAuth testing-token lifetime](https://developers.google.com/identity/protocols/oauth2).

## L027 live verification (2026-11-05)
Owner consent and live read-only marksix property/data retrieval are now verified, superseding the preparation-only status above. Three dated snapshots are saved under private/google/performance; sanitized baseline summary is under private/reports/google-connection-2026-11-05. Current Google account/client setup is complete for the local marksix CLI. Dashboard data/status integration remains a separate next unit. See progress for actual metrics, dates and limitations.
