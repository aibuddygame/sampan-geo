# Decisions, open questions and launch gates

## Confirmed decisions (26 November 2026)

- Product brand: **SAMPAN.ai**; development/delivery company: VX Real Ltd.
- Flagship product name: **AI Corporate Ambassador / 企業專屬 AI 代言人**.
- Marketing tagline: **Your Brand. Your Knowledge. Your Voice.**
- First customer pitch focuses on visible digital human + approved corporate knowledge, not generic agent orchestration.
- Customer can manage training knowledge, behaviour presets, testing/publishing and usage; custom face/voice designed in initial onboarding, limited approved self-service variants.
- Same avatar identity should eventually support branded video production; Mplifier is short-video automation workstream.
- Six enterprise solutions remain in the precise order documented in this folder.
- Build own SAMPAN technology/infrastructure; D-ID is a benchmark, not a backend.
- Hosting candidates AWS/Alibaba Cloud; LLM providers Qwen/Kimi, not yet selected.
- Original marketing-site mockup first; no real deployment, performance claims or public customer data.

## P0 decisions before mockup/first code PR

| ID | Question / decision | Working default |
|---|---|---|
| M-Q01 | Are we replacing public sampan.ai landing page immediately? | No, standalone mockup only |
| M-Q02 | Which frontend framework does current repo justify? | Inspect; choose smallest isolated fit |
| M-Q03 | Do we have licensed original avatar artwork? | Use original placeholder/illustration until supplied |
| M-Q04 | What is the approved company contact? | barry.lau@vxreal.com |
| M-Q05 | Which CTA can work without backend? | Mailto plus clearly labeled demo |
| M-Q06 | Are live AI/video demos ready? | No; simulated and marked |
| M-Q07 | Who reviews Traditional Chinese and legal copy? | Owner to assign |

## P1 decisions for real platform

| ID | Question |
|---|---|
| P-Q01 | 2D/neural/3D avatar engine? Live vs offline rendering reuse? Rights/licensing and consent? |
| P-Q02 | Cantonese ASR/TTS support, code-switch quality and streaming latency? |
| P-Q03 | Qwen/Kimi model quality, inference region, retention and enterprise contract? |
| P-Q04 | AWS/Alibaba Hong Kong GPU capacity, cost and disaster recovery? |
| P-Q05 | Public Knowledge Hub source approval, tenant isolation, versioning and deletion? |
| P-Q06 | Isolated cross-origin iframe, session token scopes, WAF/rate limits, emergency disable? |
| P-Q07 | Product packages, GPU/video usage quotas, support hours and price/margin? |
| P-Q08 | Initial industry pilot (accounting firms, professional services, retail, agencies)? |
| P-Q09 | Video editor should generate script only, presenter scene or long-to-short edits first? |
| P-Q10 | Existing SEO/GEO scoring URL and API migration/redirect strategy? |

## Future release gates

**Prototype:** original bilingual site, working simulated admin interactions, no false live claims.  
**Technical feasibility:** benchmarked self-controlled avatar/voice stack with measured cost and consent.  
**Paid pilot:** vetted corporate knowledge, security boundary, support model and demonstrated use case.  
**Production:** penetration/security testing, approved data processing terms, recoverability, quotas and measured availability.

**Reference PRD:** https://docs.google.com/document/d/1FFkBK0q4qrQr0mq6TBTU4YHZeo_eQpJpJDVrCPnQI8c/edit
