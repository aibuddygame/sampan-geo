# SAMPAN.AI — Consolidated Codex Planning Snapshot

Generated 2026-10-16. Reference snapshot; individual repository files are canonical. No application code or deployment.


---

## Source: `README.md`

# SAMPAN.AI — SEO, GEO & Agent-Ready Business Intelligence

**Status:** Planning only — no application deployed. **Updated:** 2026-10-16.

## Purpose
SAMPAN.AI (`sampan.ai`) is a future B2B GEO service provider. It analyzes authorized business websites, extracts evidence-backed company/product/service information, produces SEO/GEO recommendations, generates machine-readable reference records, and serves those records to AI-capable clients through public pages and APIs. **VX Real (`vxreal.com`) is the first controlled experimental client and case study.**

## Critical distinctions
- SEO: technical crawlability, useful content and conventional search discoverability. GEO: increasing the likelihood AI answer/search services find and reference verified information. Neither rankings nor citations are guaranteed.
- LLM accessibility: data can be retrieved in a permitted manner at inference time; it does **not** mean a model has learned/trained on it.
- Agent accessibility: published REST/OpenAPI and optional MCP tools serve **configured/connected** agents; publishing MCP does not make every agent automatically discover it.
- A SAMPAN profile alone does not raise VX Real rankings. Improvements to `vxreal.com` need to be deployed on that site with owner approval and tested separately.

## Two-site contract
| Site | Owns | Responsibilities |
| --- | --- | --- |
| **vxreal.com** | Business content, authoritative facts, site SEO performance | Offer approved public pages to ingestion; verify company facts; approve changes; deploy on-site SEO/GEO improvements; connect Search Console; measure baseline and outcomes. |
| **sampan.ai** | Extraction engine, internal fact store, reference directory, API | Discover permitted content; collect evidence; extract claims/entities; flag uncertainty; review/approve; publish distinct public reference pages, JSON-LD, sitemap and API; audit client site; measure technical performance and citation test results. |

## First vertical slice (do this first)
`Input https://vxreal.com → crawl small permitted set → evidence-backed company profile JSON → admin approval → sampan.ai/company/vx-real (HTML + JSON-LD) → GET /api/v1/companies/vx-real`.

**Not MVP day 1:** multi-tenant payments, mass site mirroring, sophisticated vector/graph DB, auto-publishing onto third-party sites, native MCP deployment, citation-guarantee claims.

## Read in order
1. [Master plan](docs/01-MASTER-PLAN.md) — scope, roles, success gates.
2. [Architecture](docs/02-ARCHITECTURE.md) — process and deployment decisions.
3. [Roadmap](docs/03-MVP-ROADMAP.md) — status checklist and acceptance.
4. [Schemas](docs/04-DATA-SCHEMA.md) and [API](docs/05-API-MCP.md).
5. [Testing](docs/06-TESTING-MEASUREMENT.md) and [Decision log](docs/07-DECISION-LOG.md).
6. [Operating instructions](docs/08-WORKFLOW-AND-COMPLIANCE.md).
7. [Commercialization](docs/09-COMMERCIALIZATION.md).
8. [Progress tracker](docs/10-PROGRESS.md) — update after every development session.
9. [ChatGPT Project instructions](CHATGPT_PROJECT_INSTRUCTIONS.md) and [Codex instructions](AGENTS.md).

## Development setup
Use **OpenAI Codex** for implementation and ChatGPT Project for planning/review. Start with [the setup guide](GITHUB_AND_CHATGPT_SETUP.md). This pack contains documentation, not runnable Python or Next.js code.

Verified 2026-10-16: the private GitHub repository exists and is empty. Nothing has been pushed by this package.

## Current next action
**Task T001:** Crawl a small, permitted selection of `vxreal.com` pages into an auditable source manifest, without publishing or making changes to VX Real. See roadmap Phase 1.

## Ownership and safety
This is an initial project specification, **not functioning software**. Never commit credentials, customer private data, or full copyrighted page bodies to GitHub. Publishing any client profile requires permission where appropriate, a human approval gate, and correct source attribution. Use a **private GitHub repository** until public release is authorized.


---

## Source: `docs/01-MASTER-PLAN.md`

