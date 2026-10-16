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
