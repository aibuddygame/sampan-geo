# Measurement contract

Version proposal-ai-visibility-0.1, 13 November 2026. This describes the first implementation target. Revalidate provider interfaces and attribution requirements before implementation.

## Campaign identity

Use a stable campaign ID plus prompt-set version, prompt IDs/text/hash, provider, exact model/version, API or consumer-browser interface, requested and observed search mode, audience/language settings, target host aliases and repetition policy. Start a new series when these inputs materially change. Stating Hong Kong in a prompt records audience context; it does not prove the provider ran from Hong Kong.

Branded questions name the business and measure factual retrieval. Discovery questions describe the need without naming the target and measure whether it is surfaced. Report these groups separately. Brand aliases require owner-approved exact matching. An ambiguous name requires review.

## Retained evidence

Each run records run ID, campaign/client IDs, UTC start/end, prompt and settings, provider request ID when available, response status, full private answer reference/hash, search execution evidence, citation annotations and segments, observed mention/citation flags, reviewer status, usage and cost source. Retain raw provider output only under the agreed private retention/access policy. The dashboard uses a sanitized projection and safe evidence references.

A citation record includes original URL, normalized target hostname, cited title, source annotation/segment reference, classification as target/third party/unresolved and optional safely resolved final URL. Keep free-text links distinct from provider source citations. A pasted domain in the prompt or answer is not automatically a citation. If a manually captured browser answer has a source panel, retain the source-panel evidence and label the capture manual.

Domain checks parse URLs. Accept only the exact approved hostname and explicit aliases/subdomains. Reject lookalikes and suffix traps such as vxreal.com.attacker.test. Never count an external source that merely mentions the target as a target-domain citation. It can still supply a separate brand mention.

## Status and denominators

response_status is one of completed, provider_error, refused, budget_stopped, invalid_response or interrupted. search_status records confirmed, not_used or unknown. Keep expected, attempted, completed and measurement-eligible run counts visible. A response qualifies for citation rates only when its citation evidence can be assessed under the frozen interface contract. Failures and unknown search status stay outside that denominator and remain visible as coverage gaps.

- Mention rate equals eligible responses mentioning the target divided by eligible responses with assessable answer text.
- Citation rate equals eligible search responses citing the target domain divided by eligible search responses with assessable citation evidence.
- Cited pages counts distinct normalized target URLs; retain query parameters only when meaningful and safe.
- Citation count counts deduplicated cited URLs per response, using the same rule across dates.
- Accuracy is a reviewed result per material claim or answer. Use accurate, material_error, partially_verified or not_reviewed and keep unreviewed counts visible. A source link alone does not establish accuracy.

For zero eligible responses, report unavailable with counts. A successfully completed, assessable answer with no target mention/citation can supply an observed zero. Do not infer traffic, first-page probability, population-wide market share, model training or business uplift from these rates.

## Costs and retries

Freeze maximum prompts, attempts, time/output and spend before running. Start with ten draft prompts, one repetition each, one provider. Record token and search usage when returned. If exact billing is unknown, record unknown and apply an approved conservative operational cap before live use. Failed or interrupted requests may still cost money. Append attempts under the run identity and prevent concurrent duplicate execution. Any recurring schedule needs approved cadence, retention and stop conditions.

## Search Console companion

Select the verified property for the client explicitly. Store dates in Pacific reporting time, country, device scope, Web search type and final/preliminary state. Preserve direct totals separately from query/page rows, which can omit queries. Aggregate device positions using sum(position × impressions) / sum(impressions). Empty rows are unavailable rather than proof of zero traffic. Compare exact-page and sitewide metrics separately.

A topic can map to several Google queries and AI questions. Store those links explicitly. Never substitute a prompt-based visibility rate for the Google query's ranking position.

## Initial acceptance

Verify a synthetic response, a manually reviewed real response and one budgeted real API response when approved. Include unknown/missing grounding, redirects, lookalike domains, malformed markup, errors, zero denominators, duplicate attempts, cross-client IDs and changed campaign settings. Synthetic data is labelled and excluded from live trend metrics.

Official implementation references are the selected provider's current search-grounding documentation and Google's Search Analytics API. Current candidate references follow. [Gemini grounding](https://ai.google.dev/gemini-api/docs/google-search) · [Google Search Analytics](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
