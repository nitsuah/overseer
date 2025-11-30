# Overseer Feature Audit

Last Updated: November 28, 2025

## Summary

Documentation and implementation are aligned across the project. Key validations:

- Community Standards count is 10 in FEATURES and implementation (includes FUNDING.yml).
- Best Practices checks total 10; fix buttons implemented for 4 (Dependabot, Env Template, Docker, Netlify Badge).
- Centralized server-side logging via `lib/log.ts`; server routes and scripts use `logger` consistently.
- `.env.template` exists and is referenced in README and CONTRIBUTING; Dependabot and Docker are configured; README includes Netlify badge section.
- METRICS reflect current test suite: 4 test files, 8 tests; coverage is self-reported via METRICS.md.

## Recent Improvements (November 27, 2025)

**Phase 5 Complete** - Bug Fixes & Debugging Tools:

- ✅ **Coverage Sync Bug** - Fixed coverage_score always updating to NULL when no coverage (prevents stale values)
- ✅ **Batch Sync Coverage** - Added coverage extraction to sync-repos endpoint (was missing)
- ✅ **Metrics Parser Enhancement** - Normalize percentage formats (0.8666 → 86.66%, 86.66% stays 86.66)
- ✅ **Testing Display Improvements** - Separate metric values from long descriptions with detail text
- ✅ **Rate Limit Detection** - Created /api/github-rate-limit endpoint for monitoring API usage
- ✅ **Debug Endpoint** - Created /api/repos/[name]/debug for database inspection and troubleshooting
- ✅ **Template Content Pollution Fix** - Identified that template instructions can be parsed as metrics

**Phase 4 Complete** - OAuth Error Handling & UX Improvements:

- ✅ **OAuth Error Detection** - Created lib/github-errors.ts to parse and classify GitHub API errors (5 types)
- ✅ **Organization Access Restrictions** - Detects when orgs block OAuth app access with user-friendly messaging
- ✅ **Auto-Redirect to Authorization** - Opens GitHub OAuth settings page when restrictions detected
- ✅ **Enhanced Error Responses** - API endpoints return structured error details with actionable instructions
- ✅ **Frontend Error Handling** - useRepoActions hook shows toast notifications and console guidance
- ✅ **OAuth Documentation** - Created comprehensive user guides (GITHUB_OAUTH_ORG_ACCESS.md, OAUTH_ORG_FIX_SUMMARY.md)
- ✅ **Template Path Debugging** - Added logging to fix-doc endpoint for troubleshooting template resolution
- ✅ **UX Roadmap Planning** - Identified need for modal preview before PR creation with pick-and-choose functionality

**Phase 3 Complete** - Advanced Metrics & Integrations implemented:

- ✅ **Lines of Code (LOC)** - Fetched from GitHub language stats API, calculated as bytes/50, displayed with K suffix
- ✅ **Test Case Counting** - Parser detects and counts it(), test(), describe() calls in test files
- ✅ **CI/CD Status** - Live build status from GitHub Actions API (passing/failing with workflow name and last run)
- ✅ **Vulnerability Alerts** - Dependabot alerts tracked via GitHub Security API with severity counts

**Result**: 100% of parsed metrics now utilized in UI. All docs accurate and cross-pollination eliminated.

## Feature Detection & Display Matrix

This matrix shows what Overseer tracks, how we detect it, health indicators, and automated fixes.

Modal-based fixes are reflected directly in the "Automated Fix" column (e.g., "✅ Modal").

