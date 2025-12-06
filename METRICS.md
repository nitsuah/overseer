# Metrics

## Core Metrics

| Metric              | Value  | Notes                                                                                                                                    |
| ------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Code Coverage       | 49.78% | Overall statement coverage (vitest). Branch: 44.55%. Parser subset: tasks.ts 80%, metrics.ts 70.21%, roadmap.ts 90%                      |
| Build Time          | ~6s    | Local dev build                                                                                                                          |
| Bundle Size         | TBD    | Not measured yet                                                                                                                         |
| Test Files          | 7      | Vitest unit tests (lib/parsers/\*.test.ts, tests/osrs-parser.test.ts, tests/gemini-health.test.ts, lib/github.test.ts)                   |
| Test Cases          | 12     | Vitest unit tests passing                                                                                                                |
| E2E Test Files      | 1      | Playwright E2E tests (tests/dashboard.spec.ts)                                                                                           |
| E2E Test Cases      | 5      | Playwright tests passing (unauthenticated state, performance)                                                                            |
| Database Tables     | 8      | repos, tasks, roadmap_items, metrics, doc_status, features, best_practices, community_standards                                          |
| Repo Columns        | 30+    | Including LOC, test counts, CI status, vulnerabilities, contributor analytics, template health tracking, subsection                      |
| API Routes          | 20+    | Including auth, repos CRUD, fix operations, sync, debug, rate-limit, and admin utilities                                                 |
| Utility Files       | 15+    | Including parsers (roadmap, tasks, features, metrics), github-errors.ts, github.ts, ai.ts, sync.ts, markdown-utils, and hooks            |
| Docs Files          | 15+    | Including core docs (README, ROADMAP, TASKS, FEATURES, METRICS, CHANGELOG), OAuth guides, templates, and PM.md agent instructions        |
| Component Files     | 30     | Dashboard, ExpandableRow, RepoTableRow, Header, GuidedTour, MarkdownPreview, detail sections (AI, Stats, Testing, Metrics, Issues, etc.) |
| Community Standards | 10     | CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, Issue/PR templates, CODEOWNERS, Copilot Instructions, FUNDING.yml           |
| Best Practices      | 10     | CI/CD, pre-commit hooks, linting, branch protection, testing, gitignore, deployment badge, env template, Dependabot, Docker               |

## Health

| Metric        | Value      | Notes                |
| ------------- | ---------- | -------------------- |
| Open Issues   | 0          | GitHub issues        |
| PR Turnaround | < 1 day    | Typical merge time   |
| Skipped Tests | 0          | All tests enabled    |
| Health Score  | 95/100     | Overseer's own score |
| Last Updated  | 2025-12-01 | Last audit date      |

<!--
AGENT INSTRUCTIONS:
1. Update these metrics regularly (e.g., before a merge/last commit weekly or after major releases).
2. Use automated tools to fetch values where possible.
3. Keep this file focused on actual project metrics, not feature documentation.
4. For feature status tracking, see docs/AUDIT.md
5. For health score component breakdown, see FEATURES.md
-->
