# SAMPAN SEO/GEO standard operating procedure

Version 0.2, 2026-11-09. Operator procedure informed by VX Real, marksix.gold and Genie Life. This is a repeatable service process, not a claim that every stage is automated or implemented. Use the [client record template](templates/seo-geo-client-record.md).

## Operating rules

The goal is useful, accurate and discoverable client content. Technical readiness, organic search performance, AI-answer visibility and connected-agent access are separate outputs. No score is a percentage chance of ranking. Optional files, word counts or markup presence alone do not establish answer quality.

Search Console connection/export is optional. Start improvements using website and owner evidence; label unavailable outcomes “not measured.” Capture a baseline when available before release. If a baseline is missing, record that limitation and do not invent a before/after uplift. The local read-only [Search Console connector](29-MARKSIX-LOCAL-MANAGED-PILOT.md) has been verified on marksix.gold. Client dashboard import is pending. Verify access to the exact property and keep access tokens, snapshots and client data private.

Keep one canonical business profile per business, with page records and regional overrides. Separate independently operated businesses even if they share a host. Facts require source evidence or owner confirmation; extraction is not approval. Start with private structured files, using docs04's existing verification vocabulary, rather than introducing a knowledge database prematurely.

## Repeatable stages and exit checks

| Stage | Inputs and action | Output / exit check | Current delivery mode |
| --- | --- | --- | --- |
| 1. Scope | Authorized domains, owner, business goal, priority services, target countries/languages and collection constraints | Named owner, allowed scope, budget and success measures recorded; collection permission distinct from publishing permission | Manual |
| 2. Capture | Bounded permitted fetch; record URLs, time, hashes, redirects, robots and coverage. Use isolated rendering only when needed | Reproducible source manifest or clearly partial capture; no score based only on an empty shell; archived private evidence | Existing collector/trial plus operator records |
| 3. Baseline | Run versioned technical/content audit; inspect sample coverage; collect optional performance exports | Defects, review needs and missing measurements separated. Initial and rendered evidence remain distinct | Existing trial; read-only local connector or client export |
| 4. Knowledge review | Extract identity, current services, past projects, research, contacts, markets, dates and limitations with sources | Owner-reviewed revision; unsupported facts null/omitted; private data and logo/client permissions reviewed | Manual profile; canonical automated T001 approval pipeline pending |
| 5. Query plan | Site-derived topics → owner relevance review → optional demand/competitor research by market | Agreed query/page/intent/country/language matrix. Suggestions without demand evidence remain candidates; up to nine trial cards, no filler | Suggestions implemented; research and target matrix manual |
| 6. Improvement plan | Inspect access defects first, then customer questions, evidence, internal links and conversion journey | Each recommendation has URL, evidence, action, effort, dependency, acceptance check and rollback. Rank by business usefulness and confidence, not score weight alone | Manual with audit assistance |
| 7. Prepare | Edit approved copy and relevant technical files in a reviewable draft; derive markup from the same factual revision | Diff/preview; consistent visible/structured facts; no invented dates, outcomes or service availability; original assets preserved | Manual/site-specific |
| 8. Review and release | Validate facts, routes, metadata, markup, mobile behavior and contact flow; owner approves exact revision | Versioned deployment package, checksums where useful, release log and rollback. Only authorized deployer publishes | Manual approval/deployment |
| 9. Live acceptance | Check deployed URLs/resources and actual headers; verify missing-page/redirect behavior and approved functionality | Observed deployed revision and discrepancies recorded. Log per-URL indexing and any authorized recrawl request separately from live release checks. Contact submission requires authorization and receipt evidence | Bounded checks + operator |
| 10. Measure and iterate | Reaudit unchanged targets; compare optional organic/AI/conversion observations | Explain technical fixes separately from visibility changes; list confounders and next action; schedule only if requested | Local connector or export; manual AI benchmark; authorized Codex follow-ups |

## Minimum knowledge record

Use business ID, official domain and aliases, approved name/summary, current services, projects/research with status, contact channels, regions/languages, claim evidence and revision/reviewer/date. Each claim includes source URL/hash/locator/observed date or an owner statement reference and approval date. Public HTML, JSON-LD and future API outputs must use the same approved revision. Changes invalidate affected approvals; preserve history.

Do not publish the internal record wholesale. Public company JSON-LD can expose suitable approved facts. `llms.txt` is an optional maintained directory, not a ranking prerequisite. No MCP/API deployment is necessary to improve client pages.

## Page brief used for every substantive improvement

Record the page's audience, intent, primary topic, target market/language and desired visitor action. Cover the customer problem, offered capability, suitability, steps, inputs/outputs, constraints, evidence and useful questions. Include related service/case links and an appropriate enquiry route. Use the amount of text needed to answer the question; do not enforce filler word counts, artificial keyword density or unnecessary FAQ/schema blocks.

Choose an existing page when it already serves the intent. Create a new page only for a useful distinct purpose. Preserve established URLs where feasible; migrations require a redirect map. Confirm future promises, client names, metrics and claims of compliance before publishing.

## Country and language procedure

