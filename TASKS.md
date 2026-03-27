# TASKS

**Last Updated:** 2026-03-27 | PMO audit — live site https://ghoverseer.netlify.app loading, test coverage at 71.51% (above target)

## Priority Key

- **P0** — Blocking (deployment or CI broken)
- **P1** — High (shipped feature with regression, or user-visible gap)
- **P2** — Medium (polish, docs, DX)
- **P3** — Low (exploratory)

---

## P1 — High

### Complete 2026Q1 Agent Task Queue API

**Status:** Planned  
**Context:** 2026Q1 roadmap item "Agent Task Queue: API endpoint for autonomous AI agents to submit tasks". This is foundational for the autonomous agent orchestration vision.  
**Acceptance:** POST `/api/agent/tasks` accepts agent-submitted doc generation queues; webhooks validate GitHub webhook signatures; response structure defined and documented

### Gemini Model Evolution & Reliability

**Status:** Ongoing  
**Context:** `ai.ts` has multi-provider failover (Gemini, GPT-4, Claude) and auto-discovery. But Gemini API has frequent model deprecations (v1 → v1.5 → v1.5 Pro → 2.0 Pro evolution). Current cached model may become unavailable.  
**Acceptance:** `npm run test-gemini` passes across all model family options; health check endpoint monitors all providers; logs when model switch happens

### docs/AUDIT.md Currency

**Status:** Open  
**Context:** Last audit was Dec 11, 2025 (3.5 months ago). METRICS.md shows actual coverage at 71.51% (above the 70% target) but timestamp is stale.  
**Acceptance:** docs/AUDIT.md reviewed and updated; METRICS.md timestamp refreshed; coverage value validated against latest vitest run

---

## P2 — Medium

### Workflow Visualization & Execution Paths

**Status:** Planned  
**Context:** 2026Q1 "Workflow Visualization: Screen showing branching/execution paths for complex actions". Currently PR Preview shows diff only; no branching/multi-step flow visualization.  
**Acceptance:** PR Preview Modal extended with visualization of AI template → edit → PR creation steps with branch visualization

### Conversational Interface Foundation (Chat-Driven)

**Status:** Planned  
**Context:** 2026Q1 roadmap item. Currently UI is GUI-driven (point-and-click). Target is natural language interface like "Run hygiene check on payment service, fix stale docs, assign highest priority vuln to Alice".  
**Acceptance:** Conversational input component accepts natural language; routes to appropriate handlers (docs fix, assignee logic, etc.); proof-of-concept for 1–2 workflows

### AI Doc Improvement Buttons

**Status:** Planned  
**Context:** 2026Q1 item "Add 'Improve' buttons to existing documentation with AI-powered enhancement modal". Currently auto-fix is available, but improving existing docs is not exposed.  
**Acceptance:** "Improve" button visible in doc rows; modal shows baseline + AI-enhanced version with user choice to accept/reject/edit

---

## P3 — Low / Exploratory

### Token Density Metric (LOC per logical unit)

**Status:** Open  
**Context:** v0.1.10 roadmap. Requires parsing code structure (functions, methods, classes) and correlating with LOC.  
**Acceptance:** Token density calculated for 3+ languages (JS/TS, Python, Go); stored in `repo_columns` with percentile display

### Zombie Branch Detection

**Status:** Open  
**Context:** v0.1.10 roadmap. Identify stale branches past merge date.  
**Acceptance:** GitHub API query for branches older than N days; UI marks branches with "stale" indicator

### Maintenance Mode Detection

**Status:** Open  
**Context:** v0.1.10 roadmap. Activity pattern analysis (no commits, no PRs, no issues in 90+ days).  
**Acceptance:** Repo marked "maintenance mode" if zero activity for 90 days; appear in separate UI section

### Comment-to-Code Ratio (Documentation Density)

**Status:** Open  
**Context:** v0.1.10 roadmap. Percentage of lines that are comments.  
**Acceptance:** Calculated per file and aggregated; correlated with test coverage and PR review time

### Dark/Light Mode Toggle

**Status:** Open  
**Context:** v0.1.10 item. Currently no dark mode.  
**Acceptance:** Toggle visible in header; persists to localStorage; all colors adapt correctly

---

## Done

- [x] **v0.1.8 Performance & Rate Limiting** — Rate limit UI, exponential backoff, smart caching, ETag support, sorting
- [x] **v0.1.9 Security & Tracking** — Security details section, SECURITY.md tracking, Dependabot, code/secret scanning configuration
- [x] **v0.1.10 Background Refresh** — 5-minute polling while panel expanded; respects backoff
- [x] **Repository Intelligence** — Health scoring (0-100), doc tracking (4-state model), LOC parsing, test case counting, CI/CD status
- [x] **AI Integration** — Gemini 2.0 summaries, multi-provider failover (GPT-4, Claude), auto-discovery and runtime model swapping
- [x] **PR Preview Modal** — File selection, diff view (Myers LCS), inline edit/generate
- [x] **Auto-Fix System** — One-click PR creation for 8 doc types, 4 best practices, 10 community standards
- [x] **Testing** — 162 test cases across 16 test files (pathways: date-utils, repo-type, health-score, best-practices, github-client), 5 E2E tests, Playwright integration
- [x] **Test Coverage Target** — 71.51% coverage achieved (above 70% target)
- [x] **OAuth Error Handling** — Auto-redirect, error parsing (5 error types), user-friendly messaging
- [x] **GitHub Integration** — Octokit REST API, rate limit monitoring, org access restrictions, error parsing
- [x] **Netlify Deployment** — netlify.toml, Netlify Functions, serverless Neon Postgres backend
- [x] **Guided Tour System** — 16-step interactive onboarding with spotlight and auto-advance
- [x] **Documentation** — ROADMAP.md, TASKS.md, METRICS.md, FEATURES.md, CONTRIBUTING.md, dev guides in docs/

---

<!--
AGENT INSTRUCTIONS:
This file tracks actionable tasks.
1. Keep active items in their priority sections (P0–P3)
2. Move completed items to Done with [x]
3. Evidence source in Context field
4. Keep descriptions concise but actionable
-->
