# Metrics

## Core Metrics

| Metric          | Value   | Notes                                                                                                                                                                                               |
| --------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code Coverage   | 86.66%  | Overall branch coverage (vitest). Breakdown: tasks.ts 87.5%, metrics.ts 85.29%, roadmap.ts 90%                                                                                                      |
| Build Time      | ~6s     | Local dev build                                                                                                                                                                                     |
| Bundle Size     | TBD     | Not measured yet                                                                                                                                                                                    |
| Test Files      | 6       | Includes unit tests and E2E tests                                                                                                                                                                   |
| Test Cases      | 8       | Auto-counted from test files (parser)                                                                                                                                                               |
| Database Tables | 8       | repos, tasks, roadmap_items, metrics, doc_status, features, best_practices, community_standards                                                                                                     |
| Repo Columns    | Updated | Added: total_loc, loc_language_breakdown, test_case_count, test_describe_count, ci_status, ci_last_run, ci_workflow_name, vuln_alert_count, vuln_critical_count, vuln_high_count, vuln_last_checked |
| API Routes      | 19      | Including auth, repos CRUD, fix operations, sync, debug, rate-limit, and admin utilities                                                                                                            |
| Utility Files   | 3       | lib/github-errors.ts (new), plus existing parsers and clients                                                                                                                                       |
| Docs Files      | 2       | GITHUB_OAUTH_ORG_ACCESS.md, OAUTH_ORG_FIX_SUMMARY.md (new)                                                                                                                                          |

## Health

| Metric        | Value      | Notes                |
| ------------- | ---------- | -------------------- |
| Open Issues   | 0          | GitHub issues        |
| PR Turnaround | < 1 day    | Typical merge time   |
| Skipped Tests | 0          | All tests enabled    |
| Health Score  | 95/100     | Overseer's own score |
| Last Updated  | 2025-11-27 | Last audit date      |

<!--
AGENT INSTRUCTIONS:
1. Update these metrics regularly (e.g., before a merge/last commit weekly or after major releases).
2. Use automated tools to fetch values where possible.
3. Keep this file focused on actual project metrics, not feature documentation.
4. For feature status tracking, see docs/AUDIT.md
5. For health score component breakdown, see FEATURES.md
-->
