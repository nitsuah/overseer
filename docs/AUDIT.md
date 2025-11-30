# Overseer Feature Audit

Last Updated: November 30, 2025

## Summary

Documentation and implementation are aligned across the project. Key validations:

- **Community Standards**: All 10 standards have templates and modal-based PR creation ✅
- **Documentation**: All 5 core docs (ROADMAP, TASKS, METRICS, FEATURES, README) have templates and modal-based PR creation ✅
- **Best Practices**: All 4 template-based practices (Dependabot, Env Template, Docker, Netlify Badge) have modal-based PR creation ✅
- Centralized server-side logging via `lib/log.ts`; server routes and scripts use `logger` consistently.
- `.env.template` exists and is referenced in README and CONTRIBUTING; Dependabot and Docker are configured; README includes Netlify badge section.
- METRICS reflect current test suite: 4 test files, 8 tests; coverage is self-reported via METRICS.md.

## Recent Improvements (November 30, 2025)

**Phase 6 Complete** - PR Preview Modal & Community Standards:

- ✅ **PR Preview Modal** - All Fix/Fix All buttons now open modal with template preview before PR creation
- ✅ **Edit/Preview Mode** - Templates can be edited directly in modal before PR creation; supports markdown rendering with formatting
- ✅ **AI Template Enrichment** - AI Generate button enriches templates with repo-specific context (starting with CODEOWNERS)
- ✅ **Community Standards Templates** - Added all 10 templates (CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, CHANGELOG, LICENSE, CODEOWNERS, COPILOT, FUNDING, Issue Template, PR Template)
- ✅ **Single Batch PR** - Fix All modal combines all selected files into one PR instead of individual PRs per file
- ✅ **Middleware → Proxy Migration** - Completed Next.js 16 proxy convention migration, removed deprecated middleware
- ✅ **Template Aliases** - Added copilot_instructions, pull_request_template, issue_templates aliases for endpoint compatibility
- ✅ **Fix All Standards Logic** - Expanded to support all 10 community standards in batch preview/creation flow

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

