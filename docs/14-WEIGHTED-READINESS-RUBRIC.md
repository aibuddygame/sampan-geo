# L002 — Detailed SEO / GEO readiness rubric

Historical version 0.2. Current behavior is documented in [version 0.3 scoring fairness and compatibility](15-SCORING-FAIRNESS-AND-COMPATIBILITY.md). Retained for earlier report interpretation.

User-approved local experiment, 2026-10-23. This updates L001 without completing any outstanding T001 work. No public deployment.

## Objective and acceptance

Input: one authorized public HTTPS URL, or an owner-supplied UTF-8 HTML file (at most 1 MB) labelled with its original HTTPS URL. Output: separate SEO/GEO scores, 49 detailed checks, weighted category breakdowns, severity-prioritized improvements, observed evidence, recommendations, coverage, rubric version, ephemeral rescan comparison and a downloadable JSON report. Simplest approach: extend the existing deterministic FastAPI/HTML prototype; no dependencies, LLM or external analytics account added.

Acceptance: both rubrics total 100; partial/unknown/N/A results are handled honestly; low coverage withholds the overall score; uploaded HTML never triggers network requests or executes scripts; existing URL/permission protections remain; the browser displays separate scores, details and filters; existing tests pass. Scoring is SAMPAN's proposed methodology, not Semrush's formula or an official search-engine rating.

## Calculation

Rubric: `weighted-page-0.2`.

- Pass: full weight; partial: half; fail: zero.
- Unknown: not enough evidence or not implemented; no earned points and excluded from evaluated weight.
- N/A: not applicable to this page/input; excluded from applicable and evaluated weight. For example, no images is N/A rather than a failure.
- Overall = rounded `100 * earned / evaluated possible weight`.
- Coverage = `evaluated possible weight / applicable rubric weight`. Overall scores require at least 60% coverage, before rounding. Category percentages always show their evaluated denominator and check counts; zero coverage means Not assessed.
- Every result is provisional. A complete score under this rubric does not establish factual quality, Google indexing, actual AI visibility, rankings, traffic or conversions.
- Rescan history exists only in the tab. A different rubric or source mode cannot produce a comparable delta. Changes in coverage/check applicability can change the score independently of actual quality; inspect check-level details.
- Critical observed indexing issues are shown prominently even if other checks pass. The score is not a probability of being indexed.

## SEO breakdown — 28 checks, 100 points


### Access & indexing — 30 points

| Check | Weight | Method / scope | Why it matters |
| --- | ---: | --- | --- |
| HTTPS URL | 5 | HTML check | Secure transport helps users and crawlers access the page. |
| Successful page response | 8 | Live fetch | A working response is a prerequisite for normal indexing. |
| HTML indexing directives | 7 | HTML check | An explicit noindex prevents indexing by crawlers that honor it. |
| HTTP indexing directives | 5 | Live response header | HTTP headers can override page-level indexing intent. |
| Scanner permitted by robots policy | 5 | Live collector policy | Scanner permission is different from permission for Googlebot or AI crawlers. |

### Search presentation — 25 points

| Check | Weight | Method / scope | Why it matters |
| --- | ---: | --- | --- |
| Page title present | 5 | HTML check | A title describes the page in browser and search contexts. |
| One title element | 3 | HTML check | Conflicting title elements make the document ambiguous. |
| Title length review | 3 | Editorial heuristic | Very short or long titles may deserve an editorial review. |
| Meta description present | 4 | HTML check | A useful summary can help communicate the page's purpose. |
| One description element | 2 | HTML check | Duplicate summaries can conflict. |
| Description length review | 2 | Editorial heuristic | Summary usefulness matters more than a fixed character count. |
| Document language declared | 3 | HTML check | Language metadata supports interpretation and accessibility. |
| Nonempty main heading | 3 | HTML check | A descriptive main heading helps communicate the page topic. |

### Discovery & URL signals — 20 points

| Check | Weight | Method / scope | Why it matters |
| --- | ---: | --- | --- |
| Canonical declaration | 5 | HTML check | A canonical expresses the preferred URL; it is not an indexing guarantee. |
| Canonical URL review | 3 | HTML check | Relative and cross-domain canonicals can be valid but need contextual review. |
| Navigable same-host links | 5 | HTML check | Navigation helps users and crawlers discover related pages. |
| Descriptive internal anchors | 3 | English-oriented heuristic | Meaningful labels explain the linked destination. |
| Link destination availability | 4 | Requires additional crawl | A link in HTML does not prove its destination works. |

