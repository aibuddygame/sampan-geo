# L011 — Nine keywords and verified readiness out of ten

## Scope and acceptance
User requested a nine-keyword 3×3 grid, scores out of ten with at most one decimal, and a more detailed audit that explains why the old all-100 results did not establish search visibility. Input: existing authorized primary page and bounded sample. Output: at most nine supported keyword cards, consistent 0–10 API/UI score units and a 55-check audit with visible verified, unresolved and confirmed-gap credit. Simplest approach: reuse the existing collector/model, rescale keyword arithmetic, extend deterministic sample checks and change the technical summary denominator. Acceptance: no filler keywords, output caps at both model validation and local extraction, exact point budgets, uncertainty semantics, safe source-bound sample comparisons, browser/export proof on VX Real and passing regression tests. No demand/ranking API or deployment.

## Why the old scores reached 100
`weighted-page-0.3` divided earned credit by evaluated weight, excluding unknowns. VX Real passed the evaluated homepage checks: 100 described that subset. Coverage was only 89% for SEO and 66% for GEO. These were provisional basic checks, not a finding that all relevant quality or competitive conditions were satisfied.

The new `verified-page-0.4` headline measures verified credit across the complete applicable rubric. This changes the meaning of the metric; it must not be presented as a website deterioration. A technical result still does not measure ranking or citation likelihood. Google's [SEO guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) and [technical requirements](https://developers.google.com/search/docs/essentials/technical) distinguish basic eligibility from search appearance and rank.

## Technical/evidence calculation
Each group has a ten-point budget. Let A be applicable weight, E earned evaluated credit, T evaluated weight and U=A−T unresolved weight:

- Verified readiness = 10×E/A, rounded to one decimal.
- Possible ceiling = 10×(E+U)/A, assuming every unresolved check passes; this is not a prediction.
- Evaluated coverage = 100×T/A.
- Confirmed gap = T−E, separately displayed from unresolved credit.
- N/A is excluded from A. Unknown remains unknown and earns no verified credit; it is not recorded as a failure. If nothing is evaluated, the score is null.

Categories use the same calculation. Green denotes verified credit, grey unresolved credit and red an observed gap. Fully evaluated passing categories can legitimately reach ten; no arbitrary ceiling is imposed. `observed_score` retains the rate among tested checks for diagnostics, not the headline. The old 60% coverage gate is replaced by this explicitly partial verified-credit metric and its uncertainty ceiling. Lower coverage means less verified credit, not proof of poor website quality. Unmeasurable checks may later be judged N/A by an appropriate review; the displayed ceiling assumes current applicability stays fixed.

The original 49 check weights are multiplied by 0.08, giving eight points in each group. Add:

| Group | New check | Weight | Interpretation |
| --- | --- | ---: | --- |
| SEO | Distinct titles in sample | 0.5 | Exact normalized duplicate observation |
| SEO | Distinct summaries in sample | 0.5 | Exact normalized duplicate observation |
| SEO | Distinct preferred canonical URLs in sample | 0.5 | Relative URLs resolved; aliases may be intentional |
| SEO | Distinct main content in sample | 0.5 | Exact normalized text excluding shared navigation/footer/hidden/script content |
| GEO | Structured description supported by visible text | 1 | Literal normalized provenance; paraphrases require review |
| GEO | Consistent declared identity across sample | 1 | Shared named business or declared alias; not ownership verification |

Four distinctness checks require at least two distinct sampled URLs and usable values for every page; incomplete observations remain unknown. Exact duplicates earn half credit with explicit contextual review advice, not a Google duplicate-content penalty claim. Intentional duplicates/aliases may be valid. Identity differences and description paraphrases remain unknown rather than invented failures. Sample checks use at most eight already supplied same-site pages; no added network fetches, external URL traversal or site-wide absence claims. Raw URLs resolve the evidence; report source lists identify the compared pages.

## Keyword cap and scale
Model prompt/schema/output validation and local candidate selection cap at nine. Sparse sites can produce fewer; no fabricated cards fill the matrix. Desktop uses three columns, narrower layouts two or one. Topic scores and component points are all rescaled by ten, including phrase baselines and JSON exports: five components, each capped at two, total ten. Scores display integers or one decimal as needed; detailed technical weights can retain two decimal places to avoid hiding small weights. Topic versions become `site-topics-0.3`, `kimi-keywords-0.2` or `kimi-semantic-0.3`; prompt/cache version changes too. A keyword's pure scale change carries no website improvement claim.

## Visibility and next work
A separate unmeasured visibility section explains that index inclusion, actual positions, demand and AI citations need external observations. Show concrete next steps for a dated Search Console query/page export, keyword/country/device/date position measurements and a fixed AI question/citation benchmark. Do not insert fabricated zero rankings or imply the verified readiness number is first-page probability. Performance/mobile rendering, platform-specific policy, claim truth and customer-answer quality remain unresolved until measured/reviewed. These limits now have a dedicated verification section and all detailed checks remain filterable/exportable.

Current live evidence and exact checks are in `10-PROGRESS.md`. Historical reports retain their versions and units. No T001 advancement, client-site changes, publication, credential persistence, commit or push. Next: obtain real search-performance evidence before adding a visibility score.
