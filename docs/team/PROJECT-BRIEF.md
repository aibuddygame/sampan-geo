# SAMPAN.ai — project direction and service model

Updated 18 November 2026. This brief sets the commercial and technical direction; proposed capabilities are distinguished from the prototypes available today.

## Purpose

SAMPAN.ai will help SMEs improve how customers discover, understand and evaluate their businesses through traditional search (SEO), AI-generated answers (GEO) and answer engines (AEO). The business objective is relevant customer attention and qualified enquiries. We should define the platforms and questions we measure rather than treat these overlapping terms as separate guaranteed outcomes.

Semrush is a product reference. Our proposed differentiation is to combine practical website improvements with approved business knowledge and, where needed, PrivateKB-supported private knowledge handling. We want a repeatable service that turns evidence into useful changes and measures what happens afterwards.

Use **ESGtrace.net as the main service-development pilot** and **VXReal.com as the existing reference and comparison site**. The team has flexibility to investigate the details, challenge assumptions and propose the simplest useful implementation.

## Start by serving clients directly

**Our initial offering will be a directly delivered managed service. We do not need a self-service SaaS platform to start.** The software will support our team in assessing websites, organizing evidence, preparing improvements and reporting results.

Early engagements should help us understand what clients are really looking for: more qualified enquiries, clearer product information, accurate AI answers, lower content-maintenance effort, or help implementing changes. Interview clients and observe the work rather than assume that they want a dashboard or a particular score.

Offer a clearly scoped first improvement engagement, followed by ongoing review where it provides value. Track delivery time, costs, access requirements and customer feedback. Build self-service features later only when repeated client needs show what can be standardized and what customers can use independently. A recurring managed service does not require a self-service platform.

## Role of the free scoring tool

The free checker is our introduction to prospective clients. A business enters its URL and receives understandable findings, relevant topic suggestions and a few evidence-backed next actions. Provide useful results without artificially lowering scores or implying a ranking probability.

The proposed journey is **free assessment → confirm business priorities → paid improvement sprint → ongoing measurement and optimization**. The paid value is our investigation, implementation and accountable follow-up. Initially, reports and consultations can be delivered directly; a customer portal is optional future work.

## PrivateKB as a proposed technical differentiator

[PrivateKB](https://github.com/VXRealLimited/private_kb) provides document-payload encryption and vector transformations intended to support private retrieval. We propose evaluating it as an optional component for clients who need to work with confidential internal documents. Its intended contribution is controlled private knowledge handling; it does not directly improve search rankings or make encrypted information discoverable by public AI systems.

Maintain two distinct knowledge layers:

| Layer | Contents | Use |
| --- | --- | --- |
| Private client knowledge | Authorized internal manuals, processes, technical documents and confidential evidence | Internal analysis and permitted AI assistance |
| Approved public knowledge | Reviewed product facts, customer answers, limitations, cases and supporting evidence | Website pages, knowledge centres and appropriate structured data |

AI can retrieve permitted information to identify unanswered customer questions, propose explanations and flag contradictions. A reviewer approves the specific facts and wording before publication. Record sources, ownership, confidentiality, approval status and revision history. Generated drafts must not expose confidential facts, excerpts or retrieval metadata.

The same approved knowledge may later support an optional on-site assistant. Important public answers should still be available on ordinary website pages. A chatbot or an encrypted database alone does not establish SEO/GEO/AEO improvement.

PrivateKB is a small library, not an integrated SAMPAN feature or complete production knowledge service. Before client deployment, verify installation, realistic retrieval, client isolation, key storage/rotation/recovery and the security threat model. Decide where embedding and answer generation run: plaintext sent to an external AI provider remains a separate disclosure even if stored documents are encrypted. Do not market unvalidated zero-trust or zero-disclosure guarantees.

## Repeatable service workflow

1. Understand the client's audience, offering, target markets and business goals.
2. Establish available website, Google and AI-answer baselines with explicit permissions and measurement limits.
3. Assemble a small approved knowledge record; use PrivateKB only where private retrieval adds justified value.
4. Prioritize a few useful changes based on customer questions and source evidence.
5. Prepare and review content and technical changes; publish through the client's existing workflow after approval.
6. Measure comparable observations, review accuracy and decide whether further changes are justified.
7. Record results, effort and lessons for the next client.

Continuous improvement means reviewing evidence regularly. It does not require automatic daily rewriting or weekly releases when no useful change is warranted.

## Measurement and client value

Keep **readiness**, **observed visibility** and **business outcomes** separate. Website checks show what was verified and what remains unresolved. Search Console provides query/page performance when connected; GA4 can support traffic and enquiry measurement. A fixed AI-answer benchmark records mentions, citations and factual accuracy for named platforms and settings.

Use dated baselines, stable query/question sets and a release record. An improved score is not proof of higher rankings, and a one-off AI answer is not stable visibility. Evaluate the service by credible outcomes, client usefulness and delivery economics.

## Relationship with VX Real

SAMPAN is the visibility and optimization service. When an engagement reveals a genuine need for private assistants, document processing, workflow automation, system integration or production AI engineering, we can propose a separately scoped VX Real engagement. The knowledge work may provide a foundation, subject to the client's permission and access controls.

Clients should be able to benefit from SAMPAN without buying broader AI transformation. Introduce VX Real when it addresses an identified business problem, with separate deliverables, costs and success measures.

## Current capability and planned work

| Area | Status |
| --- | --- |
| Python local checker | Existing readiness prototype with separate SEO/GEO scores, bounded topic discovery, optional Kimi and local pilot history |
| Additional web prototype | Team-contributed Next.js/TypeScript auditor and local-model recommendation interface under [web](../../web/README.md); not runtime-validated in this documentation update |
| Knowledge governance and PrivateKB integration | Proposed; requires implementation and validation |
| Google reporting | Existing Python table uses private legacy-pilot snapshots; client-specific routing/access remains work |
| Actual AI mentions/citations tracking | Planned; measurement procedure and implementation plan supplied |
| Direct client service | Initial delivery model to validate through pilots |
| Self-service SaaS | Deferred until client needs and repeatable workflows justify it |

The prototypes have different scoring methods; do not compare or combine their numbers as though they use one rubric. No public SAMPAN deployment is established by this brief.

## First pilot acceptance

For ESGtrace, demonstrate one complete cycle using a small set of authorized, initially non-sensitive material: source document → evidence-backed draft → approval → website update → measured review. Evaluate PrivateKB separately before adding sensitive documents.

Return a short findings summary, recommended first changes, measurement plan and record of delivery effort. Interview the client about what was useful and what they would pay for. The pilot should help us choose both the next implementation task and the service customers actually need.