### Structure & media — 15 points

| Check | Weight | Method / scope | Why it matters |
| --- | ---: | --- | --- |
| Main heading structure | 3 | Editorial heuristic | A clear main heading makes the report easier to interpret. |
| Heading sequence | 2 | HTML check | Ordered headings support navigability; they do not prove content quality. |
| Image alternatives | 4 | HTML check | Decorative images can correctly use empty alt; human review is needed. |
| Image layout reservation | 2 | HTML check | Explicit dimensions or equivalent CSS can reserve image space. |
| Device-width viewport | 2 | HTML check | A device-width viewport supports responsive layouts. |
| Rendered mobile usability | 2 | Requires browser test | A viewport tag does not prove usability. |

### Markup & resource signals — 10 points

| Check | Weight | Method / scope | Why it matters |
| --- | ---: | --- | --- |
| JSON-LD syntax | 3 | HTML check | Malformed structured data cannot reliably communicate the intended record. |
| Schema.org vocabulary | 2 | HTML check | A vocabulary identifies the meaning of structured fields. |
| Insecure resource references | 2 | HTML check | HTTP assets on an HTTPS page may be blocked or upgraded by browsers. |
| Loading performance / Core Web Vitals | 3 | Requires performance data | HTML inspection cannot establish loading speed or Core Web Vitals. |

## GEO breakdown — 21 checks, 100 points


### Retrieval & excerpts — 25 points

| Check | Weight | Method / scope | Why it matters |
| --- | ---: | --- | --- |
| Working retrievable page | 5 | Live fetch | A successful scanner fetch is access evidence for this scanner only. |
| Substantive HTML text | 10 | Length heuristic; no rendering | Retrievable text makes facts available without executing scripts; length does not prove usefulness. |
| HTML/available header snippet controls | 5 | Available directives only | Snippet controls can limit eligible excerpts in Google Search; other AI systems differ. |
| Search/AI crawler-specific access | 5 | Requires crawler-policy audit | SampanBot access does not establish platform-specific access or training inclusion. |

### Business identity & context — 25 points

| Check | Weight | Method / scope | Why it matters |
| --- | ---: | --- | --- |
| Structured organization name | 5 | HTML check | A named record can reduce identity ambiguity; structured data is optional for AI search. |
| Descriptive body passage | 8 | Paragraph-presence heuristic | A substantive introduction can explain who you are and what you do. |
| Contact route discoverable | 4 | Link-pattern heuristic | A contact route gives visitors a practical next step and identity context. |
| Company context route | 4 | English URL-pattern heuristic | Company context can help a reader understand the organization. |
| Structured name matches body text | 4 | HTML check | Consistency helps reduce conflicting identity signals. |

### Answer-friendly organization — 20 points

| Check | Weight | Method / scope | Why it matters |
| --- | ---: | --- | --- |
| Descriptive subsection headings | 5 | HTML check | Section labels help readers locate specific information. |
| Readable paragraph structure | 5 | Structural heuristic | Separate passages can make information easier to locate and quote accurately. |
| Lists or structured facts | 5 | Structural heuristic | Structured facts can make specifications or steps easier to interpret. |
| Answers satisfy customer intent | 5 | Requires editorial review | Markup and word count do not prove the page answers customer questions. |

### Evidence & accountability — 20 points

| Check | Weight | Method / scope | Why it matters |
| --- | ---: | --- | --- |
| Supporting claims and sources | 8 | Requires claim/evidence review | An arbitrary outbound link is not proof of a claim. |
| External source labels | 4 | HTML check | Labels help readers understand a linked source; authority is not measured. |
| Publication/update date review | 4 | Markup observation + editorial review | Dates matter for time-sensitive claims, but may be unnecessary on an evergreen page. |
| Responsible author or organization | 4 | Requires editorial review | A name or logo alone does not establish expertise or accountability. |

### Machine-readable consistency — 10 points

