# L024 — Marketing website, local reporting and managed-pilot preparation

Prepared 2026-11-02. This is a local reviewable prototype, not a published sampan.ai release or a production client account system. It is separate from canonical T001 inventory acceptance.

## Objective and acceptance

Combine the existing scoring experiment with a service introduction and useful pilot reporting. Input: permitted scans of VX Real and marksix.gold; output: local marketing/audit page, operator workspace, durable dated readiness reports and a concrete managed-service preparation plan. Reuse FastAPI and buildless HTML/JS; no stack replacement, new dependency, database, OAuth, billing or hosting account. Follow Sites local-only workflow; repository publication boundaries remain.

Acceptance verified: marketing CTAs reach the current scanner/workspace; explicit pilot selection saves a live report; a stored report reopens without recollecting a site and survives a fresh app instance; wrong pilot/domain and unauthorized requests cannot save; one-off and saved-HTML checks stay transient; saved records expose actual date, capture mode and versions; unknown outcome connections remain visibly pending. New desktop/mobile browser checks passed. New local baselines saved for both pilots.

## What is implemented

- `/`: service proposition, improvement workflow, existing working URL/saved-HTML audit, evidence report, pilot save selection, service explanation and expectations FAQ. English interface retains English/Traditional Chinese/mixed source support. No invented testimonials, traffic gains or current Google/AI visibility.
- `/pilots`: a private-to-this-computer operator workspace for two fixed pilots; latest readiness, scored URL/date/source/rubric/topic version, previous reports when present, links to saved reports and new checks, and an onboarding checklist. This is the first reporting layer; search performance, managed action plans and release history are future additions.
- `/pilot-api/reports` and `/{id}`: local report listing/retrieval, under existing loopback/TrustedHost/no-store/CSP controls. Source URLs/excerpts are data and rendered with textContent. IDs are generated; they are not production authentication.
- Saving is opt-in through a live scan with a selected pilot. Existing authorization/nonce and collection budgets remain. Host must match that pilot before collection; saved HTML cannot be persisted through this path. Storage errors leave the completed audit available for download.
- `private/pilot-reports/<pilot>/<id>.json`: ignored local append-only report files, at most ten per pilot, two MB each; exclusive creation, restrictive creation modes and no automatic deletion. Invalid IDs, oversized reports and symlink record paths are rejected; unreadable records are flagged in the index. This intentionally small local store needs a reviewed retention/archive policy before scaled operation.
- Home `?pilot=...#audit` starts a preselected check. Home `?report=...#audit` reopens an existing report without rescanning. Per-page audit selection and current topic scoring remain unchanged.

## Other elements for sampan.ai

| Element | Local prototype / next delivery |
| --- | --- |
| Clear service promise and limits | Implemented service introduction and FAQ; no ranking/citation promises |
| Working initial check | Existing scanner integrated; manual rescans, bounded collection |
| Client reporting | Local operator workspace and saved readiness reports implemented; online client access pending |
| Reporting feedback | Search Console connection or dated export import next; fixed AI benchmark remains separate |
| Improvement plan | Add owner-reviewed prioritized actions, target page/query, evidence, acceptance and status |
| Release/change log | Record approved revisions, publish actor/date, validation and rollback; publishing integration pending |
| Regional/language scope | Agree audience and real service availability, then review English/Traditional Chinese targets; source-language handling is not market calibration |
| Contact/onboarding | Before public launch, add a working enquiry/onboarding route, named service contact and response responsibilities |
| Packages/pricing | Define scope, cadence, limits, included edits and support after learning from the pilots; no invented prices |
| Privacy, terms and data controls | Explain site scans, imported search data, retention, consent, disconnect/deletion and client responsibilities before external use |
| Access and operations | Authentication, per-client authorization/isolation, secure token storage, spend/rate controls, monitoring and backups required before hosting reporting externally |

Public launch must not simply expose this localhost server. The current workspace deliberately has no online account boundary. Inspect the intended production architecture and existing deployment contracts before publication; do not connect hosting, domains, Search Console or payment services as part of this prototype.

## Managed-service pilot preparation

