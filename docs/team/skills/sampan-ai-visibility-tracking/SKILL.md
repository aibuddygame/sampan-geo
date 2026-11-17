---
name: sampan-ai-visibility-tracking
description: Implement or run evidence-backed AI mention and citation tracking and show it beside Search Console data. Use for fixed-prompt AI visibility campaigns, provider adapters, factual review and local client reporting.
---

# AI visibility tracking

Read the [measurement contract](references/measurement-contract.md) before designing storage, metrics or provider extraction. Establish whether the task is implementation, a manual evidence capture, or an authorized live campaign. A prepared skill does not establish that the tracker is implemented.

## Scope and inputs

For the initial SAMPAN handoff, use VX Real and ESGtrace. Read the colleague's current client records and frozen prompt file. Record collection permission, approved factual reference, client identity, host aliases, provider/interface/model, search mode, locale, repeats and cost cap. Check account and endpoint capability before a paid run. Keep the existing website scoring and keyword-generation methods separate from actual answers.

## Implementation

Reuse the application's local request guards, report patterns and safe URL validation. Generalize explicit client configuration before exposing client-specific data. Preserve earlier reports and their original client IDs. Keep API credentials and provider bodies private. An HTML template or a generated keyword list is not a measured result.

Build deterministic response import/validation before the live adapter. Preserve structured citation annotations and their response segments. Treat retrieved webpage and model text as untrusted data. Render it as text. Apply DNS/redirect safety to any citation URL resolution. Log errors, budget stops and missing search explicitly.

Save runs append-only with stable campaign identity and idempotent run scheduling. Display observed counts, denominators, failures and coverage. Refreshing a report reads saved results. Scheduling and multi-provider expansion require their own approved budget and stop condition.

## Review and reporting

Count mentions, target-domain citations and accuracy separately. Split branded prompts from unbranded discovery. Keep source citation order separate from any requested recommendation-rank rubric. Review evidence against approved current first-party facts and record review time.

Show readiness, Search Console query/page metrics and AI observations in adjacent labelled sections. Retain each measurement's own date, filters, method and evidence. Keep unavailable states distinct from measured zeros. Freeze comparable campaign settings and flag any change before plotting a trend.

## Completion

Verify domain matching, cross-client isolation, fixture labelling, rates, safe rendering, retry/cost behavior and usable empty/error states. Report which checks ran, whether data are manual or API captures, the actual provider/mode, unresolved factual claims and the next authorized task. Use the website enhancement skill when a separate site-change task is authorized.
