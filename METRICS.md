# Metrics

## Core Metrics

| Metric              | Value  | Notes                                                                                                                                  |
| ------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Code Coverage       | 60.21% | Overall statement coverage (vitest). Branch: 60.45%. Utility files: date-utils 100%, log 100%, repo-type 100%, health-score 74.28%     |
| Build Time          | ~6s    | Local dev build                                                                                                                        |
| Bundle Size         | TBD    | Not measured yet                                                                                                                       |
| Test Files          | 13     | Vitest unit tests (9 passing: parsers, utils, github; 1 failing: gemini-health due to model deprecation)                               |
| Test Cases          | 92     | Vitest unit tests passing (date-utils: 24, repo-type: 40, health-score: 11, log: 6, parsers: 8, github: 3)                             |
| E2E Test Files      | 1      | Playwright E2E tests (tests/dashboard.spec.ts)                                                                                         |
| E2E Test Cases      | 5      | Playwright tests passing (unauthenticated state, performance)                                                                          |
| Database Tables     | 8      | repos, tasks, roadmap_items, metrics, doc_status, features, best_practices, community_standards                                        |
| Repo Columns        | 30+    | Including LOC, test counts, CI status, vulnerabilities, contributor analytics, template health tracking, subsection                    |
| API Routes          | 25+    | Including auth, repos CRUD, fix operations, sync, debug, rate-limit, enrich-template, generate-best-practice, and admin utilities      |
| Utility Files       | 20+    | Including parsers (roadmap, tasks, features, metrics), github.ts, ai.ts, ai-prompt-chain.ts, ai-failover.ts, sync.ts, date-utils, etc. |
| Docs Files          | 15+    | Including core docs (README, ROADMAP, TASKS, FEATURES, METRICS, CHANGELOG), OAuth guides, templates, and PM.md agent instructions      |
| Component Files     | 30+    | Dashboard, ExpandableRow, Header, GuidedTour, MarkdownPreview, PRPreviewModal, DiffView, detail sections, Toast notifications          |
| Community Standards | 10     | CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, Issue/PR templates, CODEOWNERS, Copilot Instructions, FUNDING.yml         |
| Best Practices      | 10     | CI/CD, pre-commit hooks, linting, branch protection, testing, gitignore, deployment badge, env template, Dependabot, Docker            |

## Health

| Metric        | Value      | Notes                                   |
| ------------- | ---------- | --------------------------------------- |
| Open Issues   | 0          | GitHub issues                           |
| PR Turnaround | < 1 day    | Typical merge time                      |
| Skipped Tests | 1          | gemini-health (model deprecation issue) |
| Health Score  | 95/100     | Overseer's own score                    |
| Last Updated  | 2025-12-07 | Last audit date                         |

<!--
AGENT INSTRUCTIONS:
1. Update these metrics regularly (e.g., before a merge/last commit weekly or after major releases).
2. Use automated tools to fetch values where possible.
3. Keep this file focused on actual project metrics, not feature documentation.
4. For feature status tracking, see docs/AUDIT.md
5. For health score component breakdown, see FEATURES.md
-->
