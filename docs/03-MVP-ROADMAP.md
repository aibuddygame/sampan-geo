# MVP Roadmap — Executable Checklist
Check tasks only after verification and evidence are recorded in `10-PROGRESS.md`. Documentation preparation is separate from committing it.

## Phase 0 — Planning / repository setup
- [x] P00-1 Verify private GitHub repository `aibuddygame/sampan-geo` exists (2026-10-16; empty).
- [x] P00-2 Commit the starter documentation, `AGENTS.md`, `.gitignore` (verified local history through b32e21d; remote README read confirmed).
- [ ] P00-3 Verify or create ChatGPT Project `SAMPAN.AI — SEO, GEO & AI Agent Platform`, paste `CHATGPT_PROJECT_INSTRUCTIONS.md`, move relevant chat, attach master plan.
- [ ] P00-4 Verify DNS/domain ownership, choose staging hostname and hosting, **do not overwrite an existing site**.
- [ ] P00-5 Capture initial `vxreal.com` Search Console / citation-query baseline and owner-approved service list.

Setup acceptance: verify the committed root contains AGENTS.md, README.md and docs/; private visibility remains enabled; Codex reads the actual clone; Project instructions and snapshots are refreshed. No deployment is part of setup.

## Phase 1 — T001: VX Real → evidence-backed company JSON
- [x] P01-1 Scaffold FastAPI application, configuration, `.env.example` (no real credentials), tests (2026-10-16; four tests and loopback smoke check passed; see progress log).
- [x] P01-2 Add controlled URL intake, SSRF blocking, robots/permissions checks, crawl limits (2026-10-16; synthetic safety tests passed; live collection not run; see progress log and safe-intake contract).
- [ ] P01-3 Discover up to 10 relevant pages under `vxreal.com`; record source manifest and hashes. Implementation/synthetic checks verified 2026-10-16; live run stopped at robots content-type gate with zero content pages. Robots serving resolved 2026-10-26 and three representative pages scored; canonical discovery inventory acceptance remains pending. See progress log.
- [ ] P01-4 Extract page title, headings, body text and relevant source metadata.
- [ ] P01-5 Implement typed company/services/claims extraction with one cost-controlled LLM.
- [ ] P01-6 Validate output with Pydantic and deterministic rules; evidence pointers mandatory.
- [ ] P01-7 Human verify VX Real company details; no invented current services.
- [ ] P01-8 Save approved versioned JSON and processing logs; unit tests pass.
**Gate:** One approved, fully traceable company profile and reproducible pipeline.

## Phase 2 — GEO publishing
- [ ] P02-1 Implement admin-only draft / edit / approve / reject.
- [ ] P02-2 Create SSR page `/company/vx-real` generated from approved record.
- [ ] P02-3 Add accurate Schema.org JSON-LD, page title, description, source links, timestamps.
- [ ] P02-4 Add `sitemap.xml`, `robots.txt`, stable canonical and links from index.
- [ ] P02-5 Deploy SAMPAN staging and test with HTML parser, schema validator and browser.
- [ ] P02-6 Publish to production **only after explicit owner sign-off**.
**Gate:** Public approved factual page; valid markup; crawler can access without scripts.

## Phase 3 — Retrieval and first on-site improvements
- [ ] P03-1 Implement `GET /api/v1/companies/vx-real` and OpenAPI description.
- [ ] P03-2 Add cache headers, public rate limiting, error model, version field.
- [ ] P03-3 Test 10 benchmark agent questions and evidence citations using a connected client.
- [ ] P03-4 Generate VX Real SEO/GEO audit with specific changes and expected technical effects.
- [ ] P03-5 Approve/apply selected improvements **on vxreal.com**; record before/after deployments.
- [ ] P03-6 Track indexing, organic metrics, AI citation checks, and factual correctness over time.
**Gate:** Machine retrieval works and pilot measurements separate technical vs external outcomes.

## Phase 4 — Scale cautiously
- [ ] P04-1 Add two more authorized/permission-compatible sample business sites and compare extraction precision.
- [ ] P04-2 Add content-hash based scheduled recrawling (weekly B2B default; configurable).
- [ ] P04-3 Implement API search & filtering, incremental changes endpoint.
- [ ] P04-4 Implement read-only MCP tools over the same service layer and verify authentication/security.
- [ ] P04-5 Create repeatable customer onboarding and pricing experiment; no rankings guarantees.
**Gate:** Operational process reproducible across different site types and approved customer domains.

## Deferred
Payments, consumer UX, mass web directory imports, unsolicited bulk publishing, auto-modifying third-party sites, proprietary graph DB, scheduled 6-hour crawl for static B2B sites.

## User-approved local experiment — separate from T001
- [x] L001 Local single-page SEO/GEO readiness form and in-tab rescan comparison (2026-10-23; 134 tests passed and browser fixture comparison verified). No public deployment; live VX Real scoring blocked by robots response. See `13-LOCAL-SCORING-PROTOTYPE.md`.