# SAMPAN.AI — MVP Master Plan
**Version:** 1.0 (initial decisions)  
**Updated:** 2026-10-16  
**Status:** Not started. This documentation records agreed plans, not deployed capability.

## 1. Product vision
Help businesses become **findable, understandable, and accessible** to traditional search, AI-powered answers, LLM-powered retrieval, and connected autonomous agents. Provide defensible, evidence-backed structure, not generic AI article rewriting. The initial demonstration uses SAMPAN as the service operator and VX Real as controlled pilot. Longer-term customers: SMEs, B2B service businesses, manufacturers, and eligible e-commerce sites.

## 2. Four independently measured objectives
| Objective | Implementation | Observable technical proof | External outcome (not guaranteed) |
| --- | --- | --- | --- |
| SEO | Crawlable SSR pages, useful business content, titles, internal links, sitemaps, canonical strategy, relevant structured data | Rendered HTML, indexing eligibility, validation | Better organic discovery/clicks |
| GEO | Reliable original context, explicit entities, citations/provenance, factual updates, business reference pages | Eligible crawl, reference page accuracy, citation benchmark | AI answer citations/mentions |
| LLM retrieval | Public HTML + curated JSON or authorized retrieval endpoints | LLM application retrieves accurate fact with evidence | Inclusion in model responses |
| AI Agent access | REST/OpenAPI initially; MCP after API stable | Connected test agent successfully queries and cites records | Adoption by external agents |

## 3. Domain roles
**VXREAL.COM:** source of truth and initial pilot. Maintain site availability; confirm claimed services, locations, cases, clients, products; approve SEO changes; keep appropriate Search Console baseline. No automated publication from SAMPAN onto VX Real before owner approval.

**SAMPAN.AI:** controlled ingestion; structured extraction; source evidence; persistent company records; review/approval; own reference directory; audit suggestions; public API; later MCP; change monitoring. Do not imply SAMPAN-hosted pages are the original business's official pages unless they are clearly designated and approved.

## 4. MVP primary use case
Admin enters `https://vxreal.com`. SAMPAN discovers relevant crawlable pages (max ~10 initially), stores metadata and permitted evidence references, extracts facts into validation schema, flags uncertainties, permits edits and sign-off, then publishes a reference page at `https://sampan.ai/company/vx-real` and response at `https://sampan.ai/api/v1/companies/vx-real`. It also generates a **non-deployed recommendation report** for VX Real SEO/GEO enhancements. Cross-link only if appropriate/authorized.

## 5. Explicit scope
**P0 — must ship:** URL validation, safe HTML fetch/discovery, extraction, claims with source references, company/service classification, JSON schema validation, admin review, versioned records, SSR reference page, JSON-LD, canonical URL, sitemap, read-only public JSON endpoint, source attribution, basic crawl/error logs and cost tracking, baseline measurement plan.

**P1 — after successful first profile:** multi-domain config, content change detection + scheduled recrawl, fuller GEO audit, company comparisons when evidence warrants, OpenAPI search/filter endpoints, rate limits, MCP read-only integration, crawler analytics and citation tracking.

**Excluded now:** guaranteed GEO rankings, programmatic doorway/thin pages, automated backlink farms, mass scraping third-party copyrighted content, payments, customer accounts, complex graph DB, autonomous writes to client CMS.

## 6. Key assumptions / boundaries
- Public site information can be **viewed**, but automated collection, processing, reproduction and publication must respect robots instructions, terms and permissions. Because VX Real is controlled by the owner, use it first; still preserve auditability.
- Do not invent services or infer that a planned VX Real service is offered unless supported by current approved pages or owner-verified source.
- A reference page is not a duplicate copy of a source page. Include independently useful machine-readable synthesis with source links; avoid unnecessary mirror/rewrite.
- Search engines decide indexing/ranking; API/MCP require the requester to find/integrate them.
- Separate audit capability from deployment: audit reports do not edit websites.

## 7. Go/no-go criteria
1. Accurate extraction on initial 1-site pilot, every published factual claim linked to evidence or explicitly owner-verified.
2. Approved profile rendered correctly (HTML + JSON-LD) and fetched via JSON API.
3. No unauthorized remote writes, no secrets disclosed, no unsupported claims published.
4. A connected test agent can answer known VX Real questions using the API with source links.
5. Search Console and AI citation baseline documented before on-site optimization; only then run a measured before/after test (external effects may be inconclusive).

