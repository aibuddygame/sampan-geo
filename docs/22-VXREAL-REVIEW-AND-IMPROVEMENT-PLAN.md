# VX Real review and improvement plan

Reviewed 2026-10-26. Task L013: review existing procedures and implementation, identify defensible next improvements, and record a reusable operating procedure. This is a review/documentation deliverable, not a website release or a new scoring version.

## Scope and evidence

Inputs: core planning/schema/workflow/measurement documents; current intake, discovery, scoring adapter/UI, technical scoring, topic extraction, Kimi validation and offline rendering paths; existing tests; the 11 content pages in the prepared favicon deployment package; the retained L003 deployment checks and L012 live VX Real report. Existing working changes were preserved.

Local website source: `~/Downloads/VXRealWebsite/SEO-GEO-HANDOFF-2026-10-23-FAVICON/deploy/`. Private last live report: `private/reports/rendered-trial-2026-10-26/vxreal-final-report.json`. Raw/client evidence remains outside Git. This review did not recrawl VX Real or inspect its Cloudflare account; deployed parity is based on the dated L003/L012 evidence, not a new live assertion. This is a targeted functional/SEO review, not certification of every code path or a security penetration test.

Acceptance: trace recommendations to observed pages or implementation; reproduce consequential scoring weaknesses; distinguish known defects, review needs and unmeasured results; provide an executable-by-operator SOP and reusable client record; run existing regression checks and record actual results. No paid AI call or external write is needed.

## What is already established

- The prepared package supplies canonicals, unique descriptions, Organization/WebSite/WebPage records, Solutions Service records, sitemap, correct resource types, old-URL redirects, 404 content and favicons. Its visible body text was preserved during that technical work.
- L003 recorded working live robots, sitemap, company profile, optional llms directory and image resources. Do not reinstall them merely to increase a score.
- L012 reviewed eight pages with successful K3.1 keyword analysis. Primary-page readiness was SEO 9.1/10 and GEO 6.3/10. Twelve technical checks remained unknown; no confirmed failed/partial checks occurred in that report. The scores are not whole-site quality or search visibility.
- Missing dimensions may be handled by CSS. Missing dates may be reasonable on evergreen pages. A paraphrased organization description is not necessarily inconsistent. Unknowns require evidence, not automatic rewrites.
- Search Console, measured keyword demand, rankings, AI-answer citations and conversions have not been established by those scans.

## Prioritized VX Real work

| Order | Observed basis | Proposed change | Acceptance evidence |
| --- | --- | --- | --- |
| 1 | `/solutions` has four short service sections and contact calls to action | Expand the primary prototype-to-production service first: intended customer, starting inputs, assessment, deliverables, boundaries, engagement process and common questions. Use a dedicated page only when there is enough distinct useful content; keep Solutions as a hub. | Owner-approved facts; each target customer question answered visibly; unique page purpose; crawlable links; usable enquiry route. No invented prices, timelines or results. |
| 2 | Portfolio details are mostly project overviews, capability labels and a back-to-portfolio link | Select two owner-approved cases relevant to the priority service. Add VX Real's exact role, project status/date where relevant, problem, implementation, deliverables, constraints and permitted evidence. Include measured outcomes only when records support them. | Claim-by-claim evidence or dated owner verification; permission for client names/logos; clear past-project vs current-service distinction. |
| 3 | Solutions links to the general portfolio; inspected portfolio detail main sections link back to the hub | Link service explanations to specifically relevant cases and case pages back to applicable current services. Review context rather than adding the same keyword everywhere. | Intended links resolve to the correct pages; labels explain the destination; reviewer confirms the relationship. |
| 4 | Homepage research and ecosystem sections contain substantive research/client claims; audit cannot verify accountability or sources | Review research status, responsible authors/organization, source links, and permissions for institutional associations. Add accessible company context and a consistent approved summary. | Current vs historical claims separated; original research source located; no implied endorsement from a logo alone; visible and structured facts agree. |
| 5 | Mobile, image layout, performance and crawler-specific edge access are unmeasured | Inspect representative homepage, service and case page at mobile/desktop sizes; measure performance; inspect crawler policy and relevant edge settings with owner access. | Dated measurements, viewport/device details and actionable observations. Do not claim that changing a scanner user agent proves verified-bot access. Preserve `/api/contact` and confirm delivery with a separately authorized labelled test. |
| 6 | Prepared pages have no hreflang; HK/SG are proposed target markets | Research one service topic for HK English/Traditional Chinese and SG English; validate actual service availability. Prepare regional variants only when useful differences exist. | Reviewed local language and factual availability; correct equivalents/canonicals; reciprocal hreflang; no fictional office or cloned city pages. Missing hreflang on a single-language site is not itself a defect. |

Suggested first content brief: Product Launch & Scale, based on `/solutions#product-scale`. It already describes prototype assessment, security/reliability, cloud setup and possible substantial redevelopment. Ask the owner for deliverables, engagement steps, suitable/unsuitable project types and one approved example. Do not infer that an unrelated portfolio project proves this exact engagement model.

## Implementation findings and proposed backlog

These are proposed fixes, not implemented in L013. Existing test passes do not establish that the heuristics predict external outcomes.

