## updated: 2026-06-10

# Tasks

## In Progress

- [/] Gemini model evolution and reliability.
  - Priority: P1
  - Context: `ai.ts` has multi-provider failover and auto-discovery; needs clearer resilience around Gemini deprecations and provider switching.
  - Acceptance Criteria: provider health checks, fallback behavior, and model-switch logging stay reliable.

## Todo

### P1 - High

- [ ] Add PMO/DEV flow tracking: surface branch and PR readiness for all managed repos.
  - Priority: P1
  - Context: overseer already shows open PR/issue counts per repo, but the dashboard has no view of branch/PR readiness for promoting ROADMAP work into implementation (e.g., PRs awaiting review/merge vs. blocked on CI or changes-requested).
  - Acceptance Criteria: the dashboard surfaces, per repo, open PR counts broken down by review/CI state (ready-to-merge vs. blocked) so PMO users can see which repos have work ready to land.

- [ ] Add DEV-flow handoff support so PMO roadmap items can be promoted into implementation queues cleanly.
  - Priority: P1
  - Context: ROADMAP items move from "Planned" to "In Progress" manually, with no link between a roadmap item and the Agent Task Queue or an implementation branch/PR.
  - Acceptance Criteria: a roadmap item marked `[/]` (in progress) can be associated with an Agent Task Queue entry and/or a tracked PR, and that link is visible in the per-repo roadmap progress view.

### P2 - Medium

- [ ] Add workflow visualization for multi-step execution paths.
  - Priority: P2
  - Context: the FLOW-TASKS/HANDOFF/PMO/DEV/QA agent pipeline (see `templates/.github/prompts`) has no visual representation in the dashboard; users can't see where a repo's active work sits in that pipeline.
  - Acceptance Criteria: the dashboard shows a simple stage indicator (e.g., Planned -> In Progress -> Review -> Done) per active roadmap item or task, derived from existing status markers and PR/issue state.

- [ ] Connect overseer's agent task queue to agent-board's local model runtime (dispatch bridge v0).
  - Priority: P2
  - Context: overseer exposes an Agent Task Queue API and agent-board runs a local model runtime, but no bridge routes tasks between them.
  - Acceptance Criteria: a v0 bridge dispatches at least one queued overseer task to agent-board's runtime and reports completion status back to the queue.

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

<!--
AGENT INSTRUCTIONS:
1. Keep active items in In Progress and P1-P3 sections.
2. Keep task bullets short and scannable.
3. Move finished work into Done.
-->
