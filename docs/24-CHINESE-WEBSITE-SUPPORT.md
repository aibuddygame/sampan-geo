# L017 — Traditional Chinese and mixed-language source analysis

## Task and acceptance
Objective: extend the existing local trial to Traditional Chinese and Chinese/English source content before designing the public service website. Input: permitted page samples or UTF-8 saved HTML. Output: up to nine source-supported topics, separate SEO/GEO readiness scores out of ten, quotations, component explanations and observed language. Approach: bounded deterministic language helpers plus the existing optional, single structured Kimi call; no new dependency or translation service.

Acceptance verified: Chinese and mixed fixtures produce supported, distinct topic cards in the actual localhost interface; title-only content does not borrow body credit; Chinese evidence and negation are validated; English regressions and network isolation pass. Real MPLIFIER content acceptance remains blocked by its robots response. T001 acceptance is separate.

## Implemented rules
- Local Chinese candidates use complete observed titles/headings rather than arbitrary character fragments or a fixed AI catalog. Existing brand, boilerplate, overlap and source-body filters apply. Mixed labels retain English abbreviations. Fewer than nine supported topics is valid.
- Chinese phrase matching tolerates whitespace between characters; local matching does not translate, convert scripts or infer synonyms. Han bigrams are used only for duplicate overlap. Chinese negative service statements are rejected.
- Content length uses approximate units (Latin tokens plus half the Han count), not a claim of Chinese word segmentation. Short Chinese descriptive passages and Chinese title/description editorial ranges are recognized. Selected contact/about/service-navigation labels and organization-name checks recognize Chinese.
- The Kimi prompt requests source-language labels and unchanged evidence quotations. Each quote must resolve to one supplied segment. Adaptive excerpt shrinking keeps the actual UTF-8 payload within 24,000 bytes; existing call, token, time, cache and response limits remain.
- Audit-only URL normalization encodes Unicode paths/query text before the existing strict safety validator. ASCII authority, same-host, percent/traversal, DNS/redirect and request limits remain. Strict T001 intake is unchanged.
- Versions: site-topics-0.5, kimi-semantic-0.5, kimi-keywords-0.4, kimi-semantic-selection-0.5 and verified-page-0.5. Technical audit retains 55 checks and the same weights. Method changes invalidate direct old-rubric comparisons.

## Verification — 2026-10-26
`SAMPAN_TEST_RENDERER=1 .venv/bin/python -m pytest -q --tb=short`: **278 passed**, one existing Starlette TestClient warning, 4.38 seconds; permitted escalation allowed actual isolated Chromium execution. Includes Chinese/mixed extraction, Simplified Chinese smoke coverage, forged/cross-segment evidence rejection, mock-provider/cache/input-byte tests, saved-HTML no-network checks and Unicode URL safety. `git diff --check` passed.

Actual in-app browser at http://127.0.0.1:8004/ analyzed both synthetic saved HTML fixtures successfully. Traditional example: AI 客戶服務助理 3/5, 雲端系統整合 4/5, 文件處理自動化 8/6 (SEO/GEO). Mixed example: AI 客戶服務助理 3/5, ERP 系統整合 4/5, AI 文件處理自動化 8/6. These demonstrate source processing, not business-site performance. Reports, fixtures and screenshots are ignored under private/reports/chinese-support-2026-10-26/.

MPLIFIER authorized live attempt: https://www.mplifier.com/robots.txt returned markup rather than a usable policy; existing intake stopped. Zero content pages collected and zero paid AI calls. No MPLIFIER keywords or scores established. Do not bypass; retest after a usable policy response or analyze owner-supplied saved HTML with its limitations.

## Remaining limits and next step
Reports/interface remain English. Chinese support is experimental: no calibrated linguistic quality, script/locale inference, automatic Traditional/Simplified equivalence, search-demand data, country rankings or AI citation probability. Semantic integration passed mocked tests; live Kimi Chinese quality was not tested. Port 8004 currently runs local analysis without a provider key; existing port 8001 was not stopped. Short JavaScript-only Chinese pages still need real-site compatibility checks, including the renderer's separate raw-length wait. Generic anchor/provider/link heuristics are not fully language-calibrated; docs22 R01/R02 remain open.

Next: obtain a usable permitted Chinese sample for live/semantic validation and review topic quality. Service-website design is the user's following work item, not part of this implementation. No public deployment, client-site changes, commit/push or T001 completion.