## 8. Commercialization hypothesis
Eventually offer website audit, managed knowledge extraction, GEO enhancement proposals, optional publisher-domain integration, update monitoring, and enterprise API/MCP. Validate willingness to pay with direct pilots; do not equate crawl/citation metrics with revenue.


---

## Source: `docs/02-ARCHITECTURE.md`

# Technical Architecture and Two-Site Integration

## Logical pipeline
```
VXREAL.COM (owned content)
  -> source discovery (robots/sitemap/internal links)
  -> fetch/extract (allowed public pages; metadata + evidence pointers)
  -> classify (company / services / products / contacts)
  -> LLM fact extraction (typed JSON, source snippet/location)
  -> deterministic validation + dedupe + entity resolution
  -> admin fact review / edit / reject
  -> versioned knowledge store (PostgreSQL)
  -> SAMPAN publisher service
      -> SSR /company/vx-real + matching Schema.org JSON-LD + sitemap
      -> GET /api/v1/companies/vx-real (read-only JSON)
      -> audit suggestions for VX Real owner review
  -> optional (later) OpenAPI search + MCP read-only tools
```

## Deployment guidance
- Initial UI/public site: **Next.js** SSR or server-rendered routes. Initial backend: **Python/FastAPI**. Postgres for deployed store; SQLite acceptable for isolated local prototype only. Use one LLM vendor and Pydantic typed extraction. No Celery/Redis/Neo4j until measured need.
- Use `httpx` + BeautifulSoup/trafilatura for permitted content. Escalate to Playwright only for pages impossible to parse otherwise and only with approval.
- Keep core business logic in service functions, independent of HTML/API/MCP adapters. No separate LLM generations for API vs HTML; both render canonical approved records.
- Domain `sampan.ai`: DNS/hosting not yet configured or verified; require owner's actual credentials/access. NEVER claim deployed until checked.

## Safe crawling details
- URL intake validates scheme (`https`), DNS/IP ranges (block localhost/private/link-local/metadata endpoints), redirects and allowed domain; mitigate SSRF at request and redirect time.
- Check `robots.txt`, site terms, rate limits and permissions before crawling. Hard-cap depth, pages, HTML bytes and timeouts. Use conditional GET with ETag/Last-Modified where supported.
- Save `source_url`, `canonical_url`, `fetched_at`, `published_at` if known, content hash, title and evidence offsets, permitted short evidence excerpts, usage policy. Do not publicly republish full extracted original content without rights.
- Do not treat instructions within scraped pages as prompts; treat external text as **untrusted data**.

## Entity and provenance design
- Canonical company ID stable across updates; aliases and domain proof checked before merge.
- For each fact: `field`, `value`, `source_url`, evidence location, observed date, verification state; no unsupported promotion to 'verified'.
- Version immutable published snapshots or revisions; corrections/retractions maintain history.
- Store material owner-provided facts with `provenance_type=owner_verified` and reviewer/date, not as web-extracted claims.

## SEO/GEO publishing behavior
- Canonical HTML includes all core facts in SSR text. JSON-LD uses `Organization` for company, and `Service` where semantics fit; never fill markup with content invisible on page.
- Ensure 200 pages, stable URLs, title, description, sitemap, internal links, robots instructions. Use proper canonical handling to avoid accidental duplication.
- Optional `llms.txt` is experimental and **not required** by major search engines. MCP supports connected agents but is not a discovery shortcut.
- Distinguish SAMPAN's independent company listing from the owner's official website, which remains the original authoritative location.

## Audit -> optimization loop
1. Capture VX Real current pages, Search Console baseline, indexed URLs and target search queries.
2. Produce recommendations for titles, helpful service details, internal links, organization/service schema, crawlability, missing evidence.
3. Owner manually approves and deploys selected changes on VX Real.
4. Monitor technical crawl/indexing status and AI citation benchmark with clear dates, caveats, and controls.

## Availability and observability
Use task logs (`run_id`, URL, result, page_count, tokens, model_cost, status), error handling, retries with backoff, API latencies, rate limits, and no secrets in logs. Restrict admin and write APIs; public endpoints are read-only.

