---
updated: 2026-03-27
---

# TASKS

## In Progress

- [/] Gemini model evolution and reliability.
  - Priority: P1
  - Context: `ai.ts` already has multi-provider failover and auto-discovery, but the repo still needs clearer resilience around Gemini deprecations and provider switching.
  - Acceptance Criteria: provider health checks, fallback behavior, and model-switch logging stay reliable.

- [/] Keep Docker validation and app-build smoke tests reliable.
  - Priority: P1
  - Context: the production image now builds with placeholder auth values during the build stage, but the runtime path still depends on correctly supplied secrets.
  - Acceptance Criteria: container smoke builds stay green and runtime secret requirements remain documented.

## Todo

### P1 - High

- [/] Complete the Agent Task Queue API.
  - Priority: P1
  - Context: autonomous agent submission lacked a documented and implemented task-queue contract.
  - Acceptance Criteria: `POST /api/agent/tasks` is defined with validation, auth, and response structure; queue execution remains to be implemented.
  - Status: Contract and validation stub delivered 2026-03-27; queue execution pending.
  - Evidence: [docs/AGENT_TASK_QUEUE_API.md](docs/AGENT_TASK_QUEUE_API.md), [app/api/agent/tasks/route.ts](app/api/agent/tasks/route.ts)

### P2 - Medium

- [ ] Add workflow visualization.
  - Priority: P2
  - Context: multi-step actions still lack a clear branching and execution view.
  - Acceptance Criteria: the UI exposes execution-path visibility for template, edit, and PR flows.

- [ ] Add a conversational interface foundation.
  - Priority: P2
  - Context: natural-language routing for repo hygiene and doc work is still only a concept.
  - Acceptance Criteria: one or two chat-driven workflows work end to end.

- [ ] Add AI doc-improvement controls.
  - Priority: P2
  - Context: the app lacks inline improve-and-accept flows for existing documentation.
  - Acceptance Criteria: users can compare baseline and AI-enhanced content before accepting changes.

### P3 - Exploratory

- [ ] Add token-density metrics.
  - Priority: P3
  - Context: token density is still only an exploratory repo-health metric.
  - Acceptance Criteria: logical-unit density is stored and surfaced usefully.

- [ ] Add zombie-branch detection.
  - Priority: P3
  - Context: the UI does not yet surface stale long-lived branches.
  - Acceptance Criteria: stale branches are detected and flagged in the interface.

- [ ] Add maintenance-mode detection.
  - Priority: P3
  - Context: dormant repositories are not yet automatically classified.
  - Acceptance Criteria: inactive repos are flagged past a defined threshold.

- [ ] Add comment-to-code ratio metrics.
  - Priority: P3
  - Context: documentation density remains an idea rather than a measured signal.
  - Acceptance Criteria: file-level and aggregate ratios are calculated and displayed.

- [ ] Add a dark and light mode toggle.
  - Priority: P3
  - Context: theme preferences are still not user-configurable.
  - Acceptance Criteria: the UI supports a persistent theme toggle.

## Done

For full feature details, see FEATURES.md. For historical context, see CHANGELOG.md.

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
- [x] Add Docker smoke workflow coverage for app and test-stack checks.
  - Completed: 2026-03-27
  - Evidence: `.github/workflows/docker-smoke.yml` now builds the production image and validates the containerized test runtime command.

<!--
AGENT INSTRUCTIONS:
1. Keep active items in In Progress and P1-P3 sections.
2. Keep task bullets short and scannable.
3. Move finished work into Done.
-->
