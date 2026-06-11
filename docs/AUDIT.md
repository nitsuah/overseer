# Overseer Feature Audit

Last Updated: June 10, 2026

## Summary

Documentation and implementation are aligned across the project. Key validations:

- **Test Coverage**: 93.28% statement coverage (85.42% branch, 93.41% function, 94.06% line) — Docker-validated via `docker compose -f config/docker-compose.test.yml run --rm coverage`. 22 test files, 255 tests (254 passing, 1 skipped Gemini health check without API key).
- **Production OAuth**: Verified working on Netlify (NextAuth v5 + GitHub OAuth) — no longer a blocker.
- **AI / Gemini**: Multi-provider failover (Gemini, GPT-4, Claude) with auto-discovery, hot model swapping, and BYOK provider-order routing shipped (Q4 2025–Q1 2026) — see HANDOFF-byok-quota-provider-fallback-20260411.
- **Community Standards**: All 10 standards have templates and modal-based PR creation ✅
- **Documentation**: All 5 core docs (ROADMAP, TASKS, METRICS, FEATURES, README) have templates and modal-based PR creation ✅
- **Best Practices**: 4 of 10 template-based practices (Dependabot, Env Template, Docker, Netlify Badge) have modal-based PR creation ✅
- Centralized server-side logging via `lib/log.ts`; server routes and scripts use `logger` consistently.
- `.env.example` exists and is referenced in README and CONTRIBUTING; Dependabot and Docker are configured.
- **Security Enhancement**: Markdown rendering uses react-markdown with rehype-sanitize plugin for XSS protection ✅
- **Authentication UI**: Sync All button restricted to authenticated users only ✅
- **Docker Validation**: `docker build -t overseer-devops-check .` completes without real secrets injected at build time; runtime secrets are still required ✅

_For historical improvements and version history, see CHANGELOG.md._

## Feature Detection & Display Matrix

This matrix shows what Overseer tracks, how we detect it, health indicators, and automated fixes.

Modal-based fixes are reflected directly in the "Automated Fix" column (e.g., "✅ Modal").

| Feature/Metric               | Detection Method                                | Source         | Health Indicator | Automated | AI Improve |
| ---------------------------- | ----------------------------------------------- | -------------- | ---------------- | --------- | ---------- |
| **Core Docs**                |                                                 |                |                  |           |            |
| ROADMAP.md                   | File existence + parsing                        | GitHub API     | 4-state          | ✅ AI     | ❌ No      |
| TASKS.md                     | File existence + parsing                        | GitHub API     | 4-state          | ✅ AI     | ❌ No      |
| METRICS.md                   | File existence + parsing                        | GitHub API     | 4-state          | ✅ AI     | ❌ No      |
| FEATURES.md                  | File existence + parsing                        | GitHub API     | 4-state          | ✅ AI     | ❌ No      |
| README.md                    | File existence                                  | GitHub API     | 4-state          | ✅ AI     | ❌ No      |
| **Testing & Quality**        |                                                 |                |                  |           |            |
| Testing Framework            | Config file detection                           | File list scan | binary           | ❌ No     | ❌ No      |
| Test Files Count             | Pattern matching (.test., .spec., tests/)       | File list scan | Count display    | ❌ No     | ❌ No      |
| Test Cases Count             | Parse test files for it(), test() calls         | File parsing   | Count display    | ❌ No     | ❌ No      |
| CI/CD Build Status           | GitHub Actions API                              | GitHub API     | git-workflow     | ❌ No     | ❌ No      |
| Code Coverage                | METRICS.md parsing                              | Self-reported  | Percentage + bar | ❌ No     | ❌ No      |
| Code Coverage (DB)           | METRICS.md → repos.coverage_score               | Self-reported  | Percentage + bar | ❌ No     | ❌ No      |
| **Best Practices (10)**      |                                                 |                |                  |           |            |
| CI/CD                        | .github/workflows, .gitlab-ci.yml, netlify.toml | File list scan | binary           | ❌ No     | ❌ No      |
| Pre-commit Hooks             | .husky/, .git/hooks/                            | File list scan | binary           | ❌ No     | ❌ No      |
| Linting                      | .eslintrc, .prettierrc, biome.json              | File list scan | binary           | ❌ No     | ❌ No      |
| Branch Protection            | GitHub Branch Protection API                    | GitHub API     | 3-state          | ❌ No     | ❌ No      |
| Testing Framework            | Config files (vitest, jest, playwright, etc.)   | File list scan | binary           | ❌ No     | ❌ No      |
| .gitignore                   | File existence                                  | File list scan | binary           | ❌ No     | ❌ No      |
| Netlify Badge                | Badge URL in README                             | README content | binary           | ✅ AI     | ❌ No      |
| .env.example                 | File existence                                  | File list scan | binary           | ✅ AI     | ❌ No      |
| Dependabot                   | .github/dependabot.yml                          | File list scan | binary           | ✅ AI     | ❌ No      |
| Docker                       | Dockerfile, docker-compose.yml                  | File list scan | binary           | ✅ AI     | ❌ No      |
| **Community Standards (10)** |                                                 |                |                  |           |            |
| CODE_OF_CONDUCT.md           | File existence                                  | File list scan | binary           | ✅ AI     | ❌ No      |
| CONTRIBUTING.md              | File existence                                  | File list scan | binary           | ✅ AI     | ❌ No      |
| SECURITY.md                  | File existence                                  | File list scan | binary           | ✅ AI     | ❌ No      |
| LICENSE                      | File existence                                  | GitHub API     | binary           | ✅ AI     | ❌ No      |
| CHANGELOG.md                 | File existence                                  | GitHub API     | binary           | ✅ AI     | ❌ No      |
| Issue Templates              | .github/ISSUE_TEMPLATE/                         | File list scan | binary           | ✅ AI     | ❌ No      |
| PR Templates                 | .github/pull_request_template.md                | File list scan | binary           | ✅ AI     | ❌ No      |
| CODEOWNERS                   | .github/CODEOWNERS                              | File list scan | binary           | ✅ AI     | ❌ No      |
| Copilot Instructions         | .github/copilot-instructions.md                 | File list scan | binary           | ✅ AI     | ❌ No      |
| FUNDING                      | .github/FUNDING.yml                             | File list scan | binary           | ✅ AI     | ❌ No      |