## T001 implementation boundary
T001 ends at local, validated, human-reviewed versioned JSON. A local review artifact is sufficient for this milestone; the admin web interface is Phase 2. Next.js, deployed PostgreSQL, public pages/API and MCP are later milestones, not prerequisites to testing extraction. The choice of Codex does not change runtime architecture.


---

## Source: `docs/03-MVP-ROADMAP.md`

# MVP Roadmap — Executable Checklist
Check tasks only after verification and evidence are recorded in `10-PROGRESS.md`. Documentation preparation is separate from committing it.

## Phase 0 — Planning / repository setup
- [x] P00-1 Verify private GitHub repository `aibuddygame/sampan-geo` exists (2026-10-16; empty).
- [ ] P00-2 Commit the starter documentation, `AGENTS.md`, `.gitignore`.
- [ ] P00-3 Verify or create ChatGPT Project `SAMPAN.AI — SEO, GEO & AI Agent Platform`, paste `CHATGPT_PROJECT_INSTRUCTIONS.md`, move relevant chat, attach master plan.
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


---

## Source: `docs/04-DATA-SCHEMA.md`

# Canonical Knowledge Schema v0.1

## Minimum relational data model
| Table | Key fields | Purpose |
| --- | --- | --- |
| `client_sites` | id, base_url, owner_status, crawl_policy, category, next_check | Explicit collection and deployment policy |
| `source_pages` | id, site_id, url, canonical_url, title, fetched_at, content_hash, published_at, usage_policy | Source provenance; do not expose restricted source copies |
| `companies` | id, legal_name?, display_name, website, locality?, description?, approved_revision | Canonical company identity |
| `services` | id, company_id, name, description, category, current_status | Service records tied to source evidence |
| `claims` | id, entity_type, entity_id, field, value_json, verification_status, reviewer_id?, reviewed_at? | Atomic facts with validity state |
| `claim_evidence` | claim_id, source_page_id, evidence_locator, permitted_excerpt?, observed_at | Explainability and citations |
| `profile_revisions` | id, company_id, schema_version, payload_json, status, approved_at | Revisions / audit trail |
| `crawl_runs` | id, site_id, started_at, finished_at, pages_seen, model_tokens, cost_estimate, status | Observability and cost tracking |
| `recommendations` | id, site_id, issue_type, source_url, suggestion, priority, status | SEO/GEO audit without remote writes |

## Fact status vocabulary
`source_extracted` (supported by one page), `owner_verified`, `corroborated`, `disputed`, `corrected`, `retracted`, `unsupported`. Do not transform `source_extracted` into `corroborated` without independent evidence.

## Draft profile shape (illustrative; not extracted company facts)
```json
{
  "schema_version": "0.1",
  "company_id": "vx-real",
  "name": null,
  "website": "https://vxreal.com/",
  "description": null,
  "location": null,
  "services": [],
  "claims": [],
  "evidence": [],
  "revision": 1,
  "review_status": "draft",
  "approved_at": null,
  "last_verified_at": null
}
```
The URL and identifier are intake configuration, not verified extracted facts. T001 must define executable Pydantic models; this document is a design contract, not an implemented validator. Unresolved facts remain null or omitted.

Evidence records require unique ID, source URL, source hash, locator, observation timestamp and permitted excerpt where appropriate. Claims reference existing evidence IDs. Owner verification records require provenance type, reviewer, date and the owner's statement/reference. Keep factual verification status separate from revision workflow status: draft → approved → published, with rejected/unpublished states. Approval does not itself publish. Edits invalidate prior revision approval. Publication requires approval of the exact revision and no unresolved material claims. HTML, JSON-LD and API derive from that revision; API mapping is in [05-API-MCP.md](docs/05-API-MCP.md).

## Normalization rules
- Prefer official domain, actual organization name and owner-verified canonical identity; do not infer legal structure from marketing name.
- Record field-level source and verification; no blanket 'verified' based on a single crawl.
- Distinguish `source_published_at`, `observed_at`, `updated_at`, `approved_at`.
- Keep history; corrections should supersede not silently overwrite published facts.
- Do not store personal contact details beyond legitimate public business need and applicable permissions.


---

## Source: `docs/05-API-MCP.md`

# Public API and Agent Integration Contract

