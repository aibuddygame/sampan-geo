# Visual design and interaction specification

## Reference boundary

D-ID enterprise site is an **inspiration for enterprise page hierarchy** (hero → benefits → applications → capability explanations → demos → trust → CTA). Build an **original SAMPAN design**, not a clone. Do not copy D-ID's orange/black palette, proprietary avatar photos, videos, animations, exact layouts, phrases, logos or quoted statistics. Do not hotlink their assets.

## Visual language

- **Style:** credible premium Hong Kong B2B, clear and warm; approachable to SME owners rather than a dense AI developer site.
- **Palette proposal:** deep midnight navy `#0B1730`, pearl white `#F7FAFC`, muted teal `#21B6AD`, ink `#12233B`, subtle lilac highlight `#B8A7F6`. Design proposal, not approved branding.
- **Typography:** one legible bilingual system family (e.g. Noto Sans TC/system fallback); generous spacing and high contrast.
- **Graphics:** stylised original/fully licensed digital human or illustrated representative; accessible UI mock frames; diagrams of knowledge→avatar. A static illustration/placeholder is acceptable; never imply it is a live model.
- **Photography/video:** only owned/licensed/generated-original assets with recorded rights. Consent for real person's likeness and voice.
- **Responsive:** 1440 / 1024 / 390 / 320 widths. Simple mobile menu, stacked cards, visible CTA, no horizontal overflow.
- **Accessibility:** semantic landmarks, single H1 per page, focus styles, keyboard nav, reduced-motion support, text alternatives, contrast checks.

## Page wireframes (text-first)

### Home
```
[ SAMPAN Logo ] [ Ambassador | Solutions | Knowledge | Video | About ] [ 繁/EN ] [ Book Demo ]
[ HERO: bilingual headline / text / 2 CTAs ]     [ Original digital human preview frame ]
[ YOUR BRAND       YOUR KNOWLEDGE       YOUR VOICE ]
[ HOW IT WORKS: Create  →  Train  →  Deploy ]
[ WEB RECEPTIONIST | SPOKESPERSON | SALES EXPLAINER | TRAINING ]
[ KNOWLEDGE HUB: training management mock panel + explanation ]
[ SAME AVATAR → SHORT VIDEOS: video template mock panel ]
[ SIX SOLUTIONS: 2 featured + 4 supporting cards ]
[ TRUST: governance and controls, no certifications claimed ]
[ CTA ] [ accurate footer ]
```

### Ambassador
```
[ VALUE HERO ] [ visual preview and "simulated" label ]
[ Avatar appearance | Voice & languages | Personality ]
[ Branded web embed illustration ] [ Knowledge-grounded Q&A ]
[ Customer ownership and consent ] [ Demo CTA ]
```

### Solutions
```
[ 6 solution cards in exact agreed order ]
[ #1 Ambassador ][ #2 Knowledge Hub ]
[ #3 SEO/GEO ][ #4 Commerce ][ #5 Video ][ #6 AI Transformation ]
[ Each: what customer gets, problem solved, demo/future status, CTA ]
```

### Admin portal preview
```
[ SIDE NAV ] [ Top: AI Corporate Ambassador | Tenant Demo | Simulated ]
[ Dashboard summary: sessions / top questions / knowledge update pending ]
[ My Avatar: preview + approved voice/outfit selectors ]
[ Knowledge: FAQ table / add draft / approve / publish simulation ]
[ Behaviour: greeting, tone, fallback, handover ]
[ Video Studio: topic input → generated illustrative script → review/export script ]
[ Analytics: static sample charts labelled Sample Data ]
[ Deploy: example embed illustration; no live credentials ]
```

## Interaction state contract

Every interactive control must have real local UI behavior or a deliberate disabled state.
- Language toggle changes the visible translated copy and maintains selection during navigation.
- Navigation and CTAs go to implemented routes/sections.
- Mock conversation chooses one of the scripted answers and shows "Simulated response / 模擬回覆".
- Knowledge admin can add/edit **local example** records, set draft/published in memory, reset sample data and preview scripted results. Do not persist personal information or claim save to server.
- Video Studio accepts a brief and outputs a sample **script only**, not a fake rendered video. Copy script action may work; "Render" is disabled/coming soon.
- Request demo CTA goes to a working contact channel (prefer verified `mailto:barry.lau@vxreal.com` for static demo); no inert submit button or fake email-sent confirmation.
- If displaying metrics, clearly label **Illustrative / 示例數據**, no fabricated paying customers or conversion outcomes.
- Never add a real mic/recording control until input, consent and processing actually work.

## Quality gates

- Verify desktop and mobile screenshots; nav menu/toggle/CTA work.
- Traditional Chinese rendered properly, no broken fallback fonts, no mixed simplified Chinese unintentionally.
- Page copy is original, not D-ID text copied/paraphrased too closely.
- All implemented claims accurate and simulated functions visibly labelled.
- No secret, real client information, login credentials, live provider tokens or private datasets in frontend.
- No external tracking pixels by default; review analytics consent before future deployment.
