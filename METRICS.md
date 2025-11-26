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
| Last Updated   | 2025-11-25 | Last audit date |

## Health Score Components

| Component              | Weight | Description |
| ---------------------- | ------ | ----------- |
| Documentation Health   | 30%    | TASKS.md, ROADMAP.md, FEATURES.md, METRICS.md, README.md, LICENSE.md, CHANGELOG.md, CONTRIBUTING.md |
| Testing & Quality      | 20%    | Test coverage, framework detection, CI/CD status |
| Best Practices         | 20%    | 10 checks: CI/CD, pre-commit, linting, branch protection, PR templates, testing, .gitignore, Netlify badge, .env.example, Dependabot |
| Community Standards    | 15%    | 7 checks: CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, Issue templates, PR templates |
| Activity & Engagement  | 15%    | Commit frequency, PR/Issue counts, contributor activity |

## Dashboard Features

| Feature                    | Status | Notes |
| -------------------------- | ------ | ----- |
| Repository Stats Display   | ✅     | Stars, forks, branches |
| Code Coverage Visualization| ✅     | Progress bars in table + detail |
| AI Summary Generation      | ✅     | Google Gemini integration |
| Default Repos              | ✅     | Always-visible demos |
| Activity Tracking          | ✅     | Last commit, PRs, issues |
| Documentation Health       | ✅     | 4-state model |
| OAuth Integration          | ✅     | GitHub OAuth (local/staging) |
| Features Parser            | ✅     | FEATURES.md parsing |
| Best Practices Detection   | ✅     | 10 automated checks |
| Community Standards Check  | ✅     | 7 automated checks |
| Document Health States     | ✅     | Missing/Dormant/Malformed/Healthy |
| Testing Framework Detection| ✅     | Config files + test file count |
| Health Score Calculation   | ✅     | 5-component weighted score |
| Health Score Breakdown Display | ⚠️ | Calculated but not displayed |
| Self-reported Coverage Sync| ⚠️    | Parsed but not stored in DB |
| Template Health Detection  | ❌     | Not implemented |
| CI/CD Build Status         | ❌     | Detection only, no live status |
| Vulnerability Tracking     | ❌     | Not integrated |

<!--
AGENT INSTRUCTIONS:
1. Update these metrics regularly (e.g., before a merge/last commit weekly or after major releases).
2. Use automated tools to fetch values where possible.
3. "Health Score" is a composite metric derived from the dashboard.
-->