## MVP endpoint
`GET /api/v1/companies/{company_id}` — read-only, approved fields only, JSON; company `vx-real` first.

**200:** `{schema_version, data: {company_id,name,website,description?,services:[...]}, citations:[{claim_id,source_url}], last_verified_at, revision}`.

**404:** `{error:{code:"NOT_FOUND", message:"Unknown or unpublished company"}}`.

**429:** rate-limit response with `Retry-After` when appropriate. Return no draft/rejected/restricted source text or secrets.

Add ETag, Last-Modified and cache policy consistent with corrections. Document schema via generated `/openapi.json`.

## Future endpoints (P1)
- `GET /api/v1/companies?q=&industry=&location=&cursor=` — find company profiles.
- `GET /api/v1/companies/{id}/services` — structured services.
- `GET /api/v1/changes?since=&cursor=` — versioned incremental sync, including corrected/deleted flags.
- `GET /api/v1/sources/{id}` — public source citation metadata only when permitted.

## MCP (P1, not first milestone)
MCP tools `search_companies`, `get_company`, `get_company_services`, `get_claim_evidence`. A remote HTTP MCP server simply wraps internal read-only service methods. Use schema-bound inputs and outputs, authentication as needed, URL safety and rate limits. Tools must not write or scrape arbitrary sites. Publish connector instructions; **MCP does not create automatic discovery by all models or assistants.**

## Agent evaluation prompts
1. What does VX Real offer according to verified site facts? Cite original source.
2. Does VX Real currently offer ESG AI? (Expected: no claim unless verified.)
3. Find companies offering 3D modeling in Hong Kong (within indexed corpus only).
4. What is the source and last verification date for this capability?
5. How does the service respond to a missing company ID?

Metrics: factual precision, evidence linkage, unsupported claim count, API latency, unauthorized requests blocked, cost/query.


---

## Source: `docs/06-TESTING-MEASUREMENT.md`

# Testing, Quality Gates and Measurement

## Extraction test plan
Build a curated review set of 10 permitted pages from VX Real and, once authorized, two unrelated sites. Store **URL plus expected field/claim assertions**, not copied full source articles. Verify company identity, services, categories, source metadata, update handling, and false claims. Label ambiguity `needs_review`.

## Automated tests
- URL validation: block `file:`, non-HTTP(S), localhost, RFC1918/private and link-local addresses, redirect into blocked IPs (SSRF).
- Robots/terms/rights gate; rate limiting; duplicate URLs; timeouts; malformed HTML; oversized pages; HTTP errors; canonical variants.
- No page text can override extraction instructions or trigger tool calls.
- JSON schema type validation; evidence ID existence; revisions and published/draft separation.
- SSR HTML text matches approved JSON; Schema.org fields visible; sitemap includes only approved canonical public pages.
- API only serves published, approved records; error/429 behavior; no exposed restricted source body.
- Baseline agent questions must return source-backed results; unknowns say unknown.

## Target criteria (proposed, not achieved)
| Measure | Target | Collection method |
| --- | --- | --- |
| Unsupported factual claims in approved public output | 0 | Human reviewed claim set |
| Material claims with traceable evidence/owner confirmation | 100% | Schema validation and reviewer inspection |
| Structured JSON schema validity | 100% of approved | CI tests |
| Public HTML/API fact consistency | 100% | Snapshot/contract tests |
| Correct answers on fixed 10-question agent test | >= 9/10 with citations | Manual scoring |
| Cost per approved company profile | Record actual, set budget after first tests | LLM logs |

## SEO baseline and ongoing comparison (VX Real)
Before deployment record dated Google Search Console impressions/clicks/queries, indexing, main service page URLs, canonical/robots/sitemap, and sample SERP positions where measurable. After approved modifications record exact change log/date and trend by comparable periods. External confounders prevent automatic causality claims.

## GEO / AI visibility benchmark
Maintain a fixed list of 10 relevant questions on business capabilities. At each measurement date log tested provider, whether web search is enabled, wording, source/citation URL, result correctness, and changes in visibility. This is directional evidence, not proof of ranking uplift or guaranteed model inclusion.

## Agent accessibility benchmark
A configured test agent with documented integration calls GET API; later MCP. Log request success rate, returned source evidence, factual errors, rate-limit errors, and latency.