- [x] L002 Expand the local experiment to 49 weighted checks (28 SEO / 21 GEO), category/evidence reports, coverage gating, saved-HTML analysis and report export (2026-10-23; tests and browser report verified). This does not complete T001 or publish a service. See `14-WEIGHTED-READINESS-RUBRIC.md`.

- [x] L003 Verify deployed VX Real resources and real scoring (2026-10-26; 3 pages, sitemap/knowledge/favicon resources, redirects/404, and browser live scan verified). No client-site modifications or T001 completion.

- [x] L004 Correct optional-structure/branding false flags and add a bounded audit compatibility profile (2026-10-26; rubric 0.3, 181 tests, live Portfolio browser check). Strict T001 profile unchanged. See `15-SCORING-FAIRNESS-AND-COMPATIBILITY.md`.

- [x] L005 Review eight live VX Real pages and prepare a private, manual ten-keyword SEO/GEO content-readiness pilot (2026-10-26; evidence excerpts and component totals checked). This is an editorial concept test; automatic keyword scoring, demand research, rankings and AI citations remain unimplemented/unmeasured. Existing localhost rubric unchanged.

- [x] L006 Implement supported short AI-topic cards with separate SEO/GEO content-signal scores, evidence and query ideas; optionally review eight related pages (2026-10-26; 192 tests, final live VX Real eight-topic browser scan, report export and narrow layout verified). Small English AI catalog, not general keyword research or measured visibility. See `16-TOPIC-READINESS-TRIAL.md`.

- [x] L007 Replace the fixed AI catalog with site-derived English keyword phrases, duplicate/brand/client filters and explicit unmeasured demand (2026-10-26; 196 tests, bakery/dental synthetic differentiation and final VX Real live browser/export verified). Relevance is measured heuristically; hotness/search-volume validation remains pending. See `17-SITE-DERIVED-KEYWORDS.md`.

- [x] L008 Integrate server-side Kimi keyword suggestions with source-matched quotations, bounded paid calls and deterministic content scores (2026-10-26; 213 tests, authenticated live VX Real ten-keyword browser/export verified). Saved HTML stays offline; key is session-only and demand/rankings remain unmeasured. See `18-KIMI-KEYWORD-ANALYSIS.md`.

- [x] L009 Switch default and running trial to requested `kimi-k3.1-pro`, with family-specific parameters and reasoning-token accounting (2026-10-26; 215 tests, authenticated live VX Real ten-keyword browser/export verified). No scoring/ranking claims or T001 advancement.

- [x] L010 Add source-backed semantic keyword scoring, partial relatedness credit and same-content phrase comparisons (2026-10-26; 225 tests, live VX Real eight-page/nine-keyword K3.1 browser/export verified with 29 meaning matches). Technical rubric unchanged; demand/rankings remain unmeasured. See `19-SEMANTIC-READINESS-SCORING.md`.

- [x] L011 Cap keyword cards at nine, use 0–10 scores and introduce a 55-check verified-credit audit with unresolved points, sample comparisons and separate unmeasured visibility (2026-10-26; 231 tests, eight-page VX Real browser/export verified: SEO 9.1, GEO 6.3). No measured ranking claim or T001 advancement. See `20-VERIFIED-READINESS-SCALE.md`.

- [x] L012 Add isolated JavaScript-shell rendering, representative service-card excerpts, title-only/body-focus fixes and separate raw/rendered audits (2026-10-26; 251 tests including Chromium isolation, successful K3.1 browser/export retests: Enreal seven topics, VX Real nine). Enreal rendered 5.5/4.2; VX initial-HTML 9.1/6.3. No ranking claims or T001 advancement. See `21-RENDERING-AND-SECTION-EXTRACTION.md`.

- [x] L013 Review current workflow/code and VX Real evidence; document prioritized findings, repeatable client SOP and blank engagement record (2026-10-26). Review/documentation only; scoring fixes and client changes remain proposed. See docs22–23 and progress for regression results.

- [x] L014 Prepare and validate the owner-requested VX Real upload-folder content improvements (2026-10-26): 12 existing HTML pages updated, one English Markets page added, 74-file ZIP and original backup verified. Local handoff only; no deployment, ranking result or T001 advancement. See progress.

- [x] L015 Recreate VX Real upload source using the original concise presentation and narrowly scoped SEO/GEO additions (2026-10-26; 73 files, 12 HTML pages, 249 local references and 11 local HTTP routes validated; revised and untouched-original ZIPs verified). Supersedes L014 as the preferred client draft; no deployment or T001 advancement.

- [x] L016 Add owner-supplied Google Ads base tag AW-18537747905 immediately after head on all 12 local VX Real HTML pages, once per page; refresh matching source ZIP (2026-10-26; exact-byte preservation and archive parity verified). No deployment or enquiry conversion event.

