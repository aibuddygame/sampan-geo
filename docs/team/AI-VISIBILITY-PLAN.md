# AI visibility beside Google keyword reporting

This is the colleague's implementation brief. Documentation and source packaging are complete for handoff; the following feature units remain pending.

## V001 — Configure the two clients and Google reporting

Objective is to select VX Real or ESGtrace explicitly through every local reporting route. Inputs are the existing prototype and verified property permissions. Outputs are client-specific audit history and dated Google query tables.

Reuse the pilot registry and read-only connector. Configure IDs vx-real and esgtrace with explicit accepted host aliases. Generalize ScanInput.pilot, saved-report directories, credential mapping, property allowlists, latest-snapshot selection, endpoint names, client preview and HTML labels together. Preserve prior reports under their original IDs. Confirm one client's report cannot be returned by another client's endpoint, credential or query parameter. Unknown access shows a setup state rather than a blank score.

The teammate release includes all four runtime HTML files; preserve this and smoke-test an installed wheel when changing packaging. Keep editable development as the normal local path. Acceptance requires both configured clients, blocked cross-client reads, actual property selection and exact query/page/country/device filters. Fixtures cover missing/expired credentials and no rows. Existing snapshots retain their original schema and ownership.

## V002 — Store evidence from actual AI answers

Objective is to record an answer, mentions and citations with reproducible settings. Inputs are templates/prompts.json, a provider contract and owner-approved budgets. Outputs are private dated runs matching the visibility skill's measurement contract.

Start with manual evidence import and deterministic validation fixtures. Add one supported search-enabled provider adapter after the owner chooses an API account, model and spending cap. Gemini with Google Search grounding is a candidate. Verify the exact current API and citation fields from its official documentation before coding. Keep Kimi keyword generation separate. A provider's API mode is a distinct campaign from its consumer browser product.

Use server-side credentials, bounded time/output, explicit concurrency and attempt caps, per-run token/search usage, and a declared currency budget when usage pricing is known. A scheduler retry reuses the original run identity; it must not silently overwrite an answer or spend repeatedly. Save an error attempt with its reason. Unknown cost remains unknown. Do not schedule recurring calls until caps, logging and cancellation work.

Store structured provider citations separately from free-text links. Count a domain citation only when a supported citation annotation or reviewed source reference points to an approved exact hostname or subdomain. Save original and resolved public URLs when resolution is necessary. Apply the existing SSRF/DNS/redirect rules and a separate request budget to any URL resolution. Avoid fetching every cited page automatically.

Acceptance requires a retained real response or an explicitly labelled manual capture, correct target-domain matching, distinguishable third-party citations, replayable extraction, explicit failed/no-search states and documented cost. Synthetic fixtures are never shown as live outcomes.

## V003 — Combined local report

Objective is one client report with measured AI visibility alongside the Google keyword table. Reuse existing HTML tables, loopback guards and append-only storage. Add provider/date/filter selectors and evidence links. Escape model text and URLs. No script/HTML from a response executes in the dashboard.

Display three distinct panels. Readiness retains the current versioned scores. Google shows query, ranking page, impressions, clicks, CTR, weighted average position, Pacific dates and final/preliminary state. AI shows prompt, branded/discovery type, provider/model/mode, run time, search status, target mention, target citation, cited pages, factual review and evidence reference.

Link each agreed keyword or topic to separately versioned question IDs. A Google query and a conversational prompt are different measurement units. Use a many-to-many mapping where justified. Do not derive an AI position from Google position or vice versa.

Show mentions and citation rates by provider and prompt class, plus completed/expected/error counts. Preserve counts alongside percentages. Branded prompts identify the target and must be reported separately from discovery prompts. Do not use provider source ordering as recommendation rank without an explicit ranking rubric.

Acceptance requires switching between both clients, no mixed histories, useful empty/error states, filter-consistent rates, reopened evidence, and accessible mobile tables. Refreshing a report must not trigger a provider call. Use an explicit authorized run action.

## V004 — Two-site pilot and handoff review

Run the frozen English question set for each client with the same provider/model/search mode and documented Hong Kong audience context. Record whether the provider actually supports geographic targeting. Store locale requested and locale observed separately. Obtain owner review for factual errors and recommendations before editing client content.

Capture Search Console baselines when access exists; unavailable access does not invalidate the independent AI experiment. Compare matching finalized Google windows and matching AI campaigns separately. A one-off answer does not establish stable visibility or improvement. Repeated runs and additional providers are subsequent budgeted work.

## Sources and provider selection

Semrush is a product reference for reporting and prompt tracking. SAMPAN's first dataset is the configured campaign, not a broad market index. Display its sample coverage openly. [Semrush metrics](https://www.semrush.com/kb/1594-ai-seo-metrics)

Use the official provider's current grounding and attribution guidance, including any required search suggestions or source displays. API availability, billing and citation formats can change. The initial provider/model is deliberately an owner decision. [Gemini search grounding](https://ai.google.dev/gemini-api/docs/google-search)

Google supports query/page/date/country/device filters and may omit some queries. Preserve the exact property and returned coverage. [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
