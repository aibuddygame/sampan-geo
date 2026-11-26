# SAMPAN.AI — SEO, GEO & Agent-Ready Business Intelligence

## Start here — teammate testing (17 November 2026)

The current local prototype includes English/Traditional Chinese URL checks, separate SEO/GEO readiness scores, up to nine source-backed topics, optional Kimi analysis and local report history. Run it on your own computer; no public SAMPAN deployment is included.

**[Team testing hub](docs/team/README.md)** — project brief, checklist and feedback template.

**[Teammate setup guide](docs/team/TEAM-SETUP.md)** — clone, install, start the checker on port 8004 and report feedback. **[Reusable skills](docs/team/skills/)** and **[AI visibility implementation plan](docs/team/AI-VISIBILITY-PLAN.md)** are included. AI mentions/citations tracking is planned, not implemented. Google reporting uses private local snapshots and legacy pilot routing; teammate Google access is separate.

The original T001 roadmap below remains a separate milestone from this local scoring experiment. Credentials, Google authorization, saved client reports and local transfer archives are excluded from Git.


**Status:** Local backend, discovery and URL-scoring prototype. VX Real robots serving resolved and three live-page scores verified on 2026-10-26; full T001 inventory remains pending. SAMPAN application not publicly deployed. **Updated:** 2026-10-26.

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
| **vxreal.com** | Business content, authoritative facts, site SEO performance | Offer approved public pages to ingestion; verify company facts; approve changes; deploy on-site SEO/GEO improvements; optionally provide Search Console access or exports; measure available baselines and outcomes. |
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
Use **OpenAI Codex** for implementation and ChatGPT Project for planning/review. Start with [the setup guide](GITHUB_AND_CHATGPT_SETUP.md). The local Python foundation and private safe-intake service are implemented; bounded discovery is implemented. The earlier live robots content-type blocker was resolved and three representative pages scored successfully on 2026-10-26; the full P01-3 inventory remains pending. Extraction, review and publishing remain pending. See [source inventory status](docs/12-SOURCE-DISCOVERY.md). See [safe-intake policy and limits](docs/11-SAFE-INTAKE.md).

The starter documentation is committed. The earlier empty-repository snapshot is historical; see `docs/10-PROGRESS.md` for implementation progress.

## Current next action
**Task T001:** Crawl a small, permitted selection of `vxreal.com` pages into an auditable source manifest, without publishing or making changes to VX Real. See roadmap Phase 1.

## Ownership and safety
The broader platform remains a specification; only the local backend, safe-intake and discovery services are implemented. Never commit credentials, customer private data, or full copyrighted page bodies to GitHub. Publishing any client profile requires permission where appropriate, a human approval gate, and correct source attribution. Use a **private GitHub repository** until public release is authorized.

