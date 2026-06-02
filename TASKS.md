## updated: 2026-04-13 (Overseer compliance review)

# Tasks

## Done

## In Progress

- [/] Gemini model evolution and reliability.
  - Priority: P1
  - Context: `ai.ts` has multi-provider failover and auto-discovery; needs clearer resilience around Gemini deprecations and provider switching.
  - Acceptance Criteria: provider health checks, fallback behavior, and model-switch logging stay reliable.

- [/] Surface FLOW-TASKS and HANDOFF prompt templates in the community-standards auto-fix set.
- Priority: P1
- Context: `templates/.github/prompts/FLOW-TASKS.md` and `HANDOFF.md` have shipped; they are not yet included in the community-standards fix-all-practices auto-fix set.
- Acceptance Criteria: both prompt templates are applied and versioned correctly when the community-standards auto-fix runs on a target repo.

- [/] Implement .github fallback resolution for community health files.
- Priority: P1
- Context: community standards checks and fix-all behavior currently assume repo-local files and should treat owner-level `.github` as canonical fallback for `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
- Acceptance Criteria: health sync marks those standards healthy when found in `owner/.github`, and fix-all skips generating repo-local duplicates when fallback exists.

## Todo

### Dev feedback

- [ ] Fix loading and refresh of repos (see realtime sync on tasks below). it should happen periodically so as to avoid showing stale data, but avoid rate limits and not cause too much noise. the "refresh" of the entire app should also not be necessary as it interrupts the user experience and can cause them to lose their place in the app. ideally, we would have a "last updated" timestamp for each repo and only refresh those that are stale, or at least show the user that data is being refreshed in the background. panels should refresh not the entire app. this is a critical issue as it impacts the reliability of the data shown to users and can lead to confusion if they are seeing outdated information. periodic refresh can make it likely that users will see updated data without having to manually refresh, but it needs to be implemented in a way that is not disruptive.

### P1 - High

- [ ] Add per-repo roadmap-progress view to the dashboard.
  - Priority: P1
  - Context: overseer parses ROADMAP.md per repo but the dashboard only shows aggregate health; no view surfaces each repo's Q2/Q3 progress against its own plan.
  - Acceptance Criteria: the expanded row within the roadmap shows the current-quarter roadmap items and a progress bar indicating their completion state for the selected repo.

- [ ] Add security inputs to the health score.
  - Priority: P1
  - Context: Dependabot alert severity and secret-scanning findings are fetched but not yet weighted into the health score.
  - Acceptance Criteria: critical/high Dependabot alerts and open secret-scanning alerts reduce the health score measurably.

### P2 - Medium

- [ ] Add AI doc-improvement controls.
  - Priority: P2
  - Context: the app lacks inline improve-and-accept flows for existing documentation.
  - Acceptance Criteria: users can compare baseline and AI-enhanced content before accepting changes.
  - also allow for a prompt input on all AI usage (Besides repo summaries) so that users can customize the output and have more control over the results.

- [ ] Add AI feature suggestion button to the "features" panel.
  - Priority: P2
  - Context: users cannot yet ask the agent for suggestions on what features to build next based on repo data.
  - Acceptance Criteria: a "suggest a feature" button triggers an AI analysis of repo health and signals, returning a prioritized list of potential features to build.

- [ ] Add real-time webhook-driven sync.
  - Priority: P2
  - Context: repo data only refreshes on demand or via scheduled function; push and PR events should trigger incremental updates.
  - Acceptance Criteria: a GitHub webhook endpoint updates the relevant repo row within 30 seconds of a push event.

- [ ] Add a conversational interface foundation that consumes visible or sync data as context for a conversation with the user about their repos (messenger type chat window, "friend" per chat).
  - Priority: P2
  - Context: natural-language routing for repo hygiene and doc work is still only a concept.
  - Acceptance Criteria: one or two chat-driven workflows work end to end.

- [ ] Add cross-repo dependency mapping.
  - Priority: P2
  - Context: agent-board, bb-mcp, nitsuah-io, and overseer share overlapping stacks and could benefit from surfaced cross-repo links.
  - Acceptance Criteria: the dashboard shows inferred or declared connections between related repos and surfaces shared-stack signals.
  - visualize as an interactive 3d "graph/map" of repos with lines showing connections and shared signals, allowing users to explore how their repositories are interconnected and identify potential areas of improvement or risk. with the ability to filter and click on things to learn more.

- [ ] Expose overseer repo intelligence as an MCP server.
  - Priority: P2
  - Context: MCP is gaining traction as the standard agent-tool protocol; overseer's health and task data would be valuable to agent clients.
  - Acceptance Criteria: a minimal MCP server endpoint exposes `get_repo_health` and `list_tasks` tools consumable by any MCP-compatible client.
  - API design should consider authentication, rate limits, and data freshness guarantees.
  - documentation should be provided for how to integrate with the MCP server and interpret the health and task data.
  - mcp server should be tested for reliability and performance under expected load.
  - security considerations should be addressed, especially if the health data includes sensitive information about the repos.

### DB & backend scaling

- [ ] we may need to assess current DB design for scalability as well.

### P3 - Exploratory

- [ ] Add zombie-branch detection.
  - Priority: P3
  - Context: the UI does not yet surface stale long-lived branches.
  - Acceptance Criteria: stale branches are detected and flagged in the interface.
  - ie: delete old branches that have been merged or stale branches that haven't had activity in a while, with a confirmation step to avoid accidental deletions (dialog pop up showing what its going to clean up, with scaling in mind for across all repos)
  - some way to clean up old repos/delete them from memory/db safely en/masse would be good as well. like when viewing "hidden repos" have an option to "clean up cache on all hidden repos" that would remove them from the db and memory, with a confirmation step to avoid accidental deletions (though most of what we store in the DB is more a cache from GH anyway so stress that nothing is going to happen to the code there just our "copy" of it which can be resynced).

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

- [x] Add BYOK + quota-aware provider routing for Gemini failover.
  - Completed: 2026-04-11
  - Evidence: `lib/ai-providers.ts` now supports configurable provider order, BYOK key precedence, and Gemini quota-based deprioritization.
  - Evidence: `tests/gemini-health.test.ts` validates default order, custom order, BYOK precedence, and quota fallback behavior.

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
  - Evidence: `.github/workflows/docker-smoke.yml` now builds the production image and validates the containerized test runtime command.
- [x] Complete the Agent Task Queue API.
  - Completed: 2026-04-03
  - Evidence: [app/api/agent/tasks/route.ts](app/api/agent/tasks/route.ts), [tests/agent-tasks.test.ts](tests/agent-tasks.test.ts), [docs/AGENT_TASK_QUEUE_API.md](docs/AGENT_TASK_QUEUE_API.md)

<!--
AGENT INSTRUCTIONS:
1. Keep active items in In Progress and P1-P3 sections.
2. Keep task bullets short and scannable.
3. Move finished work into Done.
-->
