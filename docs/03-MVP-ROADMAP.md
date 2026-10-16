# MVP Roadmap — Executable Checklist
Check tasks only after verification and evidence are recorded in `10-PROGRESS.md`. Documentation preparation is separate from committing it.

## Phase 0 — Planning / repository setup
- [x] P00-1 Verify private GitHub repository `aibuddygame/sampan-geo` exists (2026-10-16; populated `main` verified; see `10-PROGRESS.md`).
- [x] P00-2 Commit the starter documentation, `AGENTS.md`, `.gitignore` (2026-10-16; documentation commit `0073b487a84f325f9333a6bdf81af565d34ac9e1` and `.gitignore` commit `b32e21dd9f6612d06b40126488723a04f94a37b6`; current tree verified in `10-PROGRESS.md`).
- [ ] P00-3 Verify or create ChatGPT Project `SAMPAN.AI — SEO, GEO & AI Agent Platform`, paste `CHATGPT_PROJECT_INSTRUCTIONS.md`, move relevant chat, attach master plan. **Partially verified 2026-10-16:** current Project context specifies OpenAI Codex and exposes all 14 required reference files, including the master plan. Relevant-chat move and exact GitHub/snapshot parity remain unverified. Snapshot synchronization is manual; see `10-PROGRESS.md`.
- [ ] P00-4 Verify DNS/domain ownership, choose staging hostname and hosting, **do not overwrite an existing site**.
- [ ] P00-5 Capture initial `vxreal.com` Search Console / citation-query baseline and owner-approved service list.

Setup acceptance: verify the committed root contains AGENTS.md, README.md and docs/; private visibility remains enabled; Codex reads the actual clone; Project instructions and snapshots are refreshed. No deployment is part of setup.

## Phase 1 — T001: VX Real → evidence-backed company JSON
- [ ] P01-1 Scaffold FastAPI application, configuration, `.env.example` (no real credentials), tests.
- [ ] P01-2 Add controlled URL intake, SSRF blocking, robots/permissions checks, crawl limits.
- [ ] P01-3 Discover up to 10 relevant pages under `vxreal.com`; record source manifest and hashes.
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
