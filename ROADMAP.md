## updated: 2026-06-17

# 🗺️ Overseer Roadmap

Next Review: 2026-07-01

## Q4 2025 – Q1 2026 ✅

> Completed. Foundation, UX baseline, PR preview, AI enrichment, repo intelligence, auto-fix flows, Agent Task Queue API, Docker smoke CI, and BYOK/provider-order AI routing all shipped.

## Q2 2026: AI & Orchestration ✅

- [x] Add FLOW-TASKS and HANDOFF agent prompt templates to the community-standards template set
- [x] Add per-repo plan-execution tracking: surface each repo's Q2 roadmap progress in the dashboard
- [x] Add PMO/DEV flow tracking: surface branch and PR readiness for all managed repos in the dashboard
- [x] Add .github repo awareness: resolve community health files from owner/.github before flagging per-repo absence in health scoring and standards auto-fix
- [x] Add security inputs to the health score (Dependabot severity weighting, secret-scanning signal)
- [x] Add AI feature suggestion button to the Features panel with optional prompt input (PR #132)
- [x] Add AI doc-improvement controls: inline compare-and-accept flow for existing documentation (PR #133)
- [x] Add workflow visualization for multi-step execution paths: pipeline stage bar (Planned → In Progress → In Review → Done) per roadmap item (PR #131)
- [x] Add real-time webhook-driven sync: HMAC-validated GitHub push webhook triggers background sync (PR #134)
- [x] Batch per-repo detail queries into a single db.transaction() call to reduce Neon round trips (PR #128)
- [x] Keep Gemini failover and model evolution resilient (PR #137)
- [x] Add DEV-flow handoff support so PMO roadmap items can be promoted into implementation queues cleanly (PR #136)
- [ ] Deprioritize stash: mark private, block PRs, and add a sanitization task to TASKS.md

## Q3 2026: PMO Mode 🏗️

- [x] Add PMO mode to the dashboard: portfolio-wide roadmap progress, plan execution status, and handoff management view (PR #136)
- [ ] Add AI-assisted roadmap management: auto-suggest items from repo health signals and auto-update progress from linked PR/issue state
- [x] Add DEV-flow handoff UI: promote in-progress roadmap items into the agent task queue with pre-filled context (PR #136)
- [ ] Allow easy management of TASKS, ROADMAP, FEATURES via a chat-driven interface in the dashboard

## Q3 2026: Analytics & MCP 🤖

- [ ] Add the conversational interface foundation: one or two chat-driven repo-hygiene workflows end to end
- [ ] Add advanced analytics: velocity scoring, technical-debt trending, and zombie-branch detection
- [ ] Expand MCP tooling surface: expose overseer repo intelligence as an MCP server for agent clients
- [ ] Add cross-repo dependency mapping to surface shared-stack connections (e.g., agent-board ↔ bb-mcp ↔ overseer)

## Q4 2026: Portfolio Intelligence (Exploratory) 🧪

- [ ] Autonomous plan execution: agents read ROADMAP.md and TASKS.md, open PRs, and close items end to end
- [ ] Portfolio intelligence dashboard: cross-repo health roll-up, trend lines, and strategic signal view
- [ ] Evaluate enterprise auth, team collaboration, and org-wide governance workflows
- [ ] Evaluate token-density, comment-to-code ratio, and maintenance-mode metrics as first-class signals
- [ ] Add mobile-responsive adjustments and lightweight PWA packaging
- [ ] **Repo "mood" signal** — lightweight sentiment computed from recent PR descriptions, commit messages, and TASKS.md tone; surfaces whether a repo is in grind mode, cleanup mode, or blocked, giving PMO quick directional intuition without reading every PR.
- [ ] **AI PR pairing suggestions** — when promoting a ROADMAP/TASKS item to a PR, Overseer surfaces related items from other repos that should co-land; reduces cross-repo integration surprises by exposing dependency coupling before merge.

## Notes

- GitHub repositories and markdown remain the source of truth.
- Cross-repo orchestration and autonomous plan execution are the long-term product direction.
- Per-repo detailed execution stays in each repo's own TASKS.md; overseer tracks aggregate state.
- Detailed execution work for overseer itself stays in TASKS.md.
