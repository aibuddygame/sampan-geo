# T001/P01-3 — Bounded source inventory

## Run contract
Objective: discover at most 10 permitted VX Real HTML pages and record auditable source hashes. Input: one fresh `SafeIntake` run with a genuine permission/terms record and the seed `https://vxreal.com/`. Output: an ignored private run directory containing `manifest.json` and hash-addressed `pages/*.html` snapshots. This does not extract company facts or publish content.

Run from the repository root after dependency installation and permission review:

```sh
.venv/bin/python -m sampan.discovery --permission private/vxreal-collection-permission-2026-10-16.json
```

The permission file is local and intentionally absent from Git. It follows `CollectionPermission`: real reviewer, timezone-aware review date, permission/terms reference, `collection_allowed: true`, `terms_reviewed: true`. Never substitute a synthetic fixture or guess approval. For this session, the user explicitly supplied the owner/reviewer confirmation; it is recorded privately.

CLI output contains only manifest path, status and source count. Blocked runs exit 2. Other statuses distinguish exhausted candidates, page budget and candidate budget; none means complete website coverage. Permission/configuration errors are sanitized and exit 2. Cancellation/processing failure leaves a partial manifest when storage remains writable. Inspect status before using any sources.

## Discovery rules
- Reuse one bounded intake run; no retries or new runs to work around blocks. Every fetch uses the P01-2 safety, permission and robots boundary.
- Follow HTML anchors only, breadth first through depth 2. Within a depth, prioritize URL paths containing about/company, services/solutions, products, projects/cases/portfolio, and contact/team; then stable URL order. These are selection heuristics, not claims about the business.
- Normalize/deduplicate URLs, including final redirect targets. Do not follow scripts, forms, canonical hints or HTML base tags. No sitemap discovery, JavaScript rendering or guessing unlinked URLs in this unit.
- Exclude external/non-HTTPS URLs, query-bearing anchor targets, downloads, nofollow links, non-HTML suffixes and common account/admin/transaction/legal paths. Redirects still use the safe-intake origin/robots policy.
- Inspect at most 1,000 anchors per page; queue at most 100 known URLs. Preserve the 10 content-attempt, depth, byte, request and time budgets. A page/byte/time/HTTP/robots failure stops collection and records partial results.

## Evidence and storage
Each source records requested/final URL, parent discovery URL, depth, fetch timestamp, SHA-256 of exact body bytes, size and relative snapshot path. Identical content shares one snapshot and is marked `duplicate_content_of`; separate URL records remain separate. No canonical URL, published date or factual verification is inferred.

The manifest includes permission reference, effective limits, request audit records (timestamps/status/bytes/hash/outcome), counters and zero model calls/tokens/cost. Audit records added after the first live attempt include response content type. A received HTTP response may still fail the policy gate; request `received` does not mean source approval. Failed/incomplete streams have no complete-body hash.

Artifacts stay under ignored `private/inventories/<run-id>/`. New directories are mode 0700 and files mode 0600; symlinked private roots are rejected. Each run has a unique directory; snapshots use exclusive creation and manifest checkpoints use atomic replacement. No source bodies or permission records belong in Git. Checkpoints occur before requests, after each accepted page, and on normal/blocked/cancelled/failed termination. A crash or storage failure can leave `running`/partial state; never promote it to success automatically.

## Acceptance status on 2026-10-16
Implementation and synthetic tests are verified. One owner-authorized live run made one HTTP request to `/robots.txt`; it returned HTTP 200 with 9,972 body bytes, but failed the required `text/plain` content-type check. The initial audit record has its body hash and status but did not capture the exact Content-Type value. No content pages were requested, no snapshots of content pages exist, and no retry or policy bypass was attempted.

**P01-3 remains incomplete for live inventory.** Next action: owner review of the robots response/configuration so a valid policy can be accepted. No site configuration changes are authorized by this implementation. Proceed to real discovery and verify saved source hashes only after that blocker is resolved. P01-4 extraction has not started.

Reference for deterministic HTML parsing: [Beautiful Soup documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/).
