# L023 — Project names and contextual Chinese discovery keywords

Implemented 2026-11-02. Task: improve the existing local keyword suggestions and retest VX Real and marksix.gold. T001 and deployment milestones are unchanged.

## Contract

Input: the existing bounded page sample and optional validated model proposals. Output: up to nine source-supported discovery queries, per-query SEO/GEO content signals, source quotations and explicit contextual wording provenance. Use deterministic observed role/context cues; do not hardcode client names, translate arbitrary labels or invent search demand. Technical audit weights/version remain unchanged.

## Selection and wording

- `search_terms.py` identifies named works from explicitly marked project/portfolio cards, project-detail H1s, publication panels and selected typed work records. Normalized names and distinctive three-or-more-token title fragments are excluded from discovery suggestions; their descriptions can still support descriptive capabilities. An explicit current Service name can resolve an exact name collision. Ordinary product-category cards are not automatically projects.
- The same role filter applies to local candidates and optional Kimi proposals. Kimi prompt/cache revision also requests descriptive capabilities instead of project titles. Named entities and historical project evidence remain in the source; this does not rewrite the website or declare every project a currently available service.
- A standalone two/three-Han label requires a short subject observed in that same page's title and headings. Repeated subjects win over accidental shorter overlaps. The composed query is explicitly recorded in `query_construction`, including original phrase, qualifier, source URL and observed title. If no suitable context exists, omit the ambiguous label.
- Quotes/hashes remain unchanged. Body scoring uses the observed source subject; composed wording is not asserted to be a literal quotation. Title/heading alignment is full for a literal composed match, partial for separately observed qualifier/subject, and absent otherwise. Do not stuff repeated keywords to chase those signals. UI evidence explains that construction.
- Deduplicate contextual/literal variants. Keep the nine-card ceiling without padding missing suggestions. Generic descriptive terms may remain even if also used inside a project name; this is a role heuristic, not complete entity resolution or validated keyword-market research.

Versions: `site-topics-0.7`, `kimi-semantic-0.7`, `kimi-keywords-0.6`, prompt/cache `kimi-semantic-selection-0.7`. Technical audit stays `verified-page-0.6`. A new query set is not a comparable before/after ranking or content improvement.

## Verification

`SAMPAN_TEST_RENDERER=1 .venv/bin/python -m pytest -q --tb=short` — **313 passed** in 4.38 seconds, one existing Starlette TestClient deprecation warning; permitted escalation allowed actual isolated Chromium checks. Sixteen new cases cover varied invented project names, project-title fragments, typed/route/card roles, non-project product cards, service-name collisions, model proposal filtering, same-page Chinese qualifiers, misleading partial prefixes, unchanged literal evidence, partial alignment, unsupported ambiguity and duplicate labels. Existing topic version assertions updated. `node --check /private/tmp/sampan-ui-L023.js` and `git diff --check` passed. No dependencies or stack changes.

A local VX Real source-folder check and retained marksix raw snapshot were diagnostic inputs only; live acceptance results are recorded in docs10. Early checks exposed the accidental “六合” prefix and publication-title fragments; corrected before final tests/live retests. Private pre-edit source is retained under `private/handoffs/L023-before/`.

## Limits

English and Chinese query intent/demand remain unmeasured. Some descriptive terms will still need editorial refinement. These filters use observed author markup/routes/context and can miss unusual templates or ambiguous names. Kimi integration is regression-tested but no live paid provider call was used for this task. No new collection/render limits, publication, client-site edits or model-generated scores. Next useful step is broader permitted template/industry calibration and owner-reviewed target queries, not automatic advertising or publishing.

## Live localhost acceptance

Actual IAB form runs used local analysis with related-page review and isolated rendering enabled; no Kimi key configured and no paid provider calls. VX Real reviewed eight distinct pages; marksix.gold reviewed three. Technical rubric remains 0.6; topic selector is 0.7.

VX Real now suggests: AI Business Transformation (3/6), Audit Ready Carbon Intelligence (7/5), Market Expansion (2/5), Product Launch (4/6), Regulatory Readiness (7/5), Virtual Artist (5/3), AI Prototype (2/5), Trade Finance System (3/2), Carbon Data (2/4). Parentheses are SEO/GEO content scores out of ten. Carbon Intelligent and full named project titles are absent. Some generic descriptive capabilities such as Virtual Artist can legitimately overlap words in project names; this filter does not remove every component word. Current service availability still needs factual review.

marksix.gold now suggests: 下期攪珠資料 (2/3),六合彩 AI 選號 (5/2), 今日幸運號碼 (1/3),六合彩玩法指南 (3/2),六合彩單式 (2/3),六合彩複式 (3/3),六合彩拖膽 (3/3),六合彩金多寶 (2/3), AI 答題選號碼 (2/2). Contextual variants replace the bare two/three-Han subjects, with no accidental 六合 prefix. Browser expansion confirmed the explanation distinguishes composed query wording from literal source quotation.

Primary page readiness unchanged: VX Real 9.3 SEO / 6.3 GEO, rendered marksix.gold 8.7 / 4.8. These are page assessments plus existing sample checks, not whole-site scores. Query-level alignment can change because the new wording is contextual rather than a literal full-query match. Do not average different query sets into an outcome claim. Private browser observations/screenshots are under `private/reports/keyword-specificity-2026-11-02/`. No client source edits, deployment, number-generation/betting/form action, Git commit or push.
