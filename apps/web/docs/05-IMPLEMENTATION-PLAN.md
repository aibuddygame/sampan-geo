# Mockup execution plan and technical guardrails

**Goal:** Prepare a reviewable, original SAMPAN.ai enterprise marketing-site mockup quickly without altering the current SEO/GEO scoring application's behavior.

## Engineering decision before editing

Inspect repository tree and framework first. The existing prototype is FastAPI/buildless HTML; do not assume a Next.js app exists. Choose the lowest-risk isolated location for the mockup, e.g. `website-mockup/` or `site/`, with its own clear dev command. Avoid introducing a new production dependency or replacing the current service at `/` without a reviewed migration plan.

If build tooling is already present, reuse it. If none is present, a simple standalone static React/Vite or HTML/CSS/JS implementation is acceptable for this mockup. Do not build authentication, a database, live APIs or production infrastructure yet.

## Sprint tonight (single execution sequence)

### M01 — Repo inspection
- Read README.md, AGENTS.md, CHATGPT_PROJECT_INSTRUCTIONS.md, current relevant site/scoring source files and this folder.
- Confirm `git status`, existing routes, assets, dependencies and test setup.
- Choose isolated mockup path and record commands in new README. Preserve existing changes.
- Exit: scope and build approach documented before creating files.

### M02 — Visual foundation
- Responsive original site shell, bilingual header/nav and footer, design tokens, accessible components.
- Set page title, description, original brand styling and contact CTA.
- Exit: desktop/mobile layouts work; all navigation routes resolve.

### M03 — Home and flagship
- Implement hero, custom avatar preview placeholder, Your Brand/Knowledge/Voice cards, Create/Train/Deploy, use cases, CTA.
- Use only self-created/licensed visuals. Add simulated demonstration labeling.
- Exit: user understands flagship in 15 seconds; no unverified claims.

### M04 — Six solutions and Knowledge/Video pages
- Solutions in exact agreed order; dedicate special detail page to Knowledge Hub and Video Studio.
- Include truthful status labeling for planned features.
- Exit: no inconsistencies in product naming; SEO/GEO remains a preserved product workstream.

### M05 — Admin portal simulation
- Create dashboard, avatar settings, knowledge editor, behaviour tester and video script/storyboard concept.
- Store mock data only in local in-memory state. No upload or API.
- Exit: edit an FAQ, preview/publish it locally, see sample answer change; render control appropriately disabled.

### M06 — Quality / handoff
- Run relevant existing tests and new frontend checks; inspect desktop/mobile screenshots, navigation, accessibility, copy.
- Verify no route regression to SEO/GEO app, no D-ID assets, no claims of live LLM or actual certifications.
- Document actual commands/results and remaining issues; do not claim deployment.

## Technical boundaries

- Future service: SAMPAN-owned, avatar-first, separate public widget origin, approved public RAG, Qwen/Kimi API evaluation; AWS/Alibaba Cloud candidate.
- Current mockup: pure front end with local sample data; no external model calls or credentials.
- Public repo: never commit business secrets, client data, private avatar likenesses or actual consent documents.
- Later real product gates: threat model, rights review, cloud/GPU cost, Cantonese speech benchmarks, isolated iframe and per-tenant quotas.

## Test checklist

- [ ] Clean documented local run of mockup
- [ ] Existing scoring app/tests unchanged
- [ ] Traditional Chinese copy reviewed; EN toggle works
- [ ] Navbar, CTAs and all planned public routes work
- [ ] Admin FAQ draft/preview/publish simulation works
- [ ] Video script preview works, rendering button disabled
- [ ] 390px mobile and 1440px desktop no overflow
- [ ] All metrics and non-live features marked sample/planned
- [ ] No external copyrighted D-ID assets/text
- [ ] No secrets/private data in commits
- [ ] No production deploy, DNS, or live transactions

## Post-mockup decision gates

1. Team chooses product UI and name, confirms original avatar artwork.
2. Technical benchmark selects avatar approach and Cantonese ASR/TTS; Qwen vs Kimi; AWS vs Alibaba Cloud.
3. Define MVP front-end widget/admin APIs and tenant security before writing production code.
4. Get first partner demos and pricing feedback; confirm funding for complex rendering R&D.
5. Plan migration from SEO/GEO-first site to new corporate site without losing historical tools/URLs; redirect strategy and crawlability review.