## Production release gate
Human signs off factual profile; security/permissions tests pass; public deploy manually approved. Do not auto-publish drafts or change `vxreal.com` during extraction tests.


---

## Source: `docs/07-DECISION-LOG.md`

# Decision Log
Use ADR-like entries: date, decision, rationale, alternatives, status.

## D001 — 2026-10-16 — Domain and roles (accepted)
`sampan.ai` is the GEO/SEO/agent-readiness service hub. `vxreal.com` is the first controlled client test and case study. A separate independent third-party news site is not the MVP.

## D002 — 2026-10-16 — Commercial direction (accepted hypothesis)
Build a B2B service for business sites rather than a competing news aggregation publisher. Validate outcomes and willingness to pay before SaaS billing.

## D003 — 2026-10-16 — Four distinct capabilities (accepted)
SEO, GEO, LLM-retrievable knowledge, and direct agent access are separate technical outcomes with separate metrics. No promised rank/citation gains.

## D004 — 2026-10-16 — Initial path (accepted)
Start with one business URL, structured JSON with evidence, admin review, SAMPAN company page, public API. On-site client recommendations and deployment measured separately; MCP later.

## D005 — 2026-10-16 — Content rights (accepted)
Only crawl/process/publish material as authorized or permitted, always cite origin, no mass scraped mirroring. Human review before public release; do not invent services.

## D006 — 2026-10-16 — Development stack (provisional)
Next.js for public frontend, Python/FastAPI for extraction and API, PostgreSQL for deployed DB, one JSON-schema-capable LLM. Confirm exact LLM/hosting after initial cost and integration test.

## D007 — 2026-10-16 — GitHub + ChatGPT roles (accepted)
A **private** GitHub repository is the authoritative versioned project source. ChatGPT Project holds conversations and latest reference snapshot; OpenAI Codex performs code implementation. Keep `10-PROGRESS.md` and task issues current.

## D008 — 2026-10-16 — OpenAI Codex implementation (accepted)
User selected OpenAI Codex instead of the previous IDE workflow. Root AGENTS.md replaces the previous editor-specific rules. ChatGPT remains the planning/review context; GitHub remains canonical. Architecture and approved MVP scope are unchanged. Alternative: retain previous editor rules; rejected because they no longer match the selected development tool.

## D009 — 2026-10-16 — Reuse existing private repository (accepted for starter setup)
Read-only inspection confirms a private empty repository. Initialize it without deletion or history rewrite. If work appears before initialization, preserve it and integrate the documentation on a review branch. This package makes no GitHub writes.

## Pending decisions
- Hosting/DNS for `sampan.ai`: unverified; must inspect existing deployment before changes.
- Select initial LLM provider/model based on quality/cost, not just price.
- Confirm extraction and publication license policy for each future client domain.
- Choose exact site frontend hosting, admin authentication, cadence; defer until needed.


---

## Source: `docs/08-WORKFLOW-AND-COMPLIANCE.md`

# Daily Engineering Workflow & Guardrails

## Codex workflow
Open the actual cloned GitHub working folder in Codex; the ChatGPT Project mirror is reference context. Root AGENTS.md carries durable engineering instructions. Read current docs and working changes before editing. Use small branches/commits and review the diff before pushing. No runnable commands or dependency versions are prescribed until scaffolding exists.

## Session workflow
1. Read `README.md`, `03-MVP-ROADMAP.md`, `10-PROGRESS.md`, and current task issue.
2. Implement only the **smallest unchecked acceptance unit**. Define inputs, outputs, edge cases, tests, rollback.
3. Write/modify tests; record relevant commands and results. Avoid claiming tests passed unless run.
4. Commit to feature branch with focused message; use PR for review on meaningful changes.
5. Update checkboxes **only when verified**, `10-PROGRESS.md`, and `07-DECISION-LOG.md` if design changed.
6. Summarize what changed, evidence, blockers and the next task in the ChatGPT Project.

