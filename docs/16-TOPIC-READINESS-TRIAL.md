# L006 — Short-topic localhost trial

**Historical:** the fixed AI catalog was replaced by [L007 site-derived keywords](17-SITE-DERIVED-KEYWORDS.md). These notes describe the prior implementation.

## Objective, input and output
User-approved local extension: an authorized HTTPS URL (optionally up to eight linked pages) or one owner-supplied HTML file produces supported short AI-topic cards, each with separate SEO/GEO **content-signal** scores, source evidence, query ideas, component points and recommendations. The submitted page's existing 49-check technical audit remains separate. T001 inventory/extraction/publication status is unchanged.

Simplest approach: `topics.py` contains a deterministic English catalog and presence heuristics. Existing local FastAPI adapter and plain HTML UI render it without LLMs, new dependencies or paid APIs. This is a prototype for these AI topics, not an arbitrary-industry keyword discovery engine.

## Selection and interpretation
Catalog: AI App, AI Voice, AI Human, AI ESG, AI Workflow, AI Documents, AI Carbon and AI Translation. Only supported matches are shown; there is no filler to reach ten. Short topic labels group longer query ideas; connecting words in actual phrases are preserved. Query ideas are templates, not evidence of search demand, difficulty or offered services.

Exclude head/script/style/template/noscript/nav/footer, HTML hidden and aria-hidden content from topic evidence. Require a substantive matching block (at least eight words) and AI context in the same block or explicit topic title/headings. A matching title and H1 carry topic context into follow-on body paragraphs, so supporting process details do not have to repeat the keyword. This parser does not evaluate computed CSS or render JavaScript. An AI heading can supply context; text matching is not semantic understanding. Research and completed projects remain distinct from currently offered services.

Select one observed source per topic by highest SEO+GEO content score, then matching word count; deterministic ties preserve observation order. Each card reports only that selected page, its hash and short evidence, rather than mixing unrelated strengths across pages. Highest observed score is not an assertion of the commercially best landing page.

## Rubric `topic-signals-0.1`
Each group independently sums five checks (0/10/20), with all observations displayed. These coarse, uncalibrated rules are different from the L005 manual editorial pilot; changed scores do not establish changed website performance.

| SEO signal | Points |
| --- | --- |
| Topic in title/headings | Both 20; either 10; neither 0 |
| Explanatory matching blocks | At least 100 matching words 20; otherwise 10 |
| Practical detail terms | Present with at least 100 matching words 20; present 10; absent 0 |
| Content focus | Matching blocks contain at least 45% of extracted words 20; at least 15% 10; otherwise 0 |
| Descriptive topic links | Matching link text on selected page 20; otherwise 0; destinations unverified |

| GEO signal | Points |
| --- | --- |
| AI capability explanation | Topic and AI in one block with at least 20 words 20; accepted shorter/heading context 10 |
| Provider association | Relevant block contains we/our and title contains we/our or a brand separator 20; otherwise 10, human review required |
| Process terms | Present with at least 100 matching words 20; present 10; absent 0 |
| Linked supporting material | External HTTPS link in a matching section/article 20; otherwise 0; accuracy/relevance not independently verified |
| Scope/context terms | Present with at least 100 matching words 20; present 10; absent 0; this does not verify completeness of caveats |

Missing presence signals receive no points in this limited rubric, not a finding that the site is defective. Unknown external outcomes are not scored. Exact patterns are in `src/sampan/topics.py`. Keyword repetition/word count can game these heuristics; calibration and human review are necessary before commercial claims. No score estimates ranking/citation probability, index membership, factual accuracy, search volume or competition. No AI provider was queried.

## Collection and partial results
`topic_pages` is false by API default and an explicit checked option in the live UI. False: one page/12 requests/45 seconds. True: submitted page plus at most seven related pages, depth <=2, <=24 HTTP requests, <=75 seconds, existing 1 MB response and 10 MB run caps, >=1-second pacing and all DNS/TLS/robots protections. Reuse the same collector and budgets across the entire sample.

Only observed, normalized, same-origin HTTPS links without credentials, queries, assets or API paths are considered. Static index/HTML aliases are deduplicated conservatively for discovery. Inspect <=500 link elements per page, retain <=40 candidate links per page and <=80 queued entries; prioritize service/portfolio hubs, then explicit specialist-topic links before generic project cards. No external reference link is fetched. Redirects retain AuditIntake's apex/www policy and per-host robots checks. Stop further collection at the first linked fetch failure; retain only already collected evidence and display the reason. An initial-page block still returns no invented scores. Eight-page cutoff is displayed.

Saved HTML always analyzes exactly the supplied file with no network, even if `topic_pages` is sent. Existing token, authorization, Host and loopback restrictions remain. Reports are in memory/export only; browser renders remote strings with textContent. Downloaded JSON includes technical and topic reports.

## Acceptance and rollback
Meaningful tests cover unsupported/hidden/disjoint topic text, evidence and arithmetic, changed signals, page selection, alias/same-origin discovery, blocked partial collection, eight-page/depth bounds and no-network saved HTML. Verify a real VX Real review in the localhost browser, expandable evidence and narrow layout; record actual commands/results in `10-PROGRESS.md`.

Rollback only L006 changes in topics module, adapter, UI and tests, preserving earlier working changes. No deployment, source control publication, customer site modifications or billing in scope. No scheduled monitoring. Next: owner review of topic selection and scores, then broader permitted examples and empirical calibration.
