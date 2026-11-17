# L025 — Local application with real external integrations

Date: 2026-11-03 (Asia/Singapore). Local development acceptance unit, separate from T001.

## Objective and acceptance
Run SAMPAN only on loopback, while using permitted live pilot websites and the production Kimi API. Inputs: owner-authorized VX Real/marksix.gold URLs, backend-only provider credential, bounded capture settings. Outputs: source-backed keyword drafts, deterministic readiness audits, actual provider usage, locally saved/reopened reports and explicit connection states. Acceptance: authenticate the requested model, run both pilots through the existing `/scan`, inspect AI/evidence/capture results, verify saved report equality and local UI, and pass focused regression checks. Missing search accounts must remain disconnected, not simulated.

## Integrations and boundaries
- Existing safe `httpx` collection checks robots, DNS/IP/redirect policy and page/byte/time limits. Related-page review remains eight pages maximum. No client-site writes or deployment.
- Existing isolated Playwright capture supports JavaScript-dependent pages; browser/API/form restrictions remain intact. Capture mode appears in each report.
- Kimi `kimi-k3.1-pro` uses the official Chat Completions endpoint, bounded excerpts, source-quotation and semantic-reference validation, one completion per uncached scan and ten attempts per server process. No model-generated headline scores. No web-search tool is enabled in this adapter.
- Local reports survive restarts and reopen without another collection or completion. Earlier reports remain untouched. Compare consistent evidence modes and methods; a different keyword set is not proof of website improvement.
- Search Console, search-position/demand data, independent AI-answer citation measurement and analytics reporting remain unconnected. Kimi keyword generation is not an AI visibility measurement.

## Configuration and connection diagnostics
The owner-provided Kimi credential is held in ignored backend `.env` (mode 0600), read through `Settings`/`SecretStr`. Never include it in source, `.env.example`, browser code, exports or Git. Environment variables override dotenv. `.env.example` remains credential-free. This is a local developer setup, not a hosted secret manager.

Start from the repository root:

```sh
.venv/bin/python -m uvicorn sampan.scoring_app:create_scoring_app --factory --host 127.0.0.1 --port 8004
```

Open `/pilots` for live connection status. GET `/integrations` reads in-process state without contacting providers. POST `/integrations/check` requires the existing page nonce and verifies only the fixed Kimi model-list endpoint: no completion charge, no redirects/proxy inheritance, 128 KB response cap, 20-second total/15-second network timeout, 60-second diagnostic cache. A verified authentication check does not prove a successful generation; completion status/token usage is reported separately. Remote clients are rejected by the existing loopback/Host policy. No credential entry endpoint is added.

Restarting resets the in-process connection check, usage counter and content cache; saved reports retain their own usage history. The ten-attempt cap is per process, not a monthly dollar budget. Dollar estimates remain unknown; consult provider billing.

## Search Console preparation confirmed by owner
Owner reply on 2026-11-03: VX Real has no Search Console property; marksix.gold already has one; no Google Cloud OAuth client is configured.

1. VX Real: owner creates/verifies the appropriate property in Search Console. Domain verification normally needs DNS action; this task does not perform it. Confirm property identity before using its data.
2. marksix.gold: confirm the existing property URL, the signed-in owner's access and the account to authorize. Until OAuth is ready, a dated performance export can support manual analysis; an import feature is not yet implemented.
3. Create a Google Cloud project or choose an existing approved one, enable Search Console API, configure OAuth consent/testing users and create a suitable OAuth client. Retain ownership with the client. Choose the OAuth flow before implementing a callback/token store; no callback is registered by this prototype.
4. Implement and authorize read-only `https://www.googleapis.com/auth/webmasters.readonly`, then verify actual property access. Client ID alone is insufficient. Do not request shared Google passwords, copy browser cookies or claim that an API key grants private search data.
5. Query dated finalized performance with query/page/country/device context and preserve original periods/filters and missing/suppressed rows. Do not interpret average position as first-page probability or causal uplift.

No Google resources, tokens, ownership grants, DNS records or scheduled jobs were created. This account setup and the read-only connector are the next acceptance unit. Public SAMPAN hosting is unnecessary for a correctly implemented local OAuth testing flow.

Official sources: [Kimi Chat Completions](https://platform.kimi.ai/docs/api/chat), [Search Console authorization and read-only scope](https://developers.google.com/webmaster-tools/v1/how-tos/authorizing).

## Verification
Final live pilot results and test/browser evidence are recorded in docs/10-PROGRESS.md; private reports reside under `private/reports/live-integrations-2026-11-03/` and `private/pilot-reports/`. No publication or search-outcome uplift is claimed.

## Follow-up L026 (2026-11-04)
The [local read-only marksix Google connector](29-MARKSIX-LOCAL-MANAGED-PILOT.md) is now prepared and mock-tested. Earlier references to an unimplemented connector describe the L025 state. Real Google credentials/consent/property/data verification remain pending; no search-feedback connection is claimed.
