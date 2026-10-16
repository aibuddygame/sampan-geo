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
