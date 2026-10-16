# Start here — GitHub, Codex and ChatGPT Project
Prepared 2026-10-16. This is a documentation starter, not a deployed app.

## 1. Existing repository: reuse it
Read-only GitHub checks confirmed https://github.com/aibuddygame/sampan-geo exists, is private and has no branches, contents or commits. Do not create another repository with the same name, delete this repository, or reset history. Check its Code page again before proceeding; this snapshot can change.

## 2. Recommended Mac setup with GitHub Desktop
1. Download and unzip SAMPAN-AI-Codex-Starter-Pack.zip. It contains one sampan-geo folder. Keep this extracted source folder separate from the clone.
2. Open GitHub Desktop, sign in as aibuddygame. Choose File → Clone Repository, select aibuddygame/sampan-geo, and clone into a NEW empty local destination such as Documents/GitHub/sampan-geo. An empty-repository message is expected.
3. Check repository history and local changes. If anything exists, follow section 4 before copying.
4. Copy the CONTENTS of the extracted sampan-geo folder into the clone. README.md and AGENTS.md must sit at the clone root, with docs/ alongside them. Do not create sampan-geo/sampan-geo. In Finder press Command-Shift-period to show and copy .gitignore. Never replace the clone's .git folder.
5. In GitHub Desktop review every changed file. Expect the files listed in PACK-VERIFICATION.md. No credentials, raw website data or application code should appear. Commit with message “docs: initialize SAMPAN.AI Codex starter pack”. Then choose Publish branch or Push origin as offered. This publishes the initial branch to the EXISTING private repository; do not create a new remote repository.
6. Verify on GitHub: Private badge, root AGENTS.md and README.md, docs/01 through docs/10, .gitignore, and the new commit. Check off P00-2 only after this verification and record its commit in docs/10-PROGRESS.md.

## 3. Terminal alternative — use instead of section 2
Requires Git and GitHub authentication already configured. Never paste tokens into chat or URLs.
```bash
mkdir -p ~/Documents/GitHub
cd ~/Documents/GitHub
git clone https://github.com/aibuddygame/sampan-geo.git
cd sampan-geo
git status
git branch -a
```
If the destination already exists, choose a new destination rather than removing it. Confirm the clone is empty. Copy extracted contents including .gitignore as in section 2. Then:
```bash
git checkout -b main
git add README.md AGENTS.md CHATGPT_PROJECT_INSTRUCTIONS.md GITHUB_AND_CHATGPT_SETUP.md SAMPAN-AI-CONSOLIDATED-PLAN.md .gitignore docs SOURCE-MANIFEST.json PACK-VERIFICATION.md
git diff --cached --stat
git diff --cached
```
Review the staged diff before continuing:
```bash
git commit -m "docs: initialize SAMPAN.AI Codex starter pack"
git push -u origin main
```
If checkout says main already exists, or push rejects because remote work exists, stop and inspect; follow section 4. Never force-push to make this work.

## 4. If existing work is found / starting over safely
- Preserve uncommitted work first: copy the complete local folder to a dated backup outside the clone (including hidden files); check the backup before modifying anything. Do not run reset --hard or clean.
- For a nonempty remote, use a fresh clone, fetch current history, and create a branch named docs/codex-starter-refresh from its current default branch in GitHub Desktop (Branch → New Branch).
- Compare each starter file against the current file before copying. Preserve code, user edits, history and unrelated files. Merge only reviewed documentation changes; record conflicting decisions for review. Removing obsolete editor rules is a separate reviewed change, never an automatic recursive deletion.
- Commit and push the review branch; open a pull request into the existing default branch. Review before merging. Do not replace the default branch or force-push.
- A truly new history would require a separately approved destructive operation after backup; it is unnecessary for the currently empty repo. A fresh local clone gives a clean setup without deleting remote history.

## 5. Open in Codex
Open the actual cloned Documents/GitHub/sampan-geo folder in the Codex app as a local project. Do not develop inside the extracted download or ChatGPT synced sources mirror. Ask Codex to read AGENTS.md, README and current roadmap/progress, report the current milestone and repository state, then identify the next acceptance unit. AGENTS.md is the durable repository instruction file; no editor-specific rules folder is included.

First Codex prompt:
> Read AGENTS.md and the referenced project documents. Inspect Git status and current implementation. Confirm completed/pending/blocked tasks. Work only on T001/P01-1, the smallest local FastAPI/config/test scaffold, if setup is verified. Define inputs, outputs, acceptance criteria and run meaningful checks. Update roadmap/progress with actual evidence. No crawl, LLM spending, publication, DNS changes or deployment in this scaffold task.

Official Codex instruction reference, checked 2026-10-16: https://learn.chatgpt.com/docs/agent-configuration/agents-md

## 6. Refresh the ChatGPT Project
This task already has the named Project context. Reuse it unless you want a separate clean conversation history; keep the old project intact if creating another.
1. Open SAMPAN.AI — SEO, GEO & AI Agent Platform in ChatGPT. In its project settings/instructions, replace old instructions with the contents of CHATGPT_PROJECT_INSTRUCTIONS.md (omit the first heading).
2. If deliberately creating a new project, create it with the same descriptive name and paste those instructions. UI labels may vary; Project creation/settings were not exercised in this task.
3. Add the revised README, AGENTS.md and docs/01 through docs/10 as reference sources if your plan permits. Also add the setup guide. If upload limits intervene, use SAMPAN-AI-CONSOLIDATED-PLAN.md plus AGENTS.md and Project instructions instead of duplicate individual technical docs.
4. Remove or clearly supersede stale reference uploads in the ChatGPT UI; do not edit files inside this local mirror's sources/. Keep the prior conversation for provenance and move it into the chosen project if that action is available.
5. State that the snapshot is dated 2026-10-16 and GitHub is canonical. After future changes, refresh reference uploads manually; do not assume automatic GitHub sync or repository access.

Project check prompt:
> Using the latest accessible GitHub docs, identify current milestone, verified completed tasks, pending/blocked work and next task. If using uploaded sources, state their date. Do not assume code, extraction or deployment exists.

## 7. Setup acceptance and next step
Repository remains private; starter is committed once at root; Codex reads the real clone; Project instructions say Codex; current snapshots agree with GitHub; no production changes. Record verified setup, then start T001. No API key, hosting or DNS change is needed to upload this documentation pack.
