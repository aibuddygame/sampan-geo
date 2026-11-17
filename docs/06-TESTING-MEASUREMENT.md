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
Before deployment record main service URLs and technical evidence, plus dated Search Console/export, indexing and sample search-position data where available. Account connection is optional; unavailable data remains unmeasured and does not block improvements. After approved modifications record exact change log/date and compare equivalent periods/targets when data exists. Without a comparable baseline, do not claim measured uplift. External confounders prevent automatic causality claims.

## GEO / AI visibility benchmark
Maintain a fixed list of 10 relevant questions on business capabilities. At each measurement date log tested provider, whether web search is enabled, wording, source/citation URL, result correctness, and changes in visibility. This is directional evidence, not proof of ranking uplift or guaranteed model inclusion.

## Agent accessibility benchmark
A configured test agent with documented integration calls GET API; later MCP. Log request success rate, returned source evidence, factual errors, rate-limit errors, and latency.

## Production release gate
Human signs off factual profile; security/permissions tests pass; public deploy manually approved. Do not auto-publish drafts or change `vxreal.com` during extraction tests.
