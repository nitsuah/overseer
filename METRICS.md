# Metrics

## Core Metrics

| Metric         | Value  | Notes |
| -------------- | ------ | ----- |
| Code Coverage  | 87.5% (branch) / 100% (statements) | Parser tests (vitest) |
| Build Time     | ~6s    | Local dev build |
| Bundle Size    | TBD    | Not measured yet |
| Test Files     | 4      | Manual count - auto-detection available |
| Test Cases     | 8      | Manual count - auto-detection not implemented |
| Database Tables| 8      | repos, tasks, roadmap_items, metrics, doc_status, features, best_practices, community_standards |
| API Routes     | 15     | Including sub-routes for repos |

## Health

| Metric         | Value    | Notes |
| -------------- | -------- | ----- |
| Open Issues    | 0        | GitHub issues |
| PR Turnaround  | < 1 day  | Typical merge time |
| Skipped Tests  | 0        | All tests enabled |
| Health Score   | 95/100   | Overseer's own score |
| Last Updated   | 2025-11-26 | Last audit date |

<!--
AGENT INSTRUCTIONS:
1. Update these metrics regularly (e.g., before a merge/last commit weekly or after major releases).
2. Use automated tools to fetch values where possible.
3. Keep this file focused on actual project metrics, not feature documentation.
4. For feature status tracking, see docs/AUDIT.md
5. For health score component breakdown, see FEATURES.md
-->