### Legend

**Detection Method:**

- File existence: Check if file is present
- Pattern matching: Search for patterns in filenames
- Parsing: Parse file content and extract structured data
- GitHub API: Query GitHub REST API

**Source:**

- GitHub API: Direct from GitHub
- File list scan: Scan repository file tree
- Self-reported: From METRICS.md or similar
- Composite: Calculated from multiple sources

**Health Indicator:**

- 4-state: Missing, Dormant, Malformed, Healthy
- 3-state: Missing, Dormant, Healthy
- Binary: Healthy or Missing
- Percentage: 0-100% score
- Count: Numeric count
- Color-coded: Visual indicator based on thresholds
- git-workflow (Pass/Fail/Unknown with workflow name)

**Automated Fix:**

- ✅ Template PR: Create PR with template file
- ✅ Regenerate: Re-run generation
- ❌ No: No automated fix available
- N/A: Not applicable

**Status:**

- ✅: Fully implemented and displayed
- ⚠️ Partial: Implemented but not fully integrated
- ❌ Missing: Not implemented

## 🔴 Remaining Gaps

Sourced from ROADMAP.md / TASKS.md (updated 2026-06-08).

### 1. Gemini Reliability Polish (Q2 P1, In Progress)

`lib/ai-providers.ts` already has multi-provider failover, auto-discovery, and BYOK provider-order routing. Remaining work: clearer resilience around Gemini deprecations and provider switching, plus the optional follow-up from HANDOFF-byok-quota-provider-fallback — wire runtime quota detection to auto-toggle `GEMINI_QUOTA_EXCEEDED` without manual env changes.

**Priority**: P1 — in progress

### 2. Agent Prompt Templates in Auto-Fix Set (Q2 P1, In Progress)

`templates/.github/prompts/FLOW-TASKS.md` and `HANDOFF.md` have shipped but are not yet included in the community-standards fix-all-practices auto-fix set.

**Priority**: P1 — in progress

### 3. .github Fallback Resolution (Q2 P1, In Progress)

Community standards checks and fix-all behavior currently assume repo-local files. Should treat owner-level `.github` as canonical fallback for `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md` — health sync should mark those standards healthy when found in `owner/.github`, and fix-all should skip generating repo-local duplicates when the fallback exists.

**Priority**: P1 — in progress

### 4. Best Practices Fix Modal (Currently 4 of 10)

Current: 4 best practices have Fix buttons with modal preview — Dependabot ✅, .env.example ✅, Docker ✅, Netlify Badge ✅.

Tracked but no Fix buttons (6 remaining): CI/CD configuration, Pre-commit Hooks, Linting configuration, Branch Protection, Testing Framework, .gitignore.

**Priority**: MEDIUM - Would complete automated fix coverage for best practices

### 5. AI-Enhanced Community Standards (Dogfooding)

Overseer tracks these but doesn't have them itself at root. Could use AI to generate personalized versions:

- CODE_OF_CONDUCT.md (exists in templates/ only)
- SECURITY.md (exists in templates/ only)
- Issue Templates (exists in templates/ only)
- PR Template (not present in overseer root)

**Priority**: LOW - Templates exist, just need to apply them to overseer itself

### 6. Security Configuration Tracking (Q2 Roadmap)

From ROADMAP Q2 2026, not yet implemented:

- Security policy presence tracking
- Security advisory configuration
- Private vulnerability reporting status
- Dependabot alerts status (enabled/disabled), with severity weighting in the health score
- Code scanning alerts configuration
- Secret scanning alerts configuration / signal in health score

**Priority**: MEDIUM - Would complete the security visibility story

### 7. Cross-Repo Orchestration (Planned)

Per FEATURES.md "Planned" section: per-repo roadmap progress view, cross-repo dependency mapping, agent dispatch bridge to agent-board, MCP server endpoint (`get_repo_health`, `list_tasks`), webhook-driven sync.

**Priority**: Planned - Q3 2026 PMO Mode candidate

## 🚀 Recommended Next Steps

**Next Priority Items**:

1. Close out the 3 in-progress Q2 P1 items: Gemini reliability polish, agent prompt template auto-fix coverage, and `.github` fallback resolution.
2. Add security inputs to the health score (Dependabot severity weighting + secret-scanning signal) — completes the security visibility story (gap #6).
3. Expand the Best Practices Fix Modal to the remaining 6 checks (gap #4).
4. Begin scoping Q3 2026 PMO Mode (chat-driven TASKS/ROADMAP management, cross-repo orchestration) once the Q2 P1 items close.
