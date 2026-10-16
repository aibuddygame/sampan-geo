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