| ID / priority | Evidence in current code | Consequence | Smallest fix and acceptance |
| --- | --- | --- | --- |
| R01 / high | `topics.py:analyze_topics` awards provider association using `we/our` and a title regex containing a literal `|`. | Punctuation can increase GEO credit without new identity evidence. Reproduced: identical synthetic content scores 1.0 then 2.0 for this component after adding ` | Example` to its title. | Use explicit provider/entity evidence; neutral punctuation changes must not alter credit. Keep uncertainty when identity is unresolved. |
| R02 / high | The same function awards full linked-support credit for any external HTTPS link in a topic section. | An unrelated link earns 2.0 points; reproduced on identical synthetic content. This is link presence, not verified support. | Separate link presence from relevance and claim support. Accept valid first-party evidence as well as independent sources where appropriate; unknown/unreviewed relevance cannot earn verified-evidence credit. |
| R03 / high | `kimi.py:Suggestion.keyword` accepts ASCII labels only; prompt requests English; `topics.py:TOKEN` and word-count rules are English-oriented. | Traditional Chinese label rejected with `string_pattern_mismatch`. Country/language scoring is not ready. | Add explicit language/market inputs and Unicode-aware segmentation/validation, review Chinese and English fixtures; preserve meaningful connecting words in natural query variants. Do not translate scores mechanically. |
| R04 / medium | `scoring.py` always says “No linked pages fetched in this single-page audit” for link availability, even when `related_pages` includes successful fetches. | Misleading evidence text and unused observations. Confirmed in the eight-page VX report. | Reuse observed URL/status/redirect records for checked destinations, mark remaining links untested; test mixed fetched/unfetched/failed targets. Never convert a sample into a whole-site pass. |
| R05 / high before client outcome claims | `scoring_app.py` takes no country/language/target-query configuration. `kimi.py` selects topics afresh; `topics.py` selects the strongest scored page per topic. | A changed keyword/page sample can look like improvement without a comparable target. | Freeze agreed query, intent, country, language, device and page mapping for comparisons; separate discovery mode from tracking mode; include rubric/model/acquisition/sample identity. |
| R06 / medium | `scoring.py` answer quality, sources, authorship and factual consistency remain hardcoded unknown. | An improved website cannot fully resolve these checks through the current scanner. | Add a separate dated evidence-review result tied to content hash and reviewer; invalidate approval on material changes. Reuse the existing fact/revision vocabulary. Do not add an arbitrary “verified” toggle. |
| R07 / medium | `topics.py` focus uses matched words divided by page words; detail/process/scope use word counts and keyword patterns. | A useful broad hub may score below a narrow page; repeated generic language can earn signals. | Evaluate the relevant bounded section and customer question coverage; add irrelevant-text and repetition controls. Avoid splitting pages just to earn points. |
| R08 / medium | The scorer combines meta robots and meta googlebot directives; renderer activates only for a script-bearing primary page under 100 characters, then sampling is based on initial links. | Google-specific restrictions may be described too broadly; partially hydrated or secondary JS content can be missed. | Report agent scope separately. Capture completeness per sampled page; surface coverage gaps before scoring. Keep bounded offline rendering and network protections. |
| R09 / medium | Runtime history is an in-tab map; exports are manual; Kimi call cap/cache reset with the process. | No durable client revision history, spend budget or repeatable managed-service record exists yet. | Start with private file-based client/run records and explicit budgets; no new database required for the next local unit. Preserve failed/interrupted cost uncertainty. |
| R10 / medium | UI foregrounds “Search visibility · not measured”; early master/measurement docs imply a mandatory Search Console baseline. | Users can mistake optional measurement for a blocker to improvement. | Align procedure now; later UI should say analysis completed and outcome tracking is optional. Missing account access must not reduce readiness scores. Do not imply a connector exists. |

Retain SSRF/DNS/redirect controls, truthful robots handling, bounded collection, source hashes, source-matched model excerpts, fixed point budgets, unknown/N/A distinctions, model cost counters and isolated rendering. Refactor duplicated extraction rules only with compatibility tests; no reason to replace the stack for this review.

## Next acceptance units

1. Correct R01/R02 and add invariant fixtures; establish a versioned rubric migration with same-content comparisons. This is the recommended next coding task, not authorized completion in this document.
2. Prepare the owner-reviewable primary service brief and two case-evidence records using the SOP. Content drafting can proceed without Search Console.
3. Add approved profile/review records and scoped link evidence; then regional-language support and optional outcome imports.

## Reference basis

- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features): accessible, useful text and consistent structured data; no special AI file/schema requirement or inclusion guarantee.
- [Helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): assess originality, completeness and trustworthy sourcing.
- [Regional sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites): explicit regional URLs/language alternatives rather than forced IP adaptation.
- [Search Console overview](https://support.google.com/webmasters/answer/9128668): registration is optional for appearing in Google. Performance data helps measurement, not permission to improve a site.

See [standard operating procedure](23-SEO-GEO-STANDARD-PROCEDURE.md) and [blank client record](templates/seo-geo-client-record.md). Exact test results and limitations are in the L013 progress entry.
