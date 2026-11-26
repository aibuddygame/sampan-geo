# SAMPAN.ai corporate website starter

Isolated starter for AI Corporate Ambassador, prepared from `feat/ai-corporate-ambassador-site-spec` at `f6f14ce5cca2b716bc0dd0cab916c720e7680e80` on 26 November 2026. This is a starter landing page and delivery pack, not the completed multi-page mockup.

## Run locally

From repository root, with Python 3:

```sh
python3 -m http.server 30101 --bind 127.0.0.1 --directory apps/web/public
```

Open http://127.0.0.1:30101/. Stop with Control-C. No install, build, keys or external services required. Serve only `public/`, not the repository or docs directory. The port differs from the existing Next.js app's 30100 and Python scorer's 8004.

## Contents

- `public/index.html`: original static Traditional Chinese landing page, six ordered solutions, verified mailto CTA and clear prototype boundaries.
- `public/styles.css`: responsive navy/pearl/teal foundation, no remote fonts or media.
- `public/app.js`: Chinese/English toggle; no network calls or persistence.
- `docs/`: all nine source specification/handoff documents, retained with original filenames.
- `AGENTS.md`: instructions scoped to this new workstream.
- `PROGRESS.md`: verified status and next implementation unit.

The source documents remain at `docs/ai-corporate-ambassador/` at repository root for existing PR and ChatGPT links. The copies here are snapshots; see `docs/SOURCE-MAP.md` for provenance and how to refresh. Do not maintain divergent requirements.

## Repository boundaries

| Path | Purpose | Handling |
| --- | --- | --- |
| `apps/web/` | New corporate marketing mockup starter | Continue here |
| `web/` | Existing Next.js SEO/AEO app (AnswerTrace) | Preserved; not copied |
| `src/sampan/` | Existing Python SEO/GEO scorer and services | Preserved; not copied |
| `tests/`, `pyproject.toml` | Python verification and dependencies | Preserved |

The source spec predates inspection of the current `web/` app. Its statement that the repository is only FastAPI/buildless HTML is stale. The isolated static starter avoids copying service integrations or changing either existing app. A framework migration needs a separate decision.

## Continue tonight

Use `docs/06-CODEX-PROMPT.md`, with `apps/web/` as the fixed target and this README's current repository findings overriding stale path/framework assumptions. Implement public routes and bilingual page copy, then in-memory scripted Q&A, FAQ draft/preview/publish and video script preview. Keep actual rendering disabled and simulations visible. Run the full acceptance checklist in `docs/05-IMPLEMENTATION-PLAN.md` before describing the mockup as complete.

The ChatGPT Project handoff is `docs/08-CHATGPT-PROJECT-HANDOFF.md`; it is supplied for manual use and has not been applied to native Project settings. No hosting, DNS, merge or deployment is included.
