# Tasks

## updated: 2026-08-28

## In Progress

## Todo

### P1 - High

- [ ] Deprioritize stash repo: mark private, block new PRs, and add a one-time sanitization task to remove any sensitive history.
  - Priority: P1
  - Context: stash repo has been lingering without formal decommission; blocks clean portfolio hygiene.
  - Acceptance Criteria: repo is private, branch protection blocks new PRs, and a sanitization checklist item is documented.

### P2 - Medium

- [ ] Connect overseer's agent task queue to agent-board's local model runtime (dispatch bridge v0).
  - Priority: P2
  - Context: overseer exposes an Agent Task Queue API and agent-board runs a local model runtime, but no bridge routes tasks between them.
  - Acceptance Criteria: a v0 bridge dispatches at least one queued overseer task to agent-board's runtime and reports completion status back to the queue.

- [ ] Chat-driven doc editing (TASKS/ROADMAP/FEATURES).
  - Priority: P2
  - Context: the per-repo chat panel (PR #196) only answers questions today — it rebuilds context and replies, but cannot act. ROADMAP.md still lists "manage TASKS/ROADMAP/FEATURES via chat" as open.
  - Acceptance Criteria: broken into stages — (1) chat can propose a specific, diffable edit to one doc file and show it inline before applying; (2) accepting the proposal opens a PR via the existing fix-doc PR flow rather than writing directly; (3) the chat can check an item off in TASKS.md or move it to FEATURES.md when the user confirms it's shipped, referencing the same parser the dashboard already uses so state never diverges from what's rendered elsewhere.

- [ ] Stale-review detector for PR readiness.
  - Priority: P2
  - Context: new idea (2026-08-28) — CodeRabbit (and likely other bot reviewers) sometimes leave a PR's formal review decision at `CHANGES_REQUESTED` even after every inline finding is resolved and CI is green, silently blocking branch-protection-gated auto-merge until a human notices.
  - Acceptance Criteria: for repos with a linked PR, surface a count/badge when `reviewDecision === CHANGES_REQUESTED` but all review threads are resolved and required checks pass; link directly to the PR so the discrepancy can be verified and merged or re-reviewed.

- [ ] Add cross-repo dependency mapping.
  - Priority: P2
  - Context: agent-board, bb-mcp, nitsuah-io, and overseer share overlapping stacks and could benefit from surfaced cross-repo links.
  - Acceptance Criteria: the dashboard shows inferred or declared connections between related repos and surfaces shared-stack signals; visualized as an interactive 3D graph with filter and click-to-detail interactions.

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

- [ ] Agent session receipts.
  - Priority: P3
  - Context: new idea (2026-08-28) — AI Summaries describe a repo's state; nothing describes what an agent *did* to it recently. Picking up mid-portfolio work today means reconstructing activity from commit messages and PR history by hand across every repo.
  - Acceptance Criteria: a lightweight per-repo activity log (commits, PRs opened/merged, files touched, review findings fixed vs. explicitly skipped-with-reason) surfaced in both the chat panel and the PMO view; sourced from GitHub data already synced, no new write path required.

<!--
AGENT INSTRUCTIONS:
1. Keep active items in In Progress and P1-P3 sections.
2. Keep task bullets short and scannable.
3. Move finished work into FEATURES.md, not a Done section here.
-->
