# L001 — Local single-page readiness prototype

Historical first-rubric record. Superseded for current behavior by [L002 weighted rubric](14-WEIGHTED-READINESS-RUBRIC.md); original 13-check scores below are not comparable to version 0.2.

User explicitly requested this separate experiment on 2026-10-23. It does not complete or replace T001/P01-3–8.

## Objective, input/output and approach

Input: one public HTTPS page URL and an operator confirmation of collection authorization and terms review. Output: timestamped SEO/GEO readiness scores, individual checks with evidence and recommendations, coverage, content hash and rubric version. Blocked scans return no score.

Simplest approach: a separate loopback FastAPI app serving a small HTML/JavaScript form over the existing safe-intake service. No additional dependencies, Next.js project, database, LLM, paid API or deployment. This is a temporary local experiment; the proposed production Next.js architecture is unchanged.

## Run

From the repository root:

```sh
.venv/bin/python -m uvicorn sampan.scoring_app:create_scoring_app --factory --host 127.0.0.1 --port 8001
```

Open http://127.0.0.1:8001/. Enter a full `https://` URL and confirm collection authorization/terms. Click **Check readiness**. Run again for the same submitted URL after deploying changes. Previous successful results are held only in the current tab's JavaScript memory; reload clears them. Changed URL spellings use separate comparisons. There is no scheduled scanning or durable history. Stop with Control-C.

Use only locally. Remote clients/Host headers are rejected and a per-process form token is required for scan requests. No CORS is enabled. The local token is not production authentication; do not expose through a tunnel, proxy or public bind. Raw fetched pages and scores are not persisted. Uvicorn access logs contain local endpoint paths, not submitted URL bodies.

## Safety and coverage

The scoring adapter selects the submitted hostname as the exact permitted origin for that scan. SafeIntake still defaults to vxreal.com for T001; discovery is not generalized. Same-host HTTPS/443 only, pinned public DNS addresses, TLS hostname verification, robots policy, redirects and byte/time limits remain enforced. No cross-host redirect fallback or retries. A site redirecting to www requires its final canonical host to be entered explicitly, with a valid robots response at that host.

One page per scan, at most five requests including robots and redirects, a 30-second run ceiling, existing 1 MB response cap/64 KB robots cap, and one scan at a time. Existing request deadlines/rate delays apply. The scanner's deliberately restrictive robots subset requires HTTP 200 UTF-8 text/plain and can reject unsupported directives or missing robots even if a browser can open the page. Compressed responses remain unsupported. Blocked does not mean the business has poor SEO; no score is assigned.

## Rubric single-page-0.1

Each evaluated check has equal weight within its category. Score = rounded 100 × passed / evaluated. Unknown checks are excluded and coverage is shown. Preserve the rubric version for comparisons; a future rule change needs a new version. A 100 means all these narrow checks passed, not comprehensive optimization.

SEO (8 checks): title present; description present; one nonempty H1; one same-host absolute HTTPS canonical; no HTML noindex/none; device-width viewport; same-host link present; nonempty image alternatives. No images or empty/missing alt produce unknown because decorative intent needs human review. Destination availability, alt quality and page-title uniqueness are not evaluated.

GEO (5 checks): parseable JSON-LD present; Organization with name and matching website URL; that name found in body text; H2/H3 sections present; at least 50 whitespace-separated words of readable HTML text. These are coarse English-oriented structural heuristics, not factual verification, rendered visibility or content-quality judgments. The rubric does not reward llms.txt. JSON parsing does not prove Schema.org validity or eligibility for rich results.

Not measured: full-site crawl, sitemap validity, response X-Robots-Tag, performance/Core Web Vitals, actual mobile rendering quality, indexing, rankings, backlinks, AI-answer citations, training inclusion, Search Console data, conversions or agent integration. All website text is treated as untrusted data and displayed through textContent, never executed.

## Acceptance and verification

- URL form and separate scores are usable in a browser.
- Improved synthetic HTML yields higher scores; repeat scans show deltas.
- No score is fabricated after a block; failed scans hide previous results.
- Permission/token/Host protections and public-DNS pinning apply; cross-origin redirects remain blocked.
- Existing T001 tests continue passing. No T001 completion inferred.

2026-10-23: full suite 134 passed, one pre-existing upstream Starlette TestClient deprecation warning. `pip check`: no broken requirements. `git diff --check`: passed.

Browser QA: real app opened at 127.0.0.1:8001 and live vxreal.com request returned `robots unavailable; operator review required`, displaying no score. An isolated temporary fixture server supplied synthetic before/after HTML: browser displayed SEO 29→100 and GEO 0→100, with +71/+100 deltas. No example.com content was fetched. Fixture server stopped after QA. Screenshot reviewed for initial/error and result layout; no automated mobile-browser test was run.

Local-file experiment (not network measurement): original downloaded VX Real index scored SEO 88/GEO 40, prepared deployment index scored 100/100. These results validate sensitivity to the added markup only, not business outcomes or factual correctness.

Rollback: stop the scoring server and revert the focused scoring files, package-data entry and configurable-host extension. Preserve user changes and private artifacts. Next: owner fixes/reviews live robots serving, then rerun the local page. Broader scoring, persisted history and public launch remain separate tasks.