| Feature/Metric                      | Detection Method                                | Source                   | Health Indicator                            | Automated Fix             | AI Enrichment | Status       |
| ----------------------------------- | ----------------------------------------------- | ------------------------ | ------------------------------------------- | ------------------------- | ------------- | ------------ |
| **Documentation**                   |                                                 |                          |                                             |                           |               |              |
| ROADMAP.md                          | File existence + parsing                        | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ⏳ Planned    | ✅           |
| TASKS.md                            | File existence + parsing                        | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ⏳ Planned    | ✅           |
| METRICS.md                          | File existence + parsing                        | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ⏳ Planned    | ✅           |
| FEATURES.md                         | File existence + parsing                        | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ⏳ Planned    | ✅           |
| README.md                           | File existence                                  | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ⏳ Planned    | ✅           |
| LICENSE                             | File existence                                  | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅            |
| CHANGELOG.md                        | File existence                                  | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅            |
| CONTRIBUTING.md                     | File existence                                  | GitHub API               | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Modal                  | ✅            |
| **Testing & Quality**               |                                                 |                          |                                             |                           |               |
| Testing Framework                   | Config file detection                           | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed  |
| Test Files Count                    | Pattern matching (.test., .spec., tests/)       | File list scan           | Count display                               | ❌ No                     | ✅ Displayed  |
| Test Cases Count                    | Parse test files for it(), test() calls         | File content parsing     | Count display                               | ❌ No                     | ✅            |
| CI/CD Build Status                  | GitHub Actions API                              | GitHub API               | Pass/Fail/Unknown with workflow name        | ❌ No                     | ✅            |
| Code Coverage                       | METRICS.md parsing                              | Self-reported            | Percentage + bar                            | ❌ No                     | ✅            |
| Code Coverage (DB)                  | METRICS.md → repos.coverage_score               | Self-reported            | Percentage + bar                            | ❌ No                     | ✅            |
| **Best Practices (10 checks)**      |                                                 |                          |                                             |                           |               |
| CI/CD                               | .github/workflows, .gitlab-ci.yml, netlify.toml | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed  |
| Pre-commit Hooks                    | .husky/, .git/hooks/                            | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed  |
| Linting                             | .eslintrc, .prettierrc, biome.json              | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed  |
| Branch Protection                   | GitHub Branch Protection API                    | GitHub API               | 3-state (Healthy/Dormant/Missing)           | ❌ No                     | ✅ Displayed  |
| Testing Framework                   | Config files (vitest, jest, playwright, etc.)   | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed  |
| .gitignore                          | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ❌ No                     | ✅ Displayed  |
| Netlify Badge                       | Badge URL in README                             | README content           | Binary (Healthy/Missing)                    | ✅ Modal Modify README    | ✅ Displayed  |
| .env.example                        | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed  |
| Dependabot                          | .github/dependabot.yml                          | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed  |
| Docker                              | Dockerfile, docker-compose.yml                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Displayed  |
| **Community Standards (10 checks)** |                                                 |                          |                                             |                           |               |              |
| CODE_OF_CONDUCT.md                  | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ❌ Not Needed | ✅ Displayed |
| CONTRIBUTING.md                     | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ⏳ Planned    | ✅ Displayed |
| SECURITY.md                         | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ⏳ Planned    | ✅ Displayed |
| LICENSE                             | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ❌ Not Needed | ✅ Displayed |
| CHANGELOG.md                        | File existence                                  | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ❌ Not Needed | ✅ Displayed |
| Issue Templates                     | .github/ISSUE_TEMPLATE/                         | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ⏳ Planned    | ✅ Displayed |
| PR Templates                        | .github/pull_request_template.md                | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ⏳ Planned    | ✅ Displayed |
| CODEOWNERS                          | .github/CODEOWNERS                              | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ✅ Active     | ✅ Displayed |
| Copilot Instructions                | .github/copilot-instructions.md                 | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ⏳ High Prio  | ✅ Displayed |
| FUNDING                             | .github/FUNDING.yml                             | File list scan           | Binary (Healthy/Missing)                    | ✅ Modal                  | ❌ Not Needed | ✅ Displayed |
| **Activity Metrics**                |                                                 |                          |                                             |                           |               |
| Last Commit Date                    | GitHub repo.pushed_at                           | GitHub API               | Color-coded freshness                       | N/A                       | ✅            |
| Open PRs Count                      | GitHub PR API                                   | GitHub API               | Count display                               | N/A                       | ✅            |
| Open Issues Count                   | GitHub repo.open_issues                         | GitHub API               | Count display                               | N/A                       | ✅            |
| Stars                               | GitHub repo.stargazers_count                    | GitHub API               | Count display                               | N/A                       | ✅            |
| Forks                               | GitHub repo.forks_count                         | GitHub API               | Count display                               | N/A                       | ✅            |
| Branches                            | GitHub Branches API                             | GitHub API               | Count display                               | N/A                       | ✅            |
| README Freshness                    | GitHub Commits API (filtered by path)           | GitHub API               | Color-coded (Fresh/Recent/Aging/Stale)      | N/A                       | ✅            |
| **Advanced Metrics**                |                                                 |                          |                                             |                           |               |
| Lines of Code (LOC)                 | GitHub Language Stats API                       | GitHub API               | Total with K suffix formatting              | N/A                       | ✅            |
| LOC Language Breakdown              | GitHub Language Stats API                       | GitHub API               | JSON with language percentages              | N/A                       | ✅            |
| Vulnerability Alerts                | GitHub Security/Dependabot API                  | GitHub API               | Count with severity color-coding            | N/A                       | ✅            |
| Critical Vulnerabilities            | GitHub Security/Dependabot API                  | GitHub API               | Count display (red highlight)               | N/A                       | ✅            |
| High Vulnerabilities                | GitHub Security/Dependabot API                  | GitHub API               | Count display (orange highlight)            | N/A                       | ✅            |
| **Contributor Analytics**           |                                                 |                          |                                             |                           |               |
| Contributor Count                   | GitHub Contributors API                         | GitHub API               | Count display                               | N/A                       | ✅            |
| Commit Frequency                    | GitHub Commit Activity API                      | GitHub API               | Commits/week (last 12 weeks avg)            | N/A                       | ✅            |
| Bus Factor                          | Contributor concentration (80/20 rule)          | Calculated from API      | Count of contributors for 80% commits       | N/A                       | ✅            |
| PR Merge Time                       | GitHub PR API (last 30 merged)                  | GitHub API               | Average hours from creation to merge        | N/A                       | ✅            |
| **Repository Metadata**             |                                                 |                          |                                             |                           |               |
| Repository Type                     | Pattern matching + topics                       | GitHub API + heuristics  | Badge display                               | Manual override           | ✅            |
| Is Fork                             | GitHub repo.fork                                | GitHub API               | Filter option                               | N/A                       | ✅            |
| Language                            | GitHub repo.language                            | GitHub API               | Badge display                               | N/A                       | ✅            |
| Description                         | GitHub repo.description                         | GitHub API               | Text display                                | N/A                       | ✅            |
| **AI Features**                     |                                                 |                          |                                             |                           |               |
| AI Summary                          | Google Gemini API                               | On-demand generation     | Text display                                | ✅ Regenerate             | ✅            |
| **Error Handling & UX**             |                                                 |                          |                                             |                           |               |
| OAuth Error Detection               | Error message pattern matching                  | GitHub API errors        | User-friendly error messages                | N/A                       | ✅            |
| Organization Access Restrictions    | OAuth restriction error parsing                 | GitHub API errors        | Toast + console + auto-redirect             | ✅ User authorization     | ✅            |
| Permission Errors                   | 403/404 error parsing                           | GitHub API errors        | User-friendly error messages                | N/A                       | ✅            |
| Rate Limit Errors                   | X-RateLimit headers                             | GitHub API errors        | User-friendly error messages                | N/A                       | ✅            |
| Template Path Resolution            | Enhanced logging                                | API endpoint debugging   | Console diagnostic logs                     | N/A                       | ✅            |
| **Health Scoring**                  |                                                 |                          |                                             |                           |               |
| Overall Health Score                | Weighted calculation                            | Composite (5 components) | Letter grade (A-F)                          | Indirect (fix components) | ✅            |
| Documentation Score                 | Doc completeness                                | Parsed docs              | Percentage                                  | ✅ Fix missing docs       | ✅            |
| Testing Score                       | Tests + coverage                                | Best practices + metrics | Percentage                                  | ❌ No                     | ✅            |
| Best Practices Score                | Healthy/Total ratio                             | Best practices checks    | Percentage                                  | ❌ No                     | ✅            |
| Community Score                     | Healthy/Total ratio                             | Community standards      | Percentage                                  | ❌ No                     | ✅            |
| Activity Score                      | Staleness + PRs/Issues                          | GitHub metrics           | Percentage                                  | ❌ No                     | ✅            |

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