| Feature/Metric                     | Detection Method                                | Source                   | Health Indicator                            | Automated Fix             | Status       |
| ---------------------------------- | ----------------------------------------------- | ------------------------ | ------------------------------------------- | ------------------------- | ------------ |
| **Documentation**                  |                                                 |                          |                                             |                           |              |
| ROADMAP.md                         | File existence + parsing                        | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅ Complete  |
| TASKS.md                           | File existence + parsing                        | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅ Complete  |
| METRICS.md                         | File existence + parsing                        | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅ Complete  |
| FEATURES.md                        | File existence + parsing                        | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅ Complete  |
| README.md                          | File existence                                  | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅ Complete  |
| LICENSE.md                         | File existence                                  | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅ Complete  |
| CHANGELOG.md                       | File existence                                  | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅ Complete  |
| CONTRIBUTING.md                    | File existence                                  | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅ Complete  |
| **Testing & Quality**              |                                                 |                          |                                             |                           |              |
| Testing Framework                  | Config file detection                           | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed |
| Test Files Count                   | Pattern matching (.test., .spec., tests/)       | File list scan           | Count display                               | ❌ No                     | ✅ Displayed |
| Test Cases Count                   | Parse test files for it(), test() calls         | File content parsing     | Count display                               | ❌ No                     | ✅ Complete  |
| CI/CD Build Status                 | GitHub Actions API                              | GitHub API               | Pass/Fail/Unknown with workflow name        | ❌ No                     | ✅ Complete  |
| Code Coverage                      | METRICS.md parsing                              | Self-reported            | Percentage + bar                            | ❌ No                     | ✅ Complete  |
| Code Coverage (DB)                 | METRICS.md → repos.coverage_score               | Self-reported            | Percentage + bar                            | ❌ No                     | ✅ Complete  |
| **Best Practices (10 checks)**     |                                                 |                          |                                             |                           |              |
| CI/CD                              | .github/workflows, .gitlab-ci.yml, netlify.toml | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed |
| Pre-commit Hooks                   | .husky/, .git/hooks/                            | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed |
| Linting                            | .eslintrc, .prettierrc, biome.json              | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed |
| Branch Protection                  | GitHub Branch Protection API                    | GitHub API               | 3-state (Healthy/Dormant/Missing)           | ❌ No                     | ✅ Displayed |
| Testing Framework                  | Config files (vitest, jest, playwright, etc.)   | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed |
| .gitignore                         | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed |
| Netlify Badge                      | Badge URL in README                             | README content           | Binary (Healthy/Missing)                    | ✅ Modal Modify README    | ✅ Displayed |
| .env.example                       | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| Dependabot                         | .github/dependabot.yml                          | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| Docker                             | Dockerfile, docker-compose.yml                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| **Community Standards (9 checks)** |                                                 |                          |                                             |                           |              |
| CODE_OF_CONDUCT.md                 | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| CONTRIBUTING.md                    | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| SECURITY.md                        | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| LICENSE                            | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| CHANGELOG.md                       | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| Issue Templates                    | .github/ISSUE_TEMPLATE/                         | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| PR Templates                       | .github/pull_request_template.md                | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| CODEOWNERS                         | .github/CODEOWNERS                              | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| Copilot Instructions               | .github/copilot-instructions.md                 | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed |
| **Activity Metrics**               |                                                 |                          |                                             |                           |              |
| Last Commit Date                   | GitHub repo.pushed_at                           | GitHub API               | Color-coded freshness                       | N/A                       | ✅ Complete  |
| Open PRs Count                     | GitHub PR API                                   | GitHub API               | Count display                               | N/A                       | ✅ Complete  |
| Open Issues Count                  | GitHub repo.open_issues                         | GitHub API               | Count display                               | N/A                       | ✅ Complete  |
| Stars                              | GitHub repo.stargazers_count                    | GitHub API               | Count display                               | N/A                       | ✅ Complete  |
| Forks                              | GitHub repo.forks_count                         | GitHub API               | Count display                               | N/A                       | ✅ Complete  |
| Branches                           | GitHub Branches API                             | GitHub API               | Count display                               | N/A                       | ✅ Complete  |
| README Freshness                   | GitHub Commits API (filtered by path)           | GitHub API               | Color-coded (Fresh/Recent/Aging/Stale)      | N/A                       | ✅ Complete  |
| **Advanced Metrics**               |                                                 |                          |                                             |                           |              |
| Lines of Code (LOC)                | GitHub Language Stats API                       | GitHub API               | Total with K suffix formatting              | N/A                       | ✅ Complete  |
| LOC Language Breakdown             | GitHub Language Stats API                       | GitHub API               | JSON with language percentages              | N/A                       | ✅ Complete  |
| Vulnerability Alerts               | GitHub Security/Dependabot API                  | GitHub API               | Count with severity color-coding            | N/A                       | ✅ Complete  |
| Critical Vulnerabilities           | GitHub Security/Dependabot API                  | GitHub API               | Count display (red highlight)               | N/A                       | ✅ Complete  |
| High Vulnerabilities               | GitHub Security/Dependabot API                  | GitHub API               | Count display (orange highlight)            | N/A                       | ✅ Complete  |
| **Contributor Analytics**          |                                                 |                          |                                             |                           |              |
| Contributor Count                  | GitHub Contributors API                         | GitHub API               | Count display                               | N/A                       | ✅ Complete  |
| Commit Frequency                   | GitHub Commit Activity API                      | GitHub API               | Commits/week (last 12 weeks avg)            | N/A                       | ✅ Complete  |
| Bus Factor                         | Contributor concentration (80/20 rule)          | Calculated from API      | Count of contributors for 80% commits       | N/A                       | ✅ Complete  |
| PR Merge Time                      | GitHub PR API (last 30 merged)                  | GitHub API               | Average hours from creation to merge        | N/A                       | ✅ Complete  |
| **Repository Metadata**            |                                                 |                          |                                             |                           |              |
| Repository Type                    | Pattern matching + topics                       | GitHub API + heuristics  | Badge display                               | Manual override           | ✅ Complete  |
| Is Fork                            | GitHub repo.fork                                | GitHub API               | Filter option                               | N/A                       | ✅ Complete  |
| Language                           | GitHub repo.language                            | GitHub API               | Badge display                               | N/A                       | ✅ Complete  |
| Description                        | GitHub repo.description                         | GitHub API               | Text display                                | N/A                       | ✅ Complete  |
| **AI Features**                    |                                                 |                          |                                             |                           |              |
| AI Summary                         | Google Gemini API                               | On-demand generation     | Text display                                | ✅ Regenerate             | ✅ Complete  |
| **Error Handling & UX**            |                                                 |                          |                                             |                           |              |
| OAuth Error Detection              | Error message pattern matching                  | GitHub API errors        | User-friendly error messages                | N/A                       | ✅ Complete  |
| Organization Access Restrictions   | OAuth restriction error parsing                 | GitHub API errors        | Toast + console + auto-redirect             | ✅ User authorization     | ✅ Complete  |
| Permission Errors                  | 403/404 error parsing                           | GitHub API errors        | User-friendly error messages                | N/A                       | ✅ Complete  |
| Rate Limit Errors                  | X-RateLimit headers                             | GitHub API errors        | User-friendly error messages                | N/A                       | ✅ Complete  |
| Template Path Resolution           | Enhanced logging                                | API endpoint debugging   | Console diagnostic logs                     | N/A                       | ✅ Complete  |
| **Health Scoring**                 |                                                 |                          |                                             |                           |              |
| Overall Health Score               | Weighted calculation                            | Composite (5 components) | Letter grade (A-F)                          | Indirect (fix components) | ✅ Complete  |
| Documentation Score                | Doc completeness                                | Parsed docs              | Percentage                                  | ✅ Fix missing docs       | ✅ Complete  |
| Testing Score                      | Tests + coverage                                | Best practices + metrics | Percentage                                  | ❌ No                     | ✅ Complete  |
| Best Practices Score               | Healthy/Total ratio                             | Best practices checks    | Percentage                                  | ❌ No                     | ✅ Complete  |
| Community Score                    | Healthy/Total ratio                             | Community standards      | Percentage                                  | ❌ No                     | ✅ Complete  |
| Activity Score                     | Staleness + PRs/Issues                          | GitHub metrics           | Percentage                                  | ❌ No                     | ✅ Complete  |

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