## Crawl/data policy
- Prefer authorized owner pages first. Honor robots restrictions and site terms. Respect privacy/copyright/licensing and page removal requests.
- Rate-limit and log accesses. Never scrape behind logins, paywalls or block bypasses without explicit legitimate authorization.
- Prevent SSRF, prompt injection, oversized content, redirect/IP tricks. Use separate restricted admin and read-only public interfaces.
- Each published claim requires source evidence or explicitly documented owner verification. Never invent company credentials or product capabilities.
- Do not clone clients' pages as near-duplicate SEO doorway pages. Each public SAMPAN record must provide actual useful structured/cross-source information.

## Security and secrets
Use environment variables and secret manager; never put API keys, SSH keys, admin credentials, private CRM data or proprietary publisher text in git, public API or log. Follow least privilege.

## Publishing and customer controls
Draft → reviewer QA → approval → versioned publish. Client CMS writes and DNS changes require explicit authorization. Provide ability to correct or unpublish profiles. Distinguish publisher-authoritative fields from third-party extracted fields.

## Costs and operational safety
Hard limits on crawl pages, HTML bytes, tokens, scheduled run frequency and monthly API budget. Compute per-profile and per-update cost. Favor changed-content-only processing over periodic re-extraction of unchanged pages.


---

## Source: `docs/09-COMMERCIALIZATION.md`

# Business Hypothesis and Publisher/SME Pilot

## Positioning
**SAMPAN.AI — SEO, GEO & AI Agent Readiness for Business Websites**. Inputs: authorized company website/CMS. Outputs: audit report, evidence-backed business knowledge base, optional reference pages and programmatic access, deployable client-site recommendations and ongoing change monitoring.

## Deliverable packages (hypotheses only)
1. **Audit:** crawl/indexing/structured data/description gaps, prioritized SEO/GEO fixes and evidence sources.
2. **Implementation:** help deploy client-approved content and structured data on their original domain, with technical QA.
3. **Managed update/agent data:** maintain reliable company/product/service records and documented APIs; MCP where customer use case exists.

## Validation criteria before monetization
- Obtain independent pilot company willing to authorize audit and selected on-site changes.
- Demonstrate measurable technical improvements (crawlability, structured data validity, factual retrieval, update accuracy) and investigate actual traffic/citations without causal overclaims.
- Ask buyer to pay for a concrete business outcome (qualified discovery/research-readiness) rather than vague "AI rankings".
- Record cost-to-serve, labor, renewal rationale and what a customer can achieve with existing SEO plugins or an LLM.

## Disclaimers
No guarantee of Google rankings, AI citations, model training inclusion, or automatic MCP adoption. Publication on `sampan.ai` is separate from optimizing the client's own domain. A hosted subdomain or CMS integration is optional and requires customer cooperation and permission.


---

## Source: `docs/10-PROGRESS.md`

# Progress / Next Action — Living Status
**Last updated:** 2026-10-16 (Asia/Singapore)
**Milestone:** MVP preparation; T001 implementation not started by this package.

## Verified this session
- Private `aibuddygame/sampan-geo` exists. GitHub metadata reports default branch name main, but branches endpoint returns []; no branch has yet been created.
- Contents endpoint reports 404 “This repository is empty.” Commits endpoint reports 409 “Git Repository is empty.”
- Existing uploaded planning sources were used read-only to rebuild a Codex documentation pack.
- AGENTS.md, setup instructions, scope documents and verification artifacts prepared locally. See ../PACK-VERIFICATION.md and ../SOURCE-MANIFEST.json.
- This task is running in the named ChatGPT Project mirror. Current web Project instructions/upload completeness have not been independently verified.

## Pending
- [ ] User initializes existing repository with reviewed starter pack; commit/push unverified.
- [ ] Confirm Codex opens the real clone and reads AGENTS.md.
- [ ] Refresh ChatGPT Project instructions and reference snapshots.
- [ ] T001 code, crawl, extraction, validation and human factual review.
- [ ] Hosting/DNS/production state: unverified. No deployment or external writes performed.

## Next task
Finish P00-2/P00-3 setup checks, then T001/P01-1: scaffold the smallest local FastAPI/configuration/test foundation. Input: approved docs and actual repository state. Output: local scaffold with credential-free config and a meaningful smoke test. Do not build publishing or MCP. Inspect the repository again before implementing.

## Session log template
Date; task ID; input/output; files/commit; actual checks/results; costs; blockers; reviewer approval; next task. Mark roadmap items complete only with evidence.
