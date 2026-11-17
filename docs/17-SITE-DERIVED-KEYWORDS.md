# L007 — Site-derived keyword suggestions

## Objective and acceptance
User correction: analyze each website first and derive its own related keyword suggestions, rather than match the same eight AI labels. Input: existing permitted page sample or one owner-supplied HTML file. Output: up to ten evidence-supported, site-derived English keyword phrases with separate SEO/GEO content-signal scores, source hash/excerpt, selection method and explicit demand status.

Simplest approach: replace `topics.py`'s AI catalog with bounded deterministic phrase extraction. Reuse existing collector, API, UI and exposed component scoring. No LLM, dependency, credentials or paid service required. Acceptance: unrelated industries yield different relevant phrases; no default AI labels or filler; new content at the same URL recomputes suggestions; evidence/math/security tests and a live VX Real browser scan pass. T001 remains separate.

## Extraction and ranking (`site-topics-0.2`)
- Clean body text using the existing head/script/style/template/noscript/nav/footer/hidden exclusions. Also inspect page titles, heading text and meta descriptions as candidate signals. Computed CSS and JavaScript are not rendered.
- Extract observed 2–4-word English phrases. Linguistic connecting/action/boilerplate words split candidate spans; never delete a connector then concatenate unrelated words. Exclude generic-only fragments and observed company/domain names, including phrase fragments of explicitly labelled clients/customers. Product names remain eligible. Short parenthetical acronyms are removed before mining to avoid fragments such as a repeated name suffix plus its abbreviation.
- Weight title mentions 10, H1 9, other headings 7, meta description 4 and content-block presence 1. Per-unit repetition adds no credit; cap each phrase at 24 credit per page. Add 3 per source URL and 5 for heading evidence, then a 12% multiplier for each word beyond two.
- Prioritize complete short heading/title spans, then other heading-backed phrases, then repeated body candidates; rank within each group by the above salience score. This measures site relevance only, never search popularity.
- Candidate generation inspects at most 100 headings, one description and 250 cleaned blocks per page, each truncated at 2,400 characters. Cap distinct candidates at 10,000; retain up to 60 non-overlapping candidates for assessment. Collapse contained/overlapping phrases with conservative plural normalization. Select at most ten candidates with substantive source evidence; never fill to ten with defaults.
- A topic heading can supply context to paragraphs in a small section/article/card; a matching title and H1 can supply context to a focused page. A matching heading with no substantive description cannot manufacture a score.
- IDs are stable hashes of normalized phrases. Query ideas are currently the observed phrase itself, not a fabricated keyword expansion. Selection is recalculated per request, including different content submitted for the same URL.

## Scores, discovery and limitations
Keep ten exposed 0/10/20 content-signal components from L006; replace the AI-specific explanation gate with general topic explanation. Select one strongest observed page per phrase. `topic-signals-0.1` and manual pilot scores are not comparable with these results.

Linked-page discovery no longer depends on AI vocabulary: consider observed descriptive same-origin HTML links; prioritize common service/product/portfolio/menu/treatment/course collection hubs before other descriptive links and generic calls to action. Ignore login/checkout/legal links, queries, assets and API paths. Preserve the existing eight-page/depth-two/24-request/75-second safety and partial-result behavior. Discovery is a bounded sample and does not guarantee the best ten site-wide topics.

Every report explicitly includes `demand.status = "not measured"`, source/volume/competition null, and each card's demand status. The UI states that popularity, search volume, cost, competition, Google positions and AI citations are not measured. No popularity is inferred from on-site repetition. A demand-data provider or owner export is a separate next task before describing candidates as "hot" or commercially validated.

English token/phrase heuristics can produce awkward labels, miss synonyms, ignore single-word categories and miss non-English topics. Human review is necessary. Organization schema is an untrusted exclusion hint, not verification of a business identity. Named projects/research do not prove a current offering. The existing technical page rubric remains unchanged.

## Verification and rollback
Run `.venv/bin/python -m pytest -q --tb=short`, focused saved-input comparisons, live VX Real browser review and `git diff --check`; record actual results in progress. Bakery/dental checks are synthetic fixtures, not crawls of unrelated websites. Preserve historical L006 records, private reports and existing working changes. Roll back only L007 changes to topics/UI/tests/docs; no public deployment or client changes.