1. Record real service availability and target audience. Research demand in each country/language; a short topic card is not proof of popularity.
2. Localize the answer, examples, terminology, contact arrangements and commercial details where factual. Human-review translations. Do not invent local offices, accreditation or customer results.
3. Use separate crawlable URLs for actual variants and a user-selectable language/region path. For equivalent HK/SG variants, consider `en-HK`, `zh-Hant-HK`, `en-SG`; reciprocal/self hreflang and an appropriate fallback must reference working pages. Agree canonicals according to actual content/duplication; do not collapse every regional page to the global homepage.
4. Validate sitemap/indexability/internal links and canonical/hreflang agreement. No forced location redirect that hides alternate content from crawlers.
5. Earn relevant local references; use business listings only when eligible and factual. Paid partner links must be appropriately qualified; no fabricated reviews or link schemes.
6. Measure with country, language, device, engine/provider and date recorded. HK vs SG is a market comparison, not a randomized A/B test. L017 adds experimental Traditional Chinese/mixed-language analysis (docs24); source handling is tested, but live Chinese semantic quality, market relevance and language calibration remain validation gates before commercial accuracy claims.

## Measurement contract

| Measure | Required record | Interpretation |
| --- | --- | --- |
| Readiness | URL, source hashes, sample coverage, acquisition mode, rubric version, checks and reviewed evidence | Compare like-for-like; changed rubric, capture or targets require a new baseline. Unknown is not a confirmed defect. |
| Organic search | Property and dated export/API source, exact URL or sitewide scope, query/country/device, search type, reporting timezone, finalized period, impressions, clicks, CTR and average position | Search Console averages describe observed impressions, not a universal first-page guarantee; unavailable/anonymized queries are not zeros. |
| Fixed position sample | Agreed keywords, location, language, device, engine, timestamp, result URL and observation source | Report sampled top-10 organic presence as count/denominator; declare no-result depth and failed observations separately. Do not call it the probability of first-page visibility. |
| AI visibility | Fixed question set, provider/model if exposed, search mode, locale, timestamp, repeats, answer, citations, correctness and factual reviewer | Report mentions and citations separately; citation must resolve and support the answer. Provider/network failures are unmeasured. A small benchmark is directional, not universal. |
| Business result | Defined enquiry event, consent-appropriate analytics/source, period and qualified leads | Track the business objective; distinguish paid and organic traffic, seasonality and other changes. |

Verify the release on deployment day. When data permits, compare 28 complete days of finalized data with matching search type, country, device and URL filters. For a page edit, report exact-page and sitewide changes separately. For a new site, record the first observed indexed crawl and start the baseline on the next complete reporting day. Record when the first crawl may have happened earlier. Separate request accepted, recrawled, indexed and measured. Codex follow-ups are available when authorized, with a readiness condition and stop date. For a first AI benchmark, agree ten relevant questions and repeat the exact set; preserve prompts and exclusions. Known company questions test accuracy; non-brand discovery questions test whether the business appears among relevant options. Do not conflate the two.

## Release and rollback checklist

- Preserve current production backup, functions/Workers, contact routes, bindings and secrets. Merge headers/redirects into existing settings rather than replacing them blindly.
- Verify page status, intended canonical, title/description, internal links, visible/structured consistency, sitemap entries and resource types. For hostname changes, check both schemes, an actual path and query string, and the destination response. Preserve existing edge and origin settings and verify rules match only the intended hostname.
- Inspect mobile/desktop layout, accessibility and performance with actual observations. Browser rendering for extraction alone does not certify these.
- Preserve SEO/GEO, search/retrieval crawler access and training preferences as separate policy decisions; respect actual restrictions.
- Record exact approved revision, deployment actor/time, checks performed, failures, rollback version and owner acceptance. Never mark publication from a local ZIP or preview alone.
- On regression, restore the approved prior deployment through its existing mechanism; retain evidence and the failed change record.

## Product implementation order

First correct scoring invariants R01/R02 from [the review](22-VXREAL-REVIEW-AND-IMPROVEMENT-PLAN.md). Next add private client/revision records and source-bound human review, then use fetched link evidence, fixed targets and language support. Optional performance imports and AI benchmarking follow. Client accounts, automated CMS publishing, billing, public APIs and new infrastructure need separate scope.

## References

[Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [regional sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [Search Console performance](https://support.google.com/webmasters/answer/10268906), [Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies).


## L014 pilot application note
On 2026-10-26 the owner-confirmed shared English offer for Hong Kong, Singapore and Southeast Asia justified one useful Markets page, not duplicate country pages. The local handoff preserved the form contract, added source-derived project summaries and validated every local URL/fragment, schema identity and ZIP/file hash. Keep backup/instructions/private claims outside the public upload root. Use an original-file hash guard before replacing a user-selected folder; a supplied-folder backup is not evidence of production backup. See the dated L014 progress entry for exact checks and remaining live gates.


## L015 presentation-preservation correction
The owner preferred the original concise site over L014's expanded rewrite. The preferred 2026-10-26 draft is now L015: original 73-file structure, unchanged headings/hero/paragraphs and executable scripts, only short service/project links and an owner-confirmed regional footer sentence plus synchronized schema/image-loading refinements. L014 remains historical, not the preferred upload. Future improvements should preserve the client's visual/editorial style by default, preview small additions first and avoid new pages/sections merely to raise audit scores. Any later expanded service page or case-evidence addition is a separate scoped revision.

## L023 keyword-discovery refinement
Separate named projects/case studies from descriptive discovery queries. Short Chinese subjects need page-supported context, with original wording and qualifier provenance retained; composed queries must not be labelled literal quotes. Source-role/qualification heuristics in docs26 are experimental and demand remains unmeasured. Do not drop project evidence or claim that every historical capability is currently offered.