| Check | Weight | Method / scope | Why it matters |
| --- | ---: | --- | --- |
| Structured data parses | 3 | HTML check | Consistent machine-readable records can complement useful visible text. |
| Relevant schema type present | 2 | HTML check | An appropriate type describes what the record represents; suitability still needs review. |
| Organization website consistency | 2 | HTML check | The company website field should identify the intended official site. |
| Structured claims match visible facts | 3 | Requires factual review | Valid JSON can still contain unsupported or inconsistent claims. |

## Heuristics and limits

The scanner reads one page. It does not fetch the sitemap, linked pages, canonical destination or assets. Cross-page title uniqueness, backlinks, search queries, market comparison, index membership, Core Web Vitals, rendered mobile usability and actual AI answers are not measured. Unknown checks are displayed rather than disguised as passes or failures. No performance/citation score is invented.

HTML heuristics: title length 15–65 characters and description length 50–170 are editorial review ranges, not Google requirements or hard snippet limits. Nonempty titles/descriptions have separate presence checks. Exactly one H1 is an editorial convention, not an indexing prerequisite. Main body text excludes head/script/style/template/noscript/nav/footer and explicitly hidden/aria-hidden nodes; CSS visibility is not established. The readable-text heuristic awards full credit at 400 body-text characters, half at 100–399, none below 100; length does not establish relevance. Paragraphs need 40 characters to count; two passages earn full structure credit and one earns half. English URL/anchor patterns are coarse observations, not semantic content assessments.

An empty image alt can be appropriate for decoration; such cases need review. Width/height absence does not prove layout shift because CSS might reserve space. External links do not prove evidence, credibility or independent corroboration. Dates and authorship are context-dependent; missing markup does not automatically make them failures. Schema syntax checks are not full JSON-LD/Schema.org validation. A named Organization is only a declared identity, not verified business status. Schema.org mappings/other vocabularies may require contextual review. Relative and cross-domain canonicals can be valid and receive review rather than an automatic absolute failure. HTTP header checks use collected X-Robots-Tag; agent-scoped policies remain unknown pending fuller parsing. AI-specific crawler permissions are not inferred from SampanBot permission. llms.txt and AI-training preferences are not scored.

Live scans preserve existing strict robots collection gates, DNS/IP pinning, redirects and budgets. Missing robots with HTTP 404 is not a Google SEO penalty: the live prototype can still stop due to its stricter collection policy, and this must be explained as a scanner limitation. Saved HTML is an alternative user-supplied input, never a workaround that fetches disallowed pages. Its HTTP response, edge policy, robots permission and deployment state remain unknown. No source body is saved on the server.

## Semrush reference and positioning

The user-supplied [Japanese Semrush landing page](https://semrush.jp/lp/seo/) was reviewed in the browser after the web fetch returned 502. It presents site audit alongside keyword research, position tracking, competitor research and backlinks. This prototype covers a bounded on-page assessment only. It does not replicate Semrush's databases, benchmarks, monitoring or proprietary formula.

Semrush's [audit overview](https://www.semrush.com/kb/540-site-audit-overview) and [scoring explanation](https://www.semrush.com/kb/114-total-score) informed the overview/category/priority/detail pattern. Errors have more impact than warnings; notices are distinct in Semrush. Our independently defined weighted checks disclose their point values. SAMPAN has no validated industry benchmark or Top-10% comparison and displays none.

Further primary references: [Google technical eligibility](https://developers.google.com/search/docs/essentials/technical), [robots handling](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec), [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features). Google does not require special AI files or schema for its AI search features.

## Run and use

```sh
.venv/bin/python -m uvicorn sampan.scoring_app:create_scoring_app --factory --host 127.0.0.1 --port 8001
```

Open http://127.0.0.1:8001/. Live URL mode requires collection authorization and terms review. Saved HTML mode requires permission to analyze the file; select HTML and label it with the original public HTTPS URL. The original downloaded VX Real pages and prepared handoff pages can be compared this way before deployment. Download report exports check data/evidence to a JSON file on user request; no automatic server persistence or contact collection. Files may include the audited site's public excerpts, so review before sharing. This is a localhost tool, not a published service.

## Verification

See docs/10-PROGRESS.md for executed test counts and browser results. No live-site scan, deployment, public publication or T001 completion follows from this scoring update. Next: review subjective checks against an owner-approved page set before adding semantic/LLM assessment or broader crawling.
