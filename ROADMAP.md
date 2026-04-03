---
updated: 2026-04-03
---

# Roadmap

## 2025 Q4 (Completed)

- [x] Ship the foundation and UX baseline.
- [x] Add PR preview, AI enrichment, repo intelligence, and auto-fix flows.
- [x] Reach and hold the test coverage target.

## 2026 Q1 (Completed)

- [x] Deliver the Agent Task Queue API contract and validation stub (queue execution continues in Q2).
- [x] Refresh `docs/AUDIT.md` and keep the metrics evidence current.
- [x] Add Docker smoke workflow coverage for app and test-stack checks.

## 2026 Q2 (In Progress)

- [ ] Add FLOW-TASKS and HANDOFF agent prompt templates to the community-standards template set.
- [ ] Add per-repo plan-execution tracking: surface each repo's Q2 roadmap progress in the dashboard.
- [ ] Add PMO/DEV flow tracking: surface branch and PR readiness for all managed repos in the dashboard.
- [ ] Add DEV-flow handoff support so PMO roadmap items can be promoted into implementation queues cleanly.
- [ ] Add security inputs to the health score (Dependabot severity weighting, secret-scanning signal).
- [ ] Add AI doc-improvement controls: inline compare-and-accept flow for existing documentation.
- [ ] Add workflow visualization for multi-step execution paths.
- [/] Keep Gemini failover and model evolution resilient.
- [ ] Connect overseer's agent task queue to agent-board's local model runtime (dispatch bridge v0).
- [ ] Deprioritize stash: mark private, block PRs, and add a sanitization task to TASKS.md.

## 2026 Q3 (Planned)

- [ ] Add the conversational interface foundation: one or two chat-driven repo-hygiene workflows end to end.
- [ ] Add real-time webhook-driven sync for push and PR events across tracked repos.
- [ ] Add advanced analytics: velocity scoring, technical-debt trending, and zombie-branch detection.
- [ ] Expand MCP tooling surface: expose overseer repo intelligence as an MCP server for agent clients.
- [ ] Add cross-repo dependency mapping to surface shared-stack connections (e.g., agent-board ↔ bb-mcp ↔ overseer).
- [ ] Harden the agent task queue: auth, rate-limit, and queue-execution path past the stub stage.

## 2026 Q4 (Exploratory)

- [ ] Autonomous plan execution: agents read ROADMAP.md and TASKS.md, open PRs, and close items end to end.
- [ ] Portfolio intelligence dashboard: cross-repo health roll-up, trend lines, and strategic signal view.
- [ ] Evaluate enterprise auth, team collaboration, and org-wide governance workflows.
- [ ] Evaluate token-density, comment-to-code ratio, and maintenance-mode metrics as first-class signals.
- [ ] Add mobile-responsive adjustments and lightweight PWA packaging.

## Notes

- GitHub repositories and markdown remain the source of truth.
- Cross-repo orchestration and autonomous plan execution are the long-term product direction.
- Per-repo detailed execution stays in each repo's own TASKS.md; overseer tracks aggregate state.
- Detailed execution work for overseer itself stays in TASKS.md.
