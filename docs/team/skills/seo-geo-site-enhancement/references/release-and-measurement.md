# Release verification and measurement

Use this reference for approved website releases, Google Search Console reviews and client reporting.

1. **Before editing:** Verify the site owner, the exact property and available access. Obtain a dated read-only API snapshot or client export when available. For one changed page, record the exact canonical URL filter and the sitewide totals separately. Save the dates, reporting timezone, search type, country, device scope, impressions, clicks, CTR, average position and data status. A response with no rows, withheld queries or unavailable data does not establish zero visibility.
2. **After publishing:** Record the release version and rollback. Compare expected live copy, metadata, canonical, indexability and structured data. Inspect initial HTML and rendered output separately when they differ. Check stable assets by hash when useful. Compare relevant parsed fields when the host legitimately injects scripts into HTML. For hostname changes, use an exact host match where possible. Verify HTTP and HTTPS aliases, an actual path with a query string, the redirect destination/status, and that the destination responds successfully. Preserve unrelated DNS, TLS and application settings.
3. **Inspect priority URLs:** Record each URL's coverage state, last crawl and Google-selected canonical. Sitemap success confirms sitemap processing. For a requested or authorized recrawl, use Search Console URL Inspection on the exact canonical URL and retain the confirmation privately. Log request accepted, observed recrawl, indexed status and measured outcomes independently. Avoid repeating a request while it is pending.
4. **Compare data:** Prefer two comparable 28-day periods of finalized Web Search data with the same scope, country, device and timezone. For a new site, begin its first baseline on the day after the first observed indexed crawl, noting if the true first crawl may have been earlier. For a changed page, keep exact-page results separate from property totals. Report low sample sizes, migrations, seasonality, campaigns and concurrent changes. Treat a before/after difference as an observation with attribution limits.
5. **Follow up only when requested:** Define the first review date, readiness criteria, cadence and stop condition. Keep monitoring quiet while data are pending unless access or a material problem needs attention. Report the outcome or remaining limitation at the deadline and stop. Keep credentials and raw exports private.

## Query-led FAQ updates

Use Search Console query and page data to choose one search intent the page can answer well. Track broad queries separately from specific questions. Treat very low impression counts as leads for investigation and extend the comparison window when they are too sparse for a useful comparison.

When an existing FAQ fits the intent and the client wants to keep the UI, revise it in place. Answer directly, add a worked example where it clarifies the answer, and link to a primary source when relevant. Preserve section order, anchor IDs and styling. Match existing FAQ structured data to the visible question and answer, verify the contents link at mobile and desktop widths, and compare the live assets against the prior release to check the scope.

## Handoff pilot scope

Use VX Real and ESGtrace for this handoff. Recheck each client's access, current public facts and selected canonical URLs. Existing manual tests are historical observations. Start a new campaign baseline when prompts, provider, model or interface differ. The handoff's client records describe known hosting and Google dependencies.

For a managed pilot, deliver the agreed scope, baseline, prioritized changes, live evidence and the next review. Keep technical readiness, Google search performance, AI answer citations and business outcomes separate. For GEO, use fixed branded accuracy and non-brand discovery questions, record provider, search mode, locale, date, mentions, cited URLs and answer accuracy, and repeat under comparable conditions. Keep any proposed rubric change separate from measured client outcomes.

[Google recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) · [Search Console performance reporting](https://support.google.com/webmasters/answer/7576553)
