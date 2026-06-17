## updated: 2026-06-17

# Tasks

## In Progress

## Todo

### P1 - High

- [ ] Deprioritize stash repo: mark private, block new PRs, and add a one-time sanitization task to remove any sensitive history.
  - Priority: P1
  - Context: stash repo has been lingering without formal decommission; blocks clean portfolio hygiene.
  - Acceptance Criteria: repo is private, branch protection blocks new PRs, and a sanitization checklist item is documented.

### P2 - Medium

- [ ] Add AI-assisted roadmap management.
  - Priority: P2
  - Context: roadmap items are manually written; the system has enough repo health and activity data to suggest new items and auto-update progress.
  - Acceptance Criteria: (1) a "Suggest roadmap items" button analyzes repo health signals and proposes 2-3 actionable quarterly goals; (2) roadmap item progress is auto-updated from linked PR/issue state on each sync.

- [ ] Connect overseer's agent task queue to agent-board's local model runtime (dispatch bridge v0).
  - Priority: P2
  - Context: overseer exposes an Agent Task Queue API and agent-board runs a local model runtime, but no bridge routes tasks between them.
  - Acceptance Criteria: a v0 bridge dispatches at least one queued overseer task to agent-board's runtime and reports completion status back to the queue.

- [ ] Add a conversational interface foundation.
  - Priority: P2
  - Context: natural-language routing for repo hygiene and doc work is still only a concept; the Q3 PMO mode and AI-assisted roadmap management both benefit from a chat entry point.
  - Acceptance Criteria: a messenger-style chat panel (one "friend" per chat) consumes visible dashboard data as context; one or two repo-hygiene workflows (e.g., "summarize my stale docs", "what should I work on next?") work end to end.

- [ ] Add cross-repo dependency mapping.
  - Priority: P2
  - Context: agent-board, bb-mcp, nitsuah-io, and overseer share overlapping stacks and could benefit from surfaced cross-repo links.
  - Acceptance Criteria: the dashboard shows inferred or declared connections between related repos and surfaces shared-stack signals; visualized as an interactive 3D graph with filter and click-to-detail interactions.

- [ ] Expose overseer repo intelligence as an MCP server.
  - Priority: P2
  - Context: MCP is gaining traction as the standard agent-tool protocol; overseer's health and task data would be valuable to agent clients.
  - Acceptance Criteria: a minimal MCP server endpoint exposes `get_repo_health` and `list_tasks` tools consumable by any MCP-compatible client, with auth, rate limits, data-freshness docs, and load tests.

### DB & backend scaling

- [ ] Assess current DB design for scalability as repo and user count grows.
  - Priority: P2
  - Context: the current schema works at small scale; no formal review has been done for indexing strategy, query patterns at 100+ repos, or connection pooling limits.
  - Acceptance Criteria: a brief written assessment covers index coverage, slow-query candidates, and a recommendation on whether schema changes are needed before Q3 feature work.

### P3 - Exploratory

- [ ] Add zombie-branch detection.
  - Priority: P3
  - Context: the UI does not yet surface stale long-lived branches.
  - Acceptance Criteria: stale branches are detected and flagged in the interface with a bulk-action dialog to delete selected branches (confirmation step, scaling across all repos); includes a "clean up hidden repos" action to safely purge DB cache for hidden/removed repos with a confirmation step noting the GH source is untouched.

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
3. Move finished work into FEATURES.md, not a Done section here.
-->
