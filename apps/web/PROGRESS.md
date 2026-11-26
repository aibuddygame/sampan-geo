# Corporate website starter — 26 November 2026

Task W-S01: isolate mockup starter and copy the complete feature-branch delivery pack into `apps/web/`, preserving SEO/GEO applications.

Input: source branch `feat/ai-corporate-ambassador-site-spec` at `f6f14ce5cca2b716bc0dd0cab916c720e7680e80`, draft PR #3, current repository tree and instructions.
Output: independent buildless landing-page foundation, nine unchanged source snapshots, source map, local run instructions and scoped development guidance. No app migration or deployment.

## Verified

- `node --check apps/web/public/app.js` — passed.
- `git diff --check` — passed for tracked edits before staging. Final `git diff --cached --check` reported three inherited Markdown hard-break lines in the byte-identical `docs/07-DECISIONS.md` snapshot; preserved intentionally for source fidelity.
- Python standard-library check — all nine copied Markdown documents byte-identical; HTML fragment targets and local stylesheet exist; temporary localhost server returned HTTP 200 for `/`, `/styles.css`, `/app.js`; server stopped.
- `PYTHONPATH=src /Users/barrylau/Documents/GitHub/sampan-geo/.venv/bin/python -m pytest -q` — 346 passed, 1 skipped, 1 dependency deprecation warning, 3.16 seconds. Existing local environment reused; PYTHONPATH explicitly selects this checkout's source.
- `git diff --exit-code -- web src tests pyproject.toml` — passed, no changes to existing application code, tests or Python dependencies.

## Limits and next task

Starter acceptance is complete: files organized, local serving verified, original requirements retained and existing apps untouched. This is not full M02–M06 mockup acceptance. Browser rendering, mobile overflow, accessibility and language-toggle interaction have not been visually tested. Existing Next.js app build was not run; its source and lockfile are unchanged.

Next W-M02: build the full bilingual public pages within `apps/web/`, followed by scripted Q&A, in-memory FAQ draft/preview/publish/reset, behaviour controls and script preview with rendering disabled. Apply the original source pack's acceptance checklist, capture desktop/mobile evidence and obtain owner copy review. No provider calls, native ChatGPT Project changes, merge, deployment or DNS changes performed.
