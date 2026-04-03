---
updated: 2026-04-03
---

# TASKS

## In Progress

- [/] Implement agent task queue execution path.
  - Priority: P1
  - Context: `POST /api/agent/tasks` contract and validation stub shipped 2026-03-27 (see Done section); auth, queue runner, and result reporting remain.
  - Acceptance Criteria: tasks submitted to the queue are executed, results are stored, and status is queryable.
  - Evidence: [docs/AGENT_TASK_QUEUE_API.md](docs/AGENT_TASK_QUEUE_API.md), [app/api/agent/tasks/route.ts](app/api/agent/tasks/route.ts)

- [/] Gemini model evolution and reliability.
  - Priority: P1
  - Context: `ai.ts` has multi-provider failover and auto-discovery; needs clearer resilience around Gemini deprecations and provider switching.
  - Acceptance Criteria: provider health checks, fallback behavior, and model-switch logging stay reliable.

## Todo

### P1 - High

- [ ] Add FLOW-TASKS agent prompt template.
  - Priority: P1
  - Context: no standardized prompt exists for agents to triage, sequence, and execute tasks from TASKS.md across repos.
  - Acceptance Criteria: `templates/.github/prompts/FLOW-TASKS.md` ships and is surfaced in the community-standards auto-fix set.

- [ ] Add HANDOFF agent prompt template.
  - Priority: P1
  - Context: no standardized handoff brief exists for agents passing context between sessions or between flow agents.
  - Acceptance Criteria: `templates/.github/prompts/HANDOFF.md` ships with a structured context-capture format and is surfaced in the community-standards set.

- [ ] Add per-repo roadmap-progress view to the dashboard.
  - Priority: P1
  - Context: overseer parses ROADMAP.md per repo but the dashboard only shows aggregate health; no view surfaces each repo's Q2/Q3 progress against its own plan.
  - Acceptance Criteria: the expanded row or a new panel shows the current-quarter roadmap items and their completion state for the selected repo.

- [ ] Add security inputs to the health score.
  - Priority: P1
  - Context: Dependabot alert severity and secret-scanning findings are fetched but not yet weighted into the health score.
  - Acceptance Criteria: critical/high Dependabot alerts and open secret-scanning alerts reduce the health score measurably.

- [ ] Connect overseer agent task queue to agent-board runtime.
  - Priority: P1
  - Context: agent-board exposes a local model runtime; overseer's agent queue should be able to dispatch tasks to it as a backend.
  - Acceptance Criteria: a documented dispatch path exists from overseer's queue API to agent-board's session API; at least one integration smoke test passes.

- [ ] Add cross-repo PMO/DEV flow tracking.
  - Priority: P1
  - Context: PMO planning now spans multiple repos and needs first-class visibility from branch creation through PR merge and DEV handoff.
  - Acceptance Criteria: overseer can display each repo's PMO branch state, pending roadmap/task changes, and DEV-flow handoff readiness in one dashboard view.

### P2 - Medium

- [ ] Add AI doc-improvement controls.
  - Priority: P2
  - Context: the app lacks inline improve-and-accept flows for existing documentation.
  - Acceptance Criteria: users can compare baseline and AI-enhanced content before accepting changes.

- [ ] Add workflow visualization.
  - Priority: P2
  - Context: multi-step actions still lack a clear branching and execution view.
  - Acceptance Criteria: the UI exposes execution-path visibility for template, edit, and PR flows.

- [ ] Add real-time webhook-driven sync.
  - Priority: P2
  - Context: repo data only refreshes on demand or via scheduled function; push and PR events should trigger incremental updates.
  - Acceptance Criteria: a GitHub webhook endpoint updates the relevant repo row within 30 seconds of a push event.

- [ ] Add a conversational interface foundation.
  - Priority: P2
  - Context: natural-language routing for repo hygiene and doc work is still only a concept.
  - Acceptance Criteria: one or two chat-driven workflows work end to end.

- [ ] Add cross-repo dependency mapping.
  - Priority: P2
  - Context: agent-board, bb-mcp, nitsuah-io, and overseer share overlapping stacks and could benefit from surfaced cross-repo links.
  - Acceptance Criteria: the dashboard shows inferred or declared connections between related repos and surfaces shared-stack signals.

- [ ] Expose overseer repo intelligence as an MCP server.
  - Priority: P2
  - Context: MCP is gaining traction as the standard agent-tool protocol; overseer's health and task data would be valuable to agent clients.
  - Acceptance Criteria: a minimal MCP server endpoint exposes `get_repo_health` and `list_tasks` tools consumable by any MCP-compatible client.

- [ ] Deprioritize stash: block PRs and add sanitization task.
  - Priority: P2
  - Context: stash is private and needs credential sanitization before it can be safely opened or integrated.
  - Acceptance Criteria: stash is tagged low-priority in overseer, PR approvals are required, and a sanitization checklist is created in stash's own TASKS.md.

### P3 - Exploratory

- [ ] Add zombie-branch detection.
  - Priority: P3
  - Context: the UI does not yet surface stale long-lived branches.
  - Acceptance Criteria: stale branches are detected and flagged in the interface.

- [ ] Add maintenance-mode detection.
  - Priority: P3
  - Context: dormant repositories are not yet automatically classified.
  - Acceptance Criteria: inactive repos are flagged past a defined threshold.

- [ ] Add token-density metrics.
  - Priority: P3
  - Context: token density is still only an exploratory repo-health metric.
  - Acceptance Criteria: logical-unit density is stored and surfaced usefully.

- [ ] Add comment-to-code ratio metrics.
  - Priority: P3
  - Context: documentation density remains an idea rather than a measured signal.
  - Acceptance Criteria: file-level and aggregate ratios are calculated and displayed.

- [ ] Add a dark and light mode toggle.
  - Priority: P3
  - Context: theme preferences are still not user-configurable.
  - Acceptance Criteria: the UI supports a persistent theme toggle.

- [ ] Add velocity scoring and technical-debt trending.
  - Priority: P3
  - Context: commit frequency and PR merge time are captured but not yet trended over time.
  - Acceptance Criteria: a trend chart shows velocity and technical-debt signals over rolling quarters.

## Done

For full feature details, see FEATURES.md. For historical context, see CHANGELOG.md.

- [x] Agent Task Queue API contract and validation stub.
  - Completed: 2026-03-27
  - Evidence: [docs/AGENT_TASK_QUEUE_API.md](docs/AGENT_TASK_QUEUE_API.md), [app/api/agent/tasks/route.ts](app/api/agent/tasks/route.ts)
- [x] Performance and rate-limiting improvements.
- [x] Security and tracking improvements.
- [x] Background refresh behavior.
- [x] Repository intelligence and health scoring.
- [x] AI integration and provider failover.
- [x] PR preview modal.
- [x] Auto-fix system.
- [x] Testing baseline and coverage target.
- [x] OAuth error handling.
- [x] GitHub integration.
- [x] Netlify deployment.
- [x] Guided tour system.
- [x] Core docs set.
- [x] Refresh `docs/AUDIT.md` and metrics evidence.
- [x] Docker smoke workflow coverage for app and test-stack checks.
  - Completed: 2026-03-27
  - Evidence: `.github/workflows/docker-smoke.yml`

<!--
AGENT INSTRUCTIONS:
1. Keep active items in In Progress and P1-P3 sections.
2. Keep task bullets short and scannable.
3. Move finished work into Done.
-->