## Local backend (Python 3.11+)
Run from the repository root:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -e '.[dev]'
.venv/bin/python -m pytest -q
.venv/bin/python -m uvicorn sampan.main:create_app --factory --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/health` for process liveness and `/docs` for local API documentation. Stop with Control-C. No database, API key or network access is needed to run the app or tests after installation. Optional settings are shown in `.env.example`; copy it to ignored `.env` or set `SAMPAN_ENVIRONMENT` (`local`/`test`) and `SAMPAN_DEBUG` in the environment. Debug defaults to false. Health does not verify external service readiness. Bind locally; this scaffold has no authentication or deployment configuration.

## Local URL readiness experiment (L001)

A separate localhost form accepts an authorized HTTPS page URL and returns experimental single-page SEO/GEO readiness checks. Repeated successful scans in the same tab show score changes. This is not a ranking/citation measurement or a deployed public service; T001 inventory status is unchanged.

```sh
.venv/bin/python -m uvicorn sampan.scoring_app:create_scoring_app --factory --host 127.0.0.1 --port 8001
```

Open http://127.0.0.1:8001/. The scoring audit supports ordinary missing robots (404/410), bounded gzip/deflate and HTTPS apex/www redirects after permission and per-host policy checks. Actual access/policy blocks receive no score; T001 strict intake defaults remain separate. Read the [current 55-check verified-readiness rubric](docs/20-VERIFIED-READINESS-SCALE.md); the [version 0.3 rubric and audit compatibility](docs/15-SCORING-FAIRNESS-AND-COMPATIBILITY.md) record the earlier percentage method. Saved-HTML mode can assess an authorized local file without fetching the website; live access remains untested in that mode. Results show separate SEO/GEO scores, category coverage, prioritized findings, expandable evidence, filters and JSON export. The [initial prototype record](docs/13-LOCAL-SCORING-PROTOTYPE.md) is historical.

The [site-derived keyword trial](docs/17-SITE-DERIVED-KEYWORDS.md) extracts up to nine English, Traditional Chinese or mixed-language keyword phrases from each website’s own titles, headings, descriptions and content, with separate experimental SEO/GEO content-signal scores and evidence. It no longer uses a fixed AI topic catalog. The live form optionally reviews up to eight same-origin linked pages; saved HTML stays offline. Relevance is assessed; search popularity, competition, Google rankings and AI citations remain unmeasured. Technical scores describe only the submitted page. The [L006 catalog trial](docs/16-TOPIC-READINESS-TRIAL.md) is historical.

Optional [Kimi keyword analysis](docs/18-KIMI-KEYWORD-ANALYSIS.md), defaulting to `kimi-k3.1-pro`, uses a server-side `SAMPAN_KIMI_API_KEY` to propose natural search phrases with source-matched quotations. Select it in live URL mode; saved HTML remains offline. Kimi selects keywords, local rules calculate scores, and search demand remains unmeasured. Requests and tokens are capped; provider charges may apply. Credentials are never sent to the browser.

The [meaning-based keyword scoring experiment](docs/19-SEMANTIC-READINESS-SCORING.md) uses source-backed Kimi annotations to recognise equivalent and related wording. Cards expose evidence and a phrase-only comparison on the same content. These are experimental readiness judgments, not measured search visibility.

The current [L011 audit](docs/20-VERIFIED-READINESS-SCALE.md) displays keyword and technical scores out of ten, with up to nine keyword cards. The 55-check audit separates verified credit, unresolved checks and observed gaps; sampled-page comparisons add detail. Search visibility remains a separate, unmeasured outcome. Earlier 49-check percentages describe the historical rubric.

[L012 JavaScript capture and section extraction](docs/21-RENDERING-AND-SECTION-EXTRACTION.md) adds an optional isolated offline renderer for empty application shells, representative service-card excerpts and body-evidence scoring fixes. Install the optional `render` extra and Chromium to enable it. The form labels capture limits, records bounded content navigation and lets you switch between initial HTML and rendered-content audits; exports retain both. No title-only keyword content scores are produced.

## Repeatable client improvement workflow

The [VX Real review and prioritized backlog](docs/22-VXREAL-REVIEW-AND-IMPROVEMENT-PLAN.md), [standard operating procedure](docs/23-SEO-GEO-STANDARD-PROCEDURE.md), and [blank client record](docs/templates/seo-geo-client-record.md) define the operator workflow. Search Console is optional for starting improvements. The workflow includes manual and proposed stages; it is not an implemented end-to-end automation.

Chinese source support is experimental; the report interface remains English. See [L017 language rules and verified limits](docs/24-CHINESE-WEBSITE-SUPPORT.md). Local candidates use observed headings; semantic translation/script equivalence is not assumed.

The [L021 relevance and page-scope update](docs/25-KEYWORD-RELEVANCE-AND-PAGE-SCOPE.md) filters disclosure/brand/reference pollution, handles Chinese question subjects and mixed negation, detects sparse app fallbacks, and exposes separate raw/rendered/reviewed-page audits. Version 0.6 scores remain experimental readiness signals; country demand, rankings and citations require separate measurements.

[Discovery keyword specificity (L023)](docs/26-DISCOVERY-KEYWORD-SPECIFICITY.md) excludes observed named projects/publication titles and adds same-page context to ambiguous short Chinese queries. The UI distinguishes composed suggestions from literal source quotations. Topic selection is version 0.7; the technical audit remains version 0.6.

## Local service and reporting prototype
The same scoring app now combines a marketing introduction and website check at `/`, with a loopback-only pilot workspace at `/pilots`. Choose VX Real or marksix.gold in the live form to save a dated report; one-off and saved-HTML checks stay transient. Reports persist under ignored `private/pilot-reports/` (ten per pilot, two MB each). Search Console, online client sign-in, automatic publication and billing are not connected. This server must not be exposed as a public client portal. See [local reporting and pilot preparation](docs/27-SAMPAN-MARKETING-AND-MANAGED-PILOT.md).

## Real APIs with local hosting
Keep the scoring server on 127.0.0.1:8004 while using real Kimi and permitted pilot website collection. The pilot workspace now shows configured/verified connection states, actual in-process usage and missing outcome services. Backend credentials belong only in ignored environment configuration. See [local live integrations and Search Console preparation](docs/28-LOCAL-LIVE-INTEGRATIONS.md). The marksix.gold Search Console CLI connection is now live-verified; dashboard integration is pending. No public hosting is required for this testing stage.

## marksix.gold measurement preparation
The [local read-only Search Console CLI and managed-pilot brief](docs/29-MARKSIX-LOCAL-MANAGED-PILOT.md) are implemented/prepared. Install the optional google extra for Google consent. Read-only owner authorization and live marksix.gold data retrieval were verified on 2026-11-05. The CLI stores private snapshots; dashboard outcome display and its connection-status labels still need integration. SAMPAN remains local.

## Colleague handoff — 13 November 2026

Use the [VX Real and ESGtrace handoff](docs/30-COLLEAGUE-HANDOFF-AND-AI-VISIBILITY.md) for current colleague setup, portable skills, source transfer and the actual AI mention/citation tracking plan. The handoff records legacy pilot bindings and the next V001–V004 implementation units. Automated AI visibility remains planned work. Historical transfer archives remain local and are excluded from Git; the setup guide and reusable procedures above are included directly in this repository.

## AI Corporate Ambassador website starter

The new corporate website workstream lives in **[apps/web/](apps/web/README.md)**. It includes an isolated runnable static starter and copies of the nine [mockup specification documents](docs/ai-corporate-ambassador/README.md). Existing Next.js SEO/AEO application `web/` and Python SEO/GEO services `src/sampan/` are preserved. This is a starter, not a completed multi-page mockup or deployment.
