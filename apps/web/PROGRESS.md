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

## W-S02 — Bilingual enterprise website mockup · 26 November 2026

**Objective and input:** build a team-reviewable, standalone website using PR #3 at `27d156ccb6077ad74d3f3e1c3a3fadc13b49cbe8`, the 26 November v0.4 master requirements and the public D-ID Enterprise page as a functional benchmark. PR #3 had a bilingual landing-page starter and specs. The existing local checkout was on `codex/team-testing-2026-11-17` with pending user changes. GitHub transport was unavailable in this session, so the implementation was isolated in a separate local checkout. The PR files were retrieved with the GitHub connector and verified against the returned Git blob hashes.

**Output:** independent Next.js app in `apps/web/` with nine pages in two languages, an original avatar portrait, simulated visitor Q&A with staff handover, avatar and behaviour settings, FAQ revision review/publish/rollback, sample analytics, deployment controls, script/storyboard previews and a prefilled demo-enquiry email. Production systems are planned separately. Specification snapshots remain in both existing documentation locations.

**Verification**

- Lockfile-based clean install and `npm run build` passed using Node.js 24.13.0.
- `npm test` passed five tests covering revision gating, reapproval, publication and rollback, bilingual scripted matching and storyboard timing.
- In-process Next.js production HTTP handler smoke covered all 18 localized URLs, language metadata, internal links, contact mailto, RSC, WebP and an unknown route returning 404.
- Visually inspected the built homepage with local assets in Chrome at desktop width and in 390px Traditional Chinese and 320px English frames. These were offline renderings of the production build. The sandbox denied binding a loopback port and launching headless browsers. Full browser-driven navigation, editing and accessibility checks against a running site remain team review items.
- `PYTHONPATH=src python -m pytest -q` with the existing repository Python environment returned 346 passed, 1 skipped and one Starlette deprecation warning. The SEO/GEO application source and tests were outside the implementation diff.

**Decision and next task:** ship the reviewable mockup as a separate Next.js app with prerendered routes, local fixtures and no external inference or production infrastructure. The available installation cache supported Next.js 16.4.2 and Tailwind 3.4.19 for this isolated prototype. Confirm the Cantonese and English copy, visual identity and FAQ approval flow with the team. Then benchmark a consented avatar’s Cantonese and English voice, lip-sync, latency and operating cost using a reviewed set of approved FAQs.

## W-S04 — Enterprise marketing content · 26 November 2026

**Objective and inputs:** Expand the W-S02 mockup's bilingual copy and information architecture using the master product requirements v0.4, the six approved solutions, and D-ID Enterprise as a functional benchmark.

**Implemented:** The homepage now explains the visitor and video workflows, gives four illustrative business use cases, links the six ordered solutions, and covers governance, deployment, a measured pilot and 11 buyer FAQs. The Solutions page adds detail for SEO/GEO/AEO, commerce and messaging, and enterprise transformation. Video Studio distinguishes its storyboard preview from Mplifier's long-to-short workflow. The scripted services answer reflects the six-solution catalogue.

**Verification:** The five existing web tests and the production build passed. An in-process Next.js smoke test verified all 18 localized URLs, internal links and anchors, unique page IDs, six-solution order, FAQ markup, Mplifier links, the enquiry email, and 404 handling. The sandbox denied loopback binding. A browser walkthrough against a running local instance remains pending. The existing SEO/GEO application paths were unchanged in the diff.

**Next:** Review both languages with the team and confirm Mplifier's current clip-production scope before publishing commercial claims. The W-S03 avatar and language feasibility milestone remains open.

## W-S05 — AI agent positioning and offline review · 26 November 2026

**Objective and inputs:** The English HTML opened from `/tmp/sampan-review` was an older export. Expand the enterprise-facing AI agent content using the approved SAMPAN requirements and [D-ID Enterprise](https://www.d-id.com/enterprise/) as a functional benchmark.

**Implemented:** Refreshed the hero, page navigation, agent and video workflows, and buyer content in both languages. Added a labelled example conversation with an approved sample source and staff handover, plus capability descriptions for speech, connected actions, and in-video Q&A with their appropriate preview or evaluation statuses. The six solutions retain their approved order. The offline exporter rebuilds linked static snapshots from the current production build, while the interactive demo and admin workflows continue to run in the local app.

**Verification:** Production build and five web tests passed. All 18 localized application URLs passed the in-process route checks. All 18 exported files were parsed to check their links and assets, with the agent walkthrough and 13 FAQs verified in both languages. The export regenerated the English and Traditional Chinese homepages at the existing review location. Visual review and browser testing of the full interactive workflows remain open.

**Next:** Review the refreshed copy and layout with the team. Validate the planned Cantonese and English speech and connected-action controls before presenting them as shipped capabilities.

## W-S06 — Corporate AI Ambassador copy and team review · 27 November 2026

**Objective and inputs.** Apply the owner-approved Corporate AI Ambassador / 企業 AI 大使 name and bilingual homepage paragraph covering the six solutions.

**Implemented.** Updated the hero and product references across the English and Traditional Chinese mockup. The offline exporter now adds `index.html` as a Traditional Chinese entry point. The downloadable team ZIP contains the 18 localized page snapshots, language navigation, portrait, site icon and narrow-screen comparison. The local Next.js app provides the interactive simulations.

**Verification.** `npm test` passed all five tests. `npm run build` passed on retry after a Next.js dependency advisory. With `npm start`, all 18 localized routes returned HTTP 200. `python3 scripts/export-review.py /tmp/sampan-review` regenerated the offline preview. Checked exact bilingual hero copy, cross-language navigation, relative asset and page links, and ZIP integrity. Browser access to local file URLs was blocked, so this revision's offline visual review remains open.

**Next.** Collect team feedback on the copy and product workflow. Then validate one Cantonese and English avatar with an approved FAQ set. Review the Next.js dependency advisory before any hosted preview.

## W-S07 — GitHub developer handoff · 27 November 2026

Prepared the bilingual mockup on a branch based on the public website-spec pull request. Regenerated the lockfile because incomplete optional dependency entries prevented a fresh `npm ci`. Direct dependency versions remain pinned as before.

From a clean checkout, `npm ci` and all five `npm test` checks passed. `npm run build` passed on retry after the Next.js advisory appeared. The offline exporter produced all 18 localized pages, and both revised hero headings were verified. Address the dependency advisory before hosting the site.
