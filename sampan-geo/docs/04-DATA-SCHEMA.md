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

Evidence records require unique ID, source URL, source hash, locator, observation timestamp and permitted excerpt where appropriate. Claims reference existing evidence IDs. Owner verification records require provenance type, reviewer, date and the owner's statement/reference. Keep factual verification status separate from revision workflow status: draft → approved → published, with rejected/unpublished states. Approval does not itself publish. Edits invalidate prior revision approval. Publication requires approval of the exact revision and no unresolved material claims. HTML, JSON-LD and API derive from that revision; API mapping is in [05-API-MCP.md](05-API-MCP.md).

## Normalization rules
- Prefer official domain, actual organization name and owner-verified canonical identity; do not infer legal structure from marketing name.
- Record field-level source and verification; no blanket 'verified' based on a single crawl.
- Distinguish `source_published_at`, `observed_at`, `updated_at`, `approved_at`.
- Keep history; corrections should supersede not silently overwrite published facts.
- Do not store personal contact details beyond legitimate public business need and applicable permissions.
