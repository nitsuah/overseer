# Repository Feedback Summary (MD Format)

Biggest issues:

- Github auth doesnt work in prod (token?)
Gemini api calls dont wory (api 500?)

## Missing / Not Displayed

- Metrics not showing (METRICS.md)
  -  Testing details? number of tests, test coverage, test framework, etc.
- Key documents not surfaced in UI:
  - FEATURES.md
  - CHANGELOG.md
  - CONTRIBUTING.md
  - ROADMAP.md
  - README.md
  - TASKS.md
- PR creation should open in a new tab

---

## Detail Panel Structure

Each major element should have:
- A **section** in the detail panel
- Some items get:
  - Row-level icon
  - Expanded-view details
  - Or both, depending on relevance
- Docs should maintain the standard:
  - Icon on bar + “Fix it” button
  - Checklist (green/red) for each file

### Document Categories
#### High Priority
- **README.md** – Overview & setup
- **FEATURES.md** – Feature documentation
- **ROADMAP.md** – Future plans
- **TASKS.md** – Current tasks

#### Lower Priority
- **CONTRIBUTING.md**
- **LICENSE.md**
- **CHANGELOG.md**

---

## METRICS
- Need constraints & expectations for Metrics.md
- Start with **presence checks** → evolve into **quality/health checks**
- Ensure Metrics.md includes all expected metrics

---

## BEST PRACTICES (New Section)
A dedicated checklist to confirm repo hygiene:
- Protect `main`
- Require up-to-date branch, passing tests, +1 approval
- Copilot PR + build failure assessment
- Use `.gitignore` + `agent/` or `docs/` patterns
- Add `.github/pull_request_template.md` (or global)
- Local dev: pre-commit hooks, testing guidelines
- Deployments: Netlify badges in README

---

## Feature Philosophy
All features should:
- Have **fix options**
- Include **health checks** for presence & quality
- Be reflected in this repo’s own FEATURES.md (self-improving)
- Be added as **META features** for the Overseer system (self-enhancing from detect to quality/health to fix options like docs are)

---

## Planned Detection Features
- Pre-commit hooks (`.husky/`, `.git/hooks/`)
- CI/CD (`.github/workflows/`, `.gitlab-ci.yml`, `netlify.toml`)
- Testing frameworks (vitest, jest, playwright config)
- Linting (`.eslintrc`, `.prettierrc`, `biome.json`)
- Security:
  - `SECURITY.md`
  - `.github/dependabot.yml`
  - Dependabot, code scanning, secret scanning results
- Issue/PR templates
- Package manager lockfiles
- Docker (`Dockerfile`, `docker-compose.yml`)
- Environment (`.env.example`)
- Copilot prompt files
- Community Standards:
  - README
  - Code of Conduct
  - Contributing
  - License
  - Security policy
  - Issue templates
  - PR template
  - Content reporting

---

## Future ideas

The "LLM Context Cost" Metric
Since you are building this for AI Agents, you should measure how "expensive" it is for an agent to understand the repo.

Metric: Token Density

Calculation: Total tokens in README + ROADMAP + TASKS + CONTRIBUTING.

Insight: If the context is >50k tokens, the repo is "bloated" and an Agent will hallucinate or fail.

Action: Overseer suggests splitting docs or summarizing.

B. "Bus Factor" Visualization
Metric: Contributor Dominance

Calculation: Percentage of commits/lines changed by the top contributor vs. the rest in the last 90 days.

Insight: If you (Austin) are at 99%, the "Health" is risky. If it's distributed, it's healthy.

C. "Staleness" vs. "Stability"
A repo that hasn't changed in 6 months isn't always dead; it might be "Done."

Feature: Manual "Maintenance Mode" Toggle.

Logic: If I toggle a repo to "Library/Maintenance," stop docking points for low activity. Only dock points for unresolved issues.

D. The "Zombie Branch" Detector
Metric: Abandoned Work

Calculation: Number of branches > 30 days old without a PR, or PRs open > 14 days without comments.

Insight: Clutter kills cognitive load.

Action: Overseer flags these in the "Code/CI" column of your dashboard.

E. "Comment-to-Code" Ratio (Documentation Depth)
Metric: Code Explainability

Calculation: Ratio of comment lines to code lines (excluding standard headers).

Insight: Low ratio = High technical debt.

Action: If ratio < 5%, drop the overall Health Score to a 'C'.


## New Detail Sections
- **FEATURES.md** – Feature Documentation
- **Testing** – Number of tests, testing metrics, presence of frameworks
- **Community Standards** – Checklist or doc-tracking depending on type

By the end the features section, testing, best practices should all have sections in the detail panel and a single icon in the main view row as an indicator of health. we'll work on both but keep this same concept for most sections and for more important elements. tl;dr just keep doing what you're doing for docs on the other stuff too, but worry about the "fix it" buttons til the WAY end for everything. we should focus on detection and health checks first, and presenting it to the user then we'll worry about "fixing" things automagically.

