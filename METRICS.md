# Metrics

Last Validated: 2026-04-13 (Overseer/PM compliance review)
Health Score: 95/100
Compliance: Overseer/PM core metrics and health scoring validated for Q2 2026

## Core Metrics

| Metric              | Value  | Notes                                                                                                                                          |
| ------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Code Coverage       | 62.50% | Overall statement coverage from `docker compose -f docker-compose.test.yml run --rm coverage`. Branch: 64.68%, Function: 63.44%, Line: 61.42%. |
| Build Time          | ~6s    | Local dev build                                                                                                                                |
| Bundle Size         | TBD    | Not measured yet                                                                                                                               |
| Test Files          | 19     | All vitest test files passing in Docker; parser, repo intelligence, API route, badge, and web3 detection coverage included.                    |
| Test Cases          | 200    | Docker coverage run reports 200 passing tests and 1 skipped Gemini health check when no API key is provided.                                   |
| E2E Test Files      | 1      | Playwright E2E tests (tests/dashboard.spec.ts)                                                                                                 |
| E2E Test Cases      | 5      | Playwright tests passing (unauthenticated state, performance)                                                                                  |
| Database Tables     | 8      | repos, tasks, roadmap_items, metrics, doc_status, features, best_practices, community_standards                                                |
| Repo Columns        | 30+    | Including LOC, test counts, CI status, vulnerabilities, contributor analytics, template health tracking, subsection                            |
| API Routes          | 25+    | Including auth, repos CRUD, fix operations, sync, debug, rate-limit, enrich-template, generate-best-practice, and admin utilities              |
| Utility Files       | 20+    | Including parsers (roadmap, tasks, features, metrics), github.ts, ai.ts, ai-prompt-chain.ts, ai-failover.ts, sync.ts, date-utils, etc.         |
| Docs Files          | 15+    | Including core docs (README, ROADMAP, TASKS, FEATURES, METRICS, CHANGELOG), OAuth guides, templates, and PM.md agent instructions              |
| Component Files     | 30+    | Dashboard, ExpandableRow, Header, GuidedTour, MarkdownPreview, PRPreviewModal, DiffView, detail sections, Toast notifications                  |
| Community Standards | 10     | CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, Issue/PR templates, CODEOWNERS, Copilot Instructions, FUNDING.yml                 |
| Best Practices      | 10     | CI/CD, pre-commit hooks, linting, branch protection, testing, gitignore, deployment badge, env template, Dependabot, Docker                    |

## Health

| Metric        | Value      | Notes                                     |
| ------------- | ---------- | ----------------------------------------- |
| Open Issues   | 0          | GitHub issues                             |
| PR Turnaround | < 1 day    | Typical merge time                        |
| Skipped Tests | 1          | Gemini health check skips without API key |
| Health Score  | 95/100     | Overseer's own score                      |
| Last Updated  | 2026-03-27 | Docker test/audit refresh                 |

## Verification

- Coverage command: `docker compose -f docker-compose.test.yml run --rm coverage`
- Docker build smoke test: `docker build -t overseer-devops-check .`
- Production image note: the Docker build now uses placeholder auth values only during the build stage; runtime containers still require real auth secrets.

<!--
AGENT INSTRUCTIONS:
1. Update these metrics regularly (e.g., before a merge/last commit weekly or after major releases).
2. Use automated tools to fetch values where possible.
3. Keep this file focused on actual project metrics, not feature documentation.
4. For feature status tracking, see docs/AUDIT.md
5. For health score component breakdown, see FEATURES.md
-->
