# SAMPAN teammate testing guide

Prepared 17 November 2026. Purpose: run the current private SAMPAN prototype on your own computer, test permitted URLs and give feedback. No public deployment is required.

## 1. Get the current version

The current testing source is in the private repository: https://github.com/aibuddygame/sampan-geo . Request access using your GitHub username. Barry can invite you through repository Settings → Collaborators and teams / Manage access. Read access is sufficient for testing; agree on Write access for development. Accept the invitation, then clone:

```sh
git clone https://github.com/aibuddygame/sampan-geo.git
cd sampan-geo
```

Use the default branch once this release is merged. If testing a review branch, check out the exact branch Barry provides. For later updates, save your own changes first, then use `git pull --ff-only`. The optional dated ZIP is an earlier offline snapshot; GitHub is the maintained testing source after this release. Never copy a ZIP over an existing checkout without comparing changes.

## 2. Install and start — macOS / Linux

Install Python 3.11 or newer from its official source if needed. Run these commands in the extracted source root (the folder containing pyproject.toml):

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -e '.[dev]'
.venv/bin/python -m pytest -q
.venv/bin/python -m uvicorn sampan.scoring_app:create_scoring_app --factory --host 127.0.0.1 --port 8004
```

Leave the terminal open. Visit http://127.0.0.1:8004/ for the website checker and http://127.0.0.1:8004/pilots for saved report history. Stop with Control-C. To restart later, run only the last command from the same folder. If port 8004 is occupied, use 8005 and open that port instead.

## Windows PowerShell

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e '.[dev]'
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m uvicorn sampan.scoring_app:create_scoring_app --factory --host 127.0.0.1 --port 8004
```

These Windows instructions are provided for convenience; this release was checked on macOS, not Windows.

## 3. First test

1. Enter https://vxreal.com/ in the checker.
2. Keep related-page review enabled (up to eight pages). Confirm permission only for websites you own or are authorized to test.
3. Start with Kimi disabled. Deterministic checks require no provider key.
4. Choose VX Real in the save selector if you want local report history, then analyze.
5. Review separate SEO/GEO readiness scores, topic cards, source pages and unresolved checks. Download the JSON report if needed.
6. Try an authorized English or Traditional Chinese website. For ESGtrace, use a one-off check: an ESGtrace-specific managed pilot is not configured yet. Do not save it under another client's name.

Each teammate has independent local history. Private saved client reports are excluded from GitHub; run your own authorized scan. Scores can change with live content and AI suggestions. Readiness is not Google position, keyword demand or actual AI visibility. Missing evidence is not a measured zero or confirmed failure.

## 4. Optional Kimi keywords

Create .env in the source root using .env.example as a template. Set SAMPAN_KIMI_API_KEY privately using your own approved provider key. The configured default is kimi-k3.1-pro; verify access in your provider account. Restart the server after configuration, then enable Kimi in the checker. This sends bounded public page text to the provider and may incur charges. The current process limits calls; restarting resets that counter. Never commit or send .env in a feedback report. No key is included here.

## 5. Optional JavaScript rendering

For sites with JavaScript-dependent content, install the extra and browser:

```sh
.venv/bin/python -m pip install -e '.[render]'
.venv/bin/python -m playwright install chromium
```

On Windows, use .\.venv\Scripts\python.exe instead. Restart and enable isolated rendering. An optional renderer test is skipped by default; installation alone does not prove browser availability. Some sites remain incomplete because isolated rendering intentionally blocks network APIs and forms.

## 6. Google and other integrations

Google access is not required for checker testing. This package contains no Search Console tokens, OAuth client secrets or GA4 credentials. Existing Google CLI property routing is still tied to the legacy pilot: do not use it to fetch VX Real or ESGtrace data without the explicit property-selection work described in the handoff plan. Automated AI mentions/citations tracking and the combined reporting dashboard are proposed work, not implemented features. Do not create Google properties, change DNS or publish client changes as part of a basic test.

## 7. Documentation and skills

- README.md: application overview and entry points. Some milestone sections describe the earlier T001 scope; consult dated progress entries for later local work.
- docs/10-PROGRESS.md: evidence and task history.
- docs/20-VERIFIED-READINESS-SCALE.md: scoring and evidence coverage.
- docs/23-SEO-GEO-STANDARD-PROCEDURE.md: repeatable site improvement process.
- docs/30-COLLEAGUE-HANDOFF-AND-AI-VISIBILITY.md: future reporting work and boundaries.
- docs/team/AI-VISIBILITY-PLAN.md: proposed reporting work.
- docs/team/skills/ and docs/team/templates/: reusable procedures and draft measurement templates.

For Codex, read AGENTS.md before development. Optional skill folders are in docs/team/skills; inspect them and install on your own machine only if wanted. The AI visibility skill is a runbook, not working tracking code.

## 8. Give feedback

Create a GitHub Issue with the URL, test date, options used, expected versus actual behavior and a screenshot or sanitized downloaded report. Say whether Kimi was enabled. Do not attach credentials, private client captures, enquiry details or Google exports. Agree changes before implementing; preserve client facts and the existing design.

## Sharing the testing site

127.0.0.1 means **your own computer**. Barry's localhost link cannot be opened on a teammate's computer to reach Barry's server. For now, share the private repository and this guide and have each teammate run their own local instance. Screen sharing is another option for a live walkthrough without installation.

A shared browser-only preview needs a separate authenticated staging setup. The current app deliberately accepts loopback traffic only and is not ready to expose publicly. Do not bind it to 0.0.0.0 or put a public tunnel in front of the operator workspace. Hosting/authentication, per-user access, API budgets and private report protection need preparation before that step.

## Ready-to-send note

Here is our private SAMPAN testing repository. Please follow TEAM-SETUP.md to run it locally, try VX Real and other permitted sites, and log feedback in our private GitHub repository. The repository includes the source, tests, documentation and reusable procedures. AI keyword suggestions are optional and need an approved provider key. These are readiness assessments; actual Google ranking and AI visibility measurement remain separate work.
