# AI Corporate Ambassador customer portal and demo

## Role boundaries

**VX Real initial implementation:** consented original avatar identity, approved outfits/brand assets, voice configuration, brand interface, baseline FAQs, deployment and security review.

**Customer day-to-day:** approve corporate knowledge, maintain FAQ/products/policies, manage greeting/tone/language from safe presets, preview and publish changes, monitor unresolved topics, manage enquiries, enable/disable widget and request video generation.

**VX Real platform administration:** tenant provisioning, domain verification, infrastructure quotas, LLM and avatar model settings, security policy, billing/alerts and incidents. Never expose these privileged operations to untrusted website visitors.

## Portal IA and release priorities

| Priority | Portal area | Mockup functionality | Planned actual backend |
|---|---|---|---|
| P0 | Dashboard | simulated usage/status/knowledge items | usage metrics and tenant status |
| P0 | My Ambassador | preview brand/avatar, choose approved look/voice | rights-backed asset/version registry |
| P0 | Knowledge & Training | edit example FAQ, draft→publish→rollback in memory | validated ingestion, approvals and versioning |
| P0 | Behaviour | change sample greeting/tone/handover | bounded role/response configuration |
| P0 | Test & Deploy | scripted test questions; display sample embed | secure iframe/token/domain checks |
| P0 | Security & Users | display illustrative roles/read-only settings | tenant RBAC, MFA, auditing |
| P1 | Conversations & Leads | sample redacted questions and gaps | consented retention, lead follow-up |
| P1 | AI Video Studio | input topic, choose format, generate sample script | rendering queue, approval, credits, Mplifier |
| P2 | Campaigns | plan promotion, mock approval | approval/expiry and content scheduling |
| P2 | SEO/GEO | link existing checker or sample card | approved audits, reports and monitoring |
| P2 | Channels | show WhatsApp/e-commerce diagrams | sandbox and verified APIs |

## Admin demo user journey (5 minutes)

1. **Visit home:** see original branded ambassador and key promise; click "Experience Demo".
2. **Select a scripted visitor question:** the simulated ambassador responds with an approved sample fact and clear demonstration label.
3. **Open Knowledge & Training:** modify a test FAQ, preview the new answer, approve/publish the sample data, ask question again and observe it change.
4. **Open Behaviour:** choose Cantonese/English sample greeting and professional/warm tone, see updated mock response.
5. **Open Video Studio:** enter a product-launch topic, select 30-second vertical format, see an illustrative script/storyboard, copy text. Do not fake actual video generation.
6. **View Dashboard:** sample metrics and knowledge-gap card; view admin/production safety disclaimer.
7. **Book a demo:** verified mailto/link or working contact route.

## Knowledge model for later production

```json
{
  "tenant_id": "sample-tenant",
  "knowledge_id": "faq-001",
  "type": "faq",
  "language": "zh-Hant-HK",
  "question": "你哋有咩服務？",
  "approved_answer": "示例答案（請按企業資料核實）",
  "status": "draft",
  "source": "owner-verified",
  "effective_at": null,
  "expires_at": null,
  "approved_by": null,
  "revision": 1,
  "visibility": "public"
}
```

## Security boundaries for mockup and future product

- Mockup: no backend secrets, upload, audio capture, persistent client data, actual payments, crawler or external AI endpoints.
- Production: public digital human must be a separate untrusted website widget, not site admin; cross-origin isolated iframe, limited permissions, independent failure; short-lived scoped tokens; tenant isolation, approved public knowledge only, output sanitisation; rate/spend limits; live commerce via audited deterministic tools only.
- All avatar and voice assets must have rights and documented consent. No impersonation, fake security badges or invented customer outcomes.

## Demo acceptance

User can complete flows 1–7 without broken controls or confusing mock/simulation with live AI. Team can explain how avatar and knowledge constitute the core product; video, GEO and commerce are natural additions, not dependencies for initial launch.