Visualization of Your Dashboard Concept
This layout perfectly maps to the flow of value:

Roadmap (Left): "What are we doing?" (Strategy)

Tasks (Mid-Left): "How are we doing it?" (Execution)

Features (Center): "What exists now?" (Product)

Code/CI (Mid-Right): "Is it broken?" (Quality)

Docs (Right): "How do I use it?" (Knowledge)

## HEALTH as an indicator

1. presence - does this thing exist, checkbox, is it implemented or avaialbe as expected (did the dev do the thing)
2. conformity - does this thing follow the rules, checkbox, is it implemented or avaialbe as expected (did the dev do the thing)
3. remediation - can we fix it automatically, checkbox, is it implemented or avaialbe as expected (did the dev do the thing)

these are the core goals of anything we are tracking or displaying. can we see the thing, we do have enough info about the conformity of the thing (was it done right or to a level we can detect it, ex: our own metrics.md) but also can we build towards an effective strategy to self-solve (missing docs is an example that works well but needs improvements, ie: gen ai)

By treating "Health" as a maturity model rather than a binary (Pass/Fail) state, you turn the dashboard from a notification center into a progressive workflow tool.Here is the PM/Technical write-up for the Overseer Health Protocol. You can drop this into your architecture docs or CONTRIBUTING.md.The Overseer Health ProtocolA Holistic Approach to Repository State & IntegrityIn Overseer, "Health" is not a static check; it is a lifecycle. We do not simply check if a resource exists. We evaluate its integrity (does it match our schema?) and its value (does it contain unique content?).Every tracked element (Docs, CI, Metadata) follows a strict Promotion Path:Presence: Is it there?Conformity: Does it follow the rules?Content: Is it filled out?Remediation: Can we fix it automatically?1. The Visual Status SpectrumWe use a standard color-coded state machine across the entire dashboard. This logic applies to Docs, CI workflows, and Repo Metadata.StatusColorMeaningLogic / CriteriaAction AvailableMissing🔴 RedCritical GapFile/resource does not exist.[Create] (Applies Template)Dormant⚪ GreyTemplate OnlyFile exists but matches the default template hash exactly (1:1). No unique content added.[Generate] (AI Draft)Malformed🟡 YellowStructure BrokenFile exists but key markers/headers are missing. Agent cannot parse it safely.[Repair] (Fix Syntax)Healthy🟢 GreenValid & ActiveFile exists, schema is valid, and content differs from template.[Edit/Update]2. Template Conformity (The "Yellow" Guardrail)To prevent AI agents (or humans) from breaking the parser, we enforce Structural Integrity Checks.How it worksOverseer templates use "Immutable Anchors"—HTML comments or specific Markdown headers that must remain in the file for the parser to work.Example: ROADMAP.md CheckMarkdown# Project Roadmap ## Q1 Goals - [ ] ...
Green State: All anchors (roadmap-root, section-q1) are present.Yellow State: The user deleted ``. The parser now fails to find the quarter.The System Reaction: The UI flags this as "Malformed." The AI Agent is forbidden from writing to this file until the structure is repaired to prevent compounding errors.3. Holistic ApplicationWe apply this same logic to other domains beyond just Documentation:🛠 CI/CD Pipelines🔴 Missing: No .github/workflows/main.yml.⚪ Dormant: Workflow file exists but is commented out or never run.🟡 Malformed: YAML syntax error or failing build.🟢 Healthy: Last run was successful (Green check).🛡 Security & Git Hygiene🔴 Missing: No SECURITY.md or .gitignore.⚪ Dormant: .gitignore exists but is empty.🟡 Malformed: .env file accidentally committed (Security Risk).🟢 Healthy: Files present and valid.📦 Package Health🔴 Missing: No package.json (for JS repos).⚪ Dormant: scripts are empty or default echo "Error: no test specified".🟡 Malformed: Invalid JSON or conflicting dependencies.🟢 Healthy: Valid JSON, scripts are executable.4. The "Fix" Workflow (Input/Output Controls)Because we know the exact state, the "Action Button" on the dashboard changes contextually:If Red (Missing): Button = Git Create.Action: Commits the raw template file.If Grey (Template): Button = AI Fill.Action: Sends the template + Repo Context to Gemini. Gemini fills the blanks.If Yellow (Malformed): Button = Restore Header.Action: Re-inserts the missing Anchor tags without deleting the user's text content.Implementation Note for You:To pull this off, we need a simple hashing utility in your lib/.TypeScript// lib/health-check.ts

// 1. Calculate Hash of your local /templates/ROADMAP.md
// 2. Fetch remote repo ROADMAP.md
// 3. Compare:
if (remoteFile == null) return "RED";
if (hash(remoteFile) === hash(templateFile)) return "GREY";
if (!validateAnchors(remoteFile)) return "YELLOW";
return "GREEN";
Does this "Yellow State" logic cover your concern about agents breaking the syntax? It essentially acts as a "Linting" layer before the AI is allowed to do creative work.