**Automated Fix:**

- ✅ Template PR: Create PR with template file
- ✅ Regenerate: Re-run generation
- ❌ No: No automated fix available
- N/A: Not applicable

**Status:**

- ✅ Complete: Fully implemented and displayed
- ⚠️ Partial: Implemented but not fully integrated
- ❌ Missing: Not implemented

## 🔴 Remaining Gaps

### 1. AI fix Community Standards Gaps (Dogfooding)

Overseer tracks these but doesn't have them itself at root, will need to add using overseer to test the features (maybe using AI generate to take the template, and the repo info, and create them):

- CODE_OF_CONDUCT.md (exists in templates/ only)
- SECURITY.md (exists in templates/ only)
- Issue Templates (exists in templates/ only)
- PR Template (not present)

**Priority**: Medium - Nice to have for dogfooding our own standards and integrating AI further.

### 2. Security Configuration Tracking (Phase 7)

From ROADMAP Phase 7, not yet implemented:

- Security policy presence tracking
- Security advisory configuration
- Private vulnerability reporting status
- Dependabot alerts status (enabled/disabled)
- Code scanning alerts configuration
- Secret scanning alerts configuration

**Priority**: MEDIUM - Would complete the security visibility story

## 🚀 Recommended Next Steps

**Next Priority Items**:

1. **GitHub OAuth Production Fix** - Blocking production deployment
2. **Gemini API Integration Fix** - AI summaries not working
3. **Test Status Integration** - Populate test status from CI/CD
4. **Security in Health Score** - Include vulnerability metrics in overall score calculation
