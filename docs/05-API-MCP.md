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
