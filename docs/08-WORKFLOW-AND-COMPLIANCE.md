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

## Client SEO/GEO improvement procedure
Use [docs23](23-SEO-GEO-STANDARD-PROCEDURE.md) and its blank client record for engagements. Separate collection consent, factual approval and deployment approval. Search Console/export is optional; missing measurement does not block improvements or justify an invented visibility score.
