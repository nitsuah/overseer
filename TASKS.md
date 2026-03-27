# TASKS

**Last Updated:** 2026-03-27 | PMO audit — live site https://ghoverseer.netlify.app loading, test coverage at 71.51% (above target)

## Priority Key

- **P0** — Blocking (deployment or CI broken)
- **P1** — High (shipped feature with regression, or user-visible gap)
- **P2** — Medium (polish, docs, DX)
- **P3** — Low (exploratory)

---

## In Progress

### Gemini Model Evolution & Reliability

- [/] **(P1) Gemini Model Evolution** — `ai.ts` has multi-provider failover (Gemini, GPT-4, Claude) and auto-discovery. Ensure resilience against Gemini API model deprecations; health check monitors all providers; logs when model switch happens

---

## Todo

### Documentation & Audit

- [ ] **(P1) Refresh docs/AUDIT.md** — Last audit Dec 11, 2025 (3.5mo ago); update METRICS.md timestamp; validate coverage value against latest vitest run

### 2026Q1 Autonomous Agents

- [ ] **(P1) Complete Agent Task Queue API** — POST `/api/agent/tasks` for autonomous AI agents to submit doc generation queues; webhook signature validation; response structure defined and documented
- [ ] **(P2) Workflow Visualization** — UI screen showing branching/execution paths for multi-step actions (template → edit → PR creation)
- [ ] **(P2) Conversational Interface Foundation** — Natural language chat-driven input routing to handlers (docs fix, vuln assignment, repo hygiene); proof-of-concept for 1–2 workflows
- [ ] **(P2) AI Doc Improvement Buttons** — "Improve" buttons on existing docs; modal shows baseline + AI-enhanced version with accept/reject/edit flow

### Exploratory

- [ ] **(P3) Token Density Metric** — LOC per logical unit (function/method/class) for JS/TS, Python, Go; stored in `repo_columns` with percentile display
- [ ] **(P3) Zombie Branch Detection** — GitHub API query for branches older than N days; UI marks branches with "stale" indicator
- [ ] **(P3) Maintenance Mode Detection** — Auto-flag repos with zero activity for 90+ days; separate UI section
- [ ] **(P3) Comment-to-Code Ratio** — Documentation density per file and aggregate; correlated with test coverage
- [ ] **(P3) Dark/Light Mode Toggle** — Toggle in header; persists to localStorage; all colors adapt correctly

---

## Done

_For full feature details, see FEATURES.md. For historical changelog, see CHANGELOG.md._

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
1. Add new tasks to "Todo" as they arise.
2. Move tasks to "In Progress" when you start working on them.
3. Move tasks to "Done" when completed.
4. Keep task descriptions concise.
5. Priority is encoded in task title: (P0) blocking, (P1) high, (P2) medium, (P3) low/exploratory.
-->