- ✅: Fully implemented and displayed
- ⚠️ Partial: Implemented but not fully integrated
- ❌ Missing: Not implemented

## 🔴 Remaining Gaps

### 1. Documentation Fix Modal (5 docs with templates)

Current: 5 core documentation files have Fix buttons with modal preview:

- ROADMAP.md ✅
- TASKS.md ✅
- METRICS.md ✅
- FEATURES.md ✅
- README.md ✅

Additional docs tracked but not yet with Fix buttons:

- CONTRIBUTING.md (tracked in both docs and community standards)

### 4. Security Configuration Tracking (Phase 7)ty standards)

- LICENSE (tracked in both docs and community standards)

**Priority**: LOW - Already covered via Community Standards section

### 2. Best Practices Fix Modal (Currently 4, could expand)

Current: 4 best practices have Fix buttons with modal preview:

- Dependabot ✅
- .env.example ✅
- Docker ✅
- Netlify Badge ✅

Tracked but no Fix buttons (6 remaining):

- CI/CD configuration
- Pre-commit Hooks
- Linting configuration
- Branch Protection
- Testing Framework
- .gitignore

**Priority**: MEDIUM - Would complete automated fix coverage for best practices

### 3. AI-Enhanced Community Standards (Dogfooding)

Overseer tracks these but doesn't have them itself at root. Could use AI to generate personalized versions:

- CODE_OF_CONDUCT.md (exists in templates/ only)
- SECURITY.md (exists in templates/ only)
- Issue Templates (exists in templates/ only)
- PR Template (not present in overseer root)

**Priority**: LOW - Templates exist, just need to apply them to overseer itself

### 4. Security Configuration Tracking (Phase 7)

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