- [x] L017 Add Traditional Chinese/mixed-language source processing, source-language Kimi validation, bounded UTF-8 excerpts and safe audit Unicode URLs (2026-10-26; 278 tests including isolated Chromium, two synthetic saved-HTML browser reports verified). MPLIFIER live content validation remains blocked by unusable robots policy; live Chinese Kimi quality not tested. English report UI and T001 scope unchanged. See `24-CHINESE-WEBSITE-SUPPORT.md`.

- [x] L018 Add supplied Google Ads lead conversion snippet to the current local VX Real Solutions page and call it on accepted enquiry submission (2026-10-28; 11 offline execution checks, exact preservation and 73-file ZIP parity verified). Local upload source only; live Ads attribution/email delivery unverified. No SAMPAN/T001 advancement.

- [x] L019 Package and install the reusable `seo-geo-site-enhancement` skill from the VX Real source/procedure review (2026-10-31; official validation, relative-reference checks and four-file installed/ZIP hash parity passed). Workflow/reference deliverable only; no website deployment or scoring changes.

- [x] L020 Test marksix.gold in the existing localhost form and review keyword/score validity (review completed 2026-11-02; latest scan 2026-11-01). Three-page report/export and score arithmetic verified; keyword/evidence, language, negation and capture/scope weaknesses documented privately. No scoring fixes, site edits, paid calls or T001 advancement.

- [x] L021 Fix source/topic relevance, Chinese question/negation/language handling, bounded app capture and page-specific audit selection (2026-11-02; 297 tests including isolated Chromium and marksix.gold browser retest passed). Method-only raw snapshot comparison retained. Readiness is not ranking probability; no client edits/deployment/T001 advancement. See docs25.

- [x] L022 Refresh VX Real and marksix.gold under the same 0.6 local scoring method and compare page/keyword readiness (2026-11-02; both bounded scans HTTP 200, full reports retained, versions and arithmetic checked). No scoring/client edits, ranking/citation test or T001 advancement.

- [x] L023 Exclude identifiable project/title names and qualify ambiguous Chinese discovery terms from same-page subject evidence (2026-11-02; 313 tests, actual VX Real/marksix.gold localhost form retests and contextual-evidence expansion verified). Topic method 0.7; technical rubric remains 0.6. No client edits, paid calls, deployment or T001 advancement. See docs26.

- [x] L024 Combine local marketing/audit experience with saved pilot readiness reports and prepare managed-service onboarding (2026-11-02; 323 tests, actual two-pilot baselines, saved-report reopening and mobile/desktop browser verification). Local operator prototype only; online client access, Search Console, release automation and public deployment pending. See docs27; T001 unchanged.

- [x] L025 Verify real Kimi K3.1 Pro and live collection/rendering with localhost-only hosting; add safe connection diagnostics and save/reopen both pilot AI reports (2026-11-03; 329 regression tests, authenticated live two-pilot workflow). Search Console/OAuth, independent search/citation measurements and deployment remain pending. See docs28.

- [x] L026 Prepare marksix.gold managed-pilot keyword/question/change briefs and local read-only Google Search Console CLI (2026-11-04; 346 tests, official OAuth helper/PKCE and bounded property/data adapter verified with mocks). Real Google authorization, performance retrieval, client changes and measured outcomes remain pending. VX Real DNS TXT visibility independently confirmed; Search Console verification not claimed. See docs29.

- [x] L027 Complete owner Google read-only consent and retrieve marksix.gold live Search Console baselines (2026-11-05; saved token scope/permissions, actual property access, three dated HKG/all-country snapshots and sanitized summaries verified). Dashboard metrics/status import remains pending. No public deployment.

- [x] L028 Show a dated, filterable marksix.gold Hong Kong query and page table in the local pilot workspace (2026-11-10). Automated live refresh and client-facing access remain separate.
- [x] L029 Separate the visitor checker from a sign-in protected marksix.gold reporting preview (2026-11-10). Production client identity, per-client permissions and public deployment remain separate.

- [x] L030 Prepare the colleague handoff for VX Real and ESGtrace, current local source, two portable skills, hosting/access intake, draft AI benchmark prompts and implementation acceptance units (2026-11-13). See docs30 and the packaged validation record. Actual AI visibility tracking and generalized two-client reporting remain pending V001–V004.

- [x] L031 Prepare the teammate testing release: current source, setup guide and portable procedures; four-template package configuration and privacy-reviewed staging. Verification and GitHub publication evidence are recorded in the progress log. No public site deployment or T001 advancement.

- [x] L032 Publish the refreshed project brief, team testing checklist and blank feedback form under docs/team with a single linked entry point (18 November 2026; documentation-only, no application changes).

- [x] L033 Update the project direction for direct service first, client discovery and optional PrivateKB evaluation (18 November 2026; documentation only; PrivateKB integration and self-service SaaS remain unimplemented).
