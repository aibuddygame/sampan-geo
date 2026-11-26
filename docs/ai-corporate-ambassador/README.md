# SAMPAN.ai — AI Corporate Ambassador website mockup

**Status:** New mockup requirements, not deployed, implemented or approved for production. **Date:** 26 November 2026.

## Product and brand decision

- **Public brand:** **SAMPAN.ai**
- **Flagship product:** **AI Corporate Ambassador** / **企業專屬 AI 代言人**
- **Tagline:** **Your Brand. Your Knowledge. Your Voice.** / **您的品牌・您的知識・您的聲音**
- **Technology and delivery company:** VX Real Ltd. (identify accurately in footer/about).
- **Primary market and language:** Hong Kong businesses, Traditional Chinese first, English switch; showcase Cantonese capability as **in development/testing**, not proven.
- **Core value:** Give a company its own branded visual AI spokesperson, trained on approved business information, that can talk to website visitors and later generate reusable presenter videos.
- **Reference:** D-ID enterprise site (https://www.d-id.com/enterprise/) for **information architecture, interaction patterns and feature coverage**, not its copyright text, UI styling, images, logos, animations or proprietary code. Make original SAMPAN visual identity.
- **Ownership:** Build SAMPAN application, avatar/knowledge admin, frontend, infrastructure and integrations independently. No production dependency on D-ID. Model/provider decisions remain open (AWS/Alibaba Cloud, Qwen/Kimi, avatar and speech stack).

## Where the existing repo fits

This repository already contains an **experimental local SEO/GEO website checker**. Preserve its current FastAPI app, scoring behavior, docs, tests and repository history. The new AI Corporate Ambassador marketing site is a **distinct new workstream**; do not replace the scoring app, overwrite root instructions or assume the prototype is production-hosted. The SEO/GEO service becomes Solution 3 of six. The existing README's earlier SEO/GEO-first positioning remains historical until a separately reviewed product/site migration.

## First mockup scope (tonight)

Create a realistic, responsive, **static** marketing website suitable for live team review:
1. Home page with digital-human hero, original preview/demo **simulation**, value proposition and lead CTAs.
2. AI Corporate Ambassador solution page (avatar + approved knowledge).
3. Solutions overview with six solutions in fixed order.
4. Company-facing admin dashboard **UI-only concept** (avatar, knowledge, training, video studio, analytics).
5. Optional lightweight About/Contact and English-language switch if feasible.

All interactive actions must clearly work within a **mock/demo state** (navigation, tabs, mock knowledge editing, script preview) or be visibly disabled/marked "Coming soon." Do not imply live video generation, live LLM, signed-in clients or actual enterprise security certifications.

## Documents

1. [Product Requirements / scope](01-PRODUCT-BRIEF.md)
2. [Site IA and original bilingual copy](02-SITE-IA-AND-COPY.md)
3. [Visual design, wireframes and interaction spec](03-MOCKUP-DESIGN-SPEC.md)
4. [Admin portal and demo flow](04-ADMIN-AND-DEMO.md)
5. [Build plan, architecture boundaries and acceptance](05-IMPLEMENTATION-PLAN.md)
6. [Codex ready-to-run task prompt](06-CODEX-PROMPT.md)
7. [Questions, roadmap and decision log](07-DECISIONS.md)

**Full technical PRD:** [VX Real Google Doc](https://docs.google.com/document/d/1FFkBK0q4qrQr0mq6TBTU4YHZeo_eQpJpJDVrCPnQI8c/edit). This document is the comprehensive technical reference; this folder is a scoped website-mockup execution pack.

## Review gate

Share localhost screenshot or preview URL with team. Confirm Traditional Chinese copy, visual identity, simulated demo labeling, mobile layout, CTA destination, footer ownership, data policy and all six solutions. No live DNS change, deployment, API key, real uploaded documents or external AI usage without separate approval.