| Preparation | VX Real | marksix.gold | Exit condition |
| --- | --- | --- | --- |
| Owner and scope | Prior collection authorized; confirm operating owner and service agreement | Prior collection authorized; confirm operating owner and service agreement | Named approver, allowed domains/data, deliverables, reporting cadence and responsibilities recorded |
| Business objective | Proposed: qualified enquiries for agreed current AI services | Proposed: useful tool/guide engagement; define a non-financial event without prediction promises | Owner agrees one primary outcome; actual tracking verified |
| Audience | Previously owner-confirmed HK/SG/SE Asia, English service; agree priority pilot market | Site currently targets HK adults with Traditional Chinese/English; confirm pilot audience | Country/language/device and priority page fixed |
| Readiness baseline | Saved current 9.3 SEO / 6.3 GEO, eight-page sample | Saved current rendered 8.7 / 4.8, three-page sample | Dated report/source/rubric/capture documented; not treated as visibility baseline |
| Google feedback | Not connected | Not connected | Client retains verified ownership; authorize appropriate agency/read-only API access or provide dated exports |
| Analytics/conversion | Confirm deployed accepted-enquiry tracking and actual receipt; local tag preparation is not delivery proof | Confirm deployed analytics and the owner-approved engagement event | Test receipts/events with explicit authorization; retain attribution limits |
| Search/AI targets | Review nine non-brand service queries and ten customer questions | Review nine contextual feature/information queries and ten questions; exclude unsupported prediction/affiliation | Owner-approved target/page/intent/market list; demand source or unknown; repeatable observation method |
| First improvement brief | Candidate: one service explanation plus relevant approved case, suitable inputs/deliverables/limits | Candidate: crawlable tool introduction/guide clarity and consistent identity/limitations | Source-supported proposed change, owner review and concrete acceptance checks |
| Publishing | Inspect actual hosting, source, backend/form and access | Inspect actual app/release/hosting and interaction/analytics behavior | Approved preview/release route, publisher, backup and rollback; no assumption of weekly manual ZIPs |
| Review cadence | Proposed weekly findings review; publish only justified changes | Same | Daily monitoring only after an explicit bounded automation agreement; no schedule created here |
| Evaluation | Comparable query/page/country/device periods; separate paid/organic enquiries | Comparable fixed query/question sets and engagement periods | Sufficient observations, unchanged methodology, unknowns/confounders stated; no guaranteed improvement deadline |

Suggested start: complete ownership/access and target sheets, obtain search data, approve one change brief per pilot, then run a measured cycle. The preparation checklist is not evidence that contracts, targets or permissions for future publication have already been approved.

## Exact verification

`SAMPAN_TEST_RENDERER=1 .venv/bin/python -m pytest -q --tb=short` — **323 passed** in 4.57 seconds, one existing Starlette TestClient warning. Ten new storage/API/security/flow cases include fresh-app persistence, transient modes, nonce/authorization, host mismatch before fetch, local-only access, safe failure, retention/size limits, symlink rejection and corrupt-record reporting. Actual isolated Chromium checks included with permitted escalation. `node --check /private/tmp/scoring_ui.html0.js`, `node --check /private/tmp/pilot_ui.html0.js`, duplicate-ID/single-H1 checks and `git diff --check` passed.

`.venv/bin/python /private/tmp/save_pilot_baselines.py` called the existing local `/scan` endpoint with explicit pilot selection, related-page review, isolated rendering and Kimi off, storing actual reports and verifying both indexes. No paid calls, Search Console or client-site writes. Private baseline copies under `private/reports/managed-pilot-baseline-2026-11-02/`; live operational copies under `private/pilot-reports/`.

Actual IAB checks: homepage CTA→workspace, real pilot cards, View saved report→VX Real report 9.3/6.3 with no new site scan, new-check preselection of correct pilot/URL, saved-HTML saving disabled, homepage/workspace at 390×844 with document width equal to viewport; temporary viewport reset. Screenshots retained privately. This proves local behavior, not cloud hosting or public user isolation. No production deployment, domain/Google account configuration, billing, Git commit/push or T001 advancement.
