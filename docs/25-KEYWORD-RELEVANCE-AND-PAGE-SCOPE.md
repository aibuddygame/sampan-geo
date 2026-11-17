# L021 — Source relevance, Chinese questions and page-specific scores

Implemented 2026-11-02 in the existing localhost trial. T001 inventory and deployment milestones are unchanged.

## Objective and acceptance

Input: authorized URL sample or saved HTML, including Traditional Chinese/mixed text. Output: up to nine source-supported discovery topics with bounded evidence and separate SEO/GEO content scores; individual reviewed-page technical audits; explicit capture mode and unresolved coverage. Simplest approach: deterministic helpers and the existing isolated renderer; no new dependencies, databases or extra model calls.

Acceptance verified: disclosure/brand/third-party pollution removed from the marksix.gold result; Chinese questions generate observed subject spans; negated capabilities are not offered topics; unrelated paragraphs/links and title punctuation do not earn extra credit; Chinese middle-dot punctuation is not Japanese; sparse app fallbacks trigger bounded rendering; page selector separates submitted-page and guide audits. Regression checks and actual localhost retest passed. Search demand, positions and citations remain unmeasured.

## Rules changed

- Trim Chinese question framing/punctuation into observed source spans and split explicit lists without joining unrelated fragments. Rank main page headings before incidental sections. Group contained query variants; actual hreflang counterpart sections with matching IDs share a cross-language slot. This is deterministic overlap/structure handling, not general translation or semantic equivalence.
- Infer brand exclusions from observed home links and relevant named structured records. Exclude explicitly disclaimed third-party acronyms. Filter generic disclosure/source labels and negative-answer questions; retain legitimate offerings such as Analytics Consulting. These role heuristics are not complete entity resolution.
- Preserve original source text/hash. Split mixed positive/denied paragraphs at observed claim boundaries so a limitation does not erase a legitimate offer. Negative evidence remains available to the semantic validator. General negation still needs language/context calibration.
- Remove title/H1 permission to borrow the whole page. Use bounded section/follow-on context and show a directly matching passage where available, otherwise the first relevant contextual passage. Disclosure content cannot inflate an unrelated topic.
- Provider punctuation earns no identity credit. External links with unrelated labels earn no topic-support credit; matching labels earn at most partial presence credit. Source correctness/claim support is not established by a link.
- Reconcile link availability against exact observed sample destinations. Partial sampling remains unresolved rather than a false confirmed defect; do not infer redirect aliases or whole-site availability.
- Detect empty or sparse application mounts with a local module, including a short nonempty fallback. Existing robots, same-host assets, byte/time/request ceilings and browser network isolation remain intact. No generator/form actions are added to rendering.
- Local discovery can retain readable initial HTML and its rendered variant within an eight-capture analysis limit. Each card identifies its source mode/hash; page counts count unique URLs. The optional Kimi path retains its existing effective-capture input behavior and single-call limits; no live Kimi test was performed here.
- Reports expose separate linked-page audits and an audit selector. The default is the rendered submitted page when available. Scores still include six sample checks; neither the submitted-page nor guide result is a whole-site aggregate. Low evaluated coverage is explicitly labelled limited evidence.

Versions: `site-topics-0.6`, `kimi-semantic-0.6`, `kimi-keywords-0.5`, prompt/cache `kimi-semantic-selection-0.6`, technical `verified-page-0.6`. Fifty-five technical checks and ten-point budgets retained. Old-rubric deltas are not comparable website improvement.

## Verification

`SAMPAN_TEST_RENDERER=1 .venv/bin/python -m pytest -q --tb=short` — **297 passed** in 5.64 seconds, one existing Starlette TestClient deprecation warning; permitted escalation enabled actual isolated Chromium execution. Nineteen new regression cases cover relevance, evidence invariance, negation, language, capture gates, counterpart grouping, observed links and page-specific API output. Existing versions and link/punctuation expectations updated for intentional method changes. Earlier intermediate failures were repaired; final suite passed.

`node --check /private/tmp/sampan-ui-L021.js` and `git diff --check` passed. No new project dependency. Private pre-edit source retained for review.

### marksix.gold acceptance retest

Actual IAB at http://127.0.0.1:8004/ used related-page review and isolated rendering; Kimi unavailable/local only. Three distinct pages reviewed. Rendering increased captured homepage text from 157 to 551 characters on the final run. The submitted-page raw audit, rendered audit and both guides remain selectable separately.

Final observed scores: rendered homepage **SEO 8.7 / GEO 4.8**; Chinese guide **SEO 9.0 / GEO 4.9**. Topic cards include 下期攪珠資料 (2/3),六合彩 AI 選號 (5/2), 今日幸運號碼 (1/3),六合彩玩法指南 (3/2), 單式 (3/3), 複式 (4/3), 拖膽 (4/3), 金多寶 (3/3), AI 答題選號碼 (2/2), each SEO/GEO out of ten. These are observed heuristic outputs, not endorsed high-demand keywords or evidence of higher winning probability. No betting, number generation, answer submission or external form action occurred.

The prior 10/9 brand card, analytics disclosures, generic source headings and mixed HKJC card are absent. Core and supporting informational terms now replace them. Some labels remain broad; further intent/market calibration is appropriate before commercialization.

A private three-page raw snapshot was replayed through the pre-edit and new local analyzers. It reproduced the old brand/disclosure/reference pollution and the new source-subject set; all component totals checked. This comparison holds content constant. It does not compare Google outcomes or conflate raw and rendered content. Snapshots, source hashes, both comparison JSONs, browser observation and screenshot are ignored under `private/reports/marksix-fix-2026-11-02/`.

## Remaining scope

Chinese query generation and entity roles remain heuristic; cross-language intent beyond observed equivalents still needs reviewed semantic/provider evidence. Kimi source matching/regressions pass, but its live output quality was not tested. External support, answer quality, authorship and factual correctness still require evidence review; no arbitrary perfect-score adjustment is introduced. A real-site sample does not calibrate other industries. Next: broader permitted fixtures/sites, reviewed intent and fixed queries before commercial accuracy claims. No client-site changes, public deployment, T001 completion, Git commit or push.
