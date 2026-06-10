## updated: 2026-06-10

# 🗺️ Overseer Roadmap

Next Review: 2026-07-01

## Q4 2025 – Q1 2026 ✅

> Completed. Foundation, UX baseline, PR preview, AI enrichment, repo intelligence, auto-fix flows, Agent Task Queue API, Docker smoke CI, and BYOK/provider-order AI routing all shipped.

## Q2 2026: AI & Orchestration (IN PROGRESS) 🏗️

- [x] Add FLOW-TASKS and HANDOFF agent prompt templates to the community-standards template set
- [x] Add per-repo plan-execution tracking: surface each repo's Q2 roadmap progress in the dashboard
- [ ] Add PMO/DEV flow tracking: surface branch and PR readiness for all managed repos in the dashboard
- [ ] Add DEV-flow handoff support so PMO roadmap items can be promoted into implementation queues cleanly
- [ ] Add .github repo awareness: resolve community health files from owner/.github before flagging per-repo absence in health scoring and standards auto-fix
- [x] Add security inputs to the health score (Dependabot severity weighting, secret-scanning signal)
- [ ] Add AI doc-improvement controls: inline compare-and-accept flow for existing documentation
- [ ] Add workflow visualization for multi-step execution paths
- [/] Keep Gemini failover and model evolution resilient
- [ ] Connect overseer's agent task queue to agent-board's local model runtime (dispatch bridge v0)
- [ ] Deprioritize stash: mark private, block PRs, and add a sanitization task to TASKS.md

## Q3 2026: PMO Mode (Planned) 🏗️

- [ ] Allow easy management and roadmapping of TASKS, ROADMAP, FEATURES, and other core supporting MD files via a chat-driven interface in the dashboard
- [ ] Add a PMO mode to the dashboard that surfaces the PMO-relevant signals and controls, such as roadmap progress, plan execution status, and handoff management
- [ ] Add AI-assisted roadmap management features, such as auto-suggesting roadmap items based on repo intelligence, and auto-updating roadmap progress based on plan execution tracking

## Q3 2026: Analytics & MCP (Planned) 🤖

- [ ] Add the conversational interface foundation: one or two chat-driven repo-hygiene workflows end to end
- [ ] Add real-time webhook-driven sync for push and PR events across tracked repos
- [ ] Add advanced analytics: velocity scoring, technical-debt trending, and zombie-branch detection
- [ ] Expand MCP tooling surface: expose overseer repo intelligence as an MCP server for agent clients
- [ ] Add cross-repo dependency mapping to surface shared-stack connections (e.g., agent-board ↔ bb-mcp ↔ overseer)

## Q4 2026: Portfolio Intelligence (Exploratory) 🧪

- [ ] Autonomous plan execution: agents read ROADMAP.md and TASKS.md, open PRs, and close items end to end
- [ ] Portfolio intelligence dashboard: cross-repo health roll-up, trend lines, and strategic signal view
- [ ] Evaluate enterprise auth, team collaboration, and org-wide governance workflows
- [ ] Evaluate token-density, comment-to-code ratio, and maintenance-mode metrics as first-class signals
- [ ] Add mobile-responsive adjustments and lightweight PWA packaging

## Notes

- GitHub repositories and markdown remain the source of truth.
- Cross-repo orchestration and autonomous plan execution are the long-term product direction.
- Per-repo detailed execution stays in each repo's own TASKS.md; overseer tracks aggregate state.
- Detailed execution work for overseer itself stays in TASKS.md.
