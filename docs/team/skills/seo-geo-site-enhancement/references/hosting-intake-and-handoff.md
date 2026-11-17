# SAMPAN.AI hosting intake and handoff

Copy per release and share with the publisher. Mark irrelevant checks N/A. Keep credentials in the client's approved access system.

## Intake

- **Client / release / date** —
- **Production URL and preferred HTTPS hostname** —
- **Other hostnames / preview URL** —
- **CMS or hosting platform / DNS provider / CDN or firewall** —
- **Source revision or package / deployment instructions** —
- **Client approver / publisher / DNS or CDN owner** —
- **Access or dependency** — Confirm required access or name the client publisher who has it.
- **Approved scope / release window / approval reference** —

## Changes for the publisher

Use one row per change. Link to the release package for longer configuration.

| Change ID | Layer and exact location | Current → approved value or rule | Affected URLs | Publisher | Test URL and expected result | Result |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | Pending |

## Release and acceptance

- [ ] **Rollback ready.** Record the previous release or rule, how to restore it, and who can restore it. Note any dependencies on DNS, certificates, or cache.
- [ ] **Preview checked.** Review changed URLs and preserve relevant forms, checkout, auth, analytics consent, and existing routes. Note checks deferred to production.
- [ ] **Host behavior checked.** Confirm HTTPS and the preferred hostname. For redirects, test HTTP and HTTPS aliases, a real path and query string, expected status and destination, and the final response. Check relevant CDN or firewall behavior if changed.
- [ ] **Search files and signals checked.** Where affected, verify live canonicals and indexing headers, publicly reachable robots.txt and sitemap, and that intended public pages return the expected status. Verify changed content or structured data on the live revision.
- [ ] **Release recorded.** Add publisher, time and deployed version or rule ID. Mark each change Pass, Fail, or N/A with dated evidence. On a failed critical check, use the agreed rollback and retest.

**Evidence location / rollback trigger and owner / outstanding items** —

**Search Console handoff, if in scope** — Record the property and owner or export contact. Track indexing in the client record.
