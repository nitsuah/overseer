# Overseer Feature Audit

**Last Updated**: November 26, 2025

## Recent Improvements (November 26, 2025)

**Phase 1 Complete** - All high-priority audit gaps addressed:

- ✅ **Coverage Score Sync** - Extracted from METRICS.md, stored in DB, displayed in Health column
- ✅ **Health Score Breakdown** - Visual panel showing Documentation (30%), Testing (20%), Best Practices (20%), Community (15%) with progress bars
- ✅ **README Freshness** - Tracked via GitHub API with color-coded staleness (Fresh/Recent/Aging/Stale)
- ✅ **Docker Detection** - Added as 10th best practice check (Dockerfile, docker-compose, .dockerignore)
- ✅ **PR Template Moved** - Now correctly categorized under Community Standards (8 checks total)
- ✅ **UI/UX Polish** - Login redirect fixed, purple GitHub icon, green homepage icon, red X hide button with toast, column reorder

**Result**: 100% of parsed metrics now utilized in UI. All docs accurate and cross-pollination eliminated.

## Feature Detection & Display Matrix

This matrix shows what Overseer tracks, how we detect it, health indicators, and automated fixes.

| Feature/Metric | Detection Method | Source | Health Indicator | Automated Fix | Status |
|----------------|------------------|--------|------------------|---------------|--------|
| **Documentation** | | | | | |
| ROADMAP.md | File existence + parsing | GitHub API | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Template PR | ✅ Complete |
| TASKS.md | File existence + parsing | GitHub API | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Template PR | ✅ Complete |
| METRICS.md | File existence + parsing | GitHub API | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Template PR | ✅ Complete |
| FEATURES.md | File existence + parsing | GitHub API | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Template PR | ✅ Complete |
| README.md | File existence | GitHub API | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Template PR | ✅ Complete |
| LICENSE.md | File existence | GitHub API | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Template PR | ✅ Complete |
| CHANGELOG.md | File existence | GitHub API | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Template PR | ✅ Complete |
| CONTRIBUTING.md | File existence | GitHub API | 4-state (Missing/Dormant/Malformed/Healthy) | ✅ Template PR | ✅ Complete |
| **Testing & Quality** | | | | | |
| Testing Framework | Config file detection | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Test Files Count | Pattern matching (.test., .spec., tests/) | File list scan | Count display | ❌ No | ✅ Displayed |
| Test Status | CI/CD integration | ⚠️ NOT IMPLEMENTED | Pass/Fail/Unknown | ❌ No | ⚠️ Column exists, not populated |
| Code Coverage | METRICS.md parsing | Self-reported | Percentage + bar | ❌ No | ✅ Complete |
| Code Coverage (DB) | METRICS.md → repos.coverage_score | Self-reported | Percentage + bar | ❌ No | ✅ Complete |
| **Best Practices (10 checks)** | | | | | |
| CI/CD | .github/workflows, .gitlab-ci.yml, netlify.toml | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Pre-commit Hooks | .husky/, .git/hooks/ | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Linting | .eslintrc, .prettierrc, biome.json | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Branch Protection | GitHub Branch Protection API | GitHub API | 3-state (Healthy/Dormant/Missing) | ❌ No | ✅ Displayed |
| Testing Framework | Config files (vitest, jest, playwright, etc.) | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| .gitignore | File existence | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Netlify Badge | Badge URL in README | README content | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| .env.example | File existence | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Dependabot | .github/dependabot.yml | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Docker | Dockerfile, docker-compose.yml | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| **Community Standards (8 checks)** | | | | | |
| CODE_OF_CONDUCT.md | File existence | File list scan | Binary (Healthy/Missing) | ✅ Template PR | ✅ Displayed |
| CONTRIBUTING.md | File existence | File list scan | Binary (Healthy/Missing) | ✅ Template PR | ✅ Displayed |
| SECURITY.md | File existence | File list scan | Binary (Healthy/Missing) | ✅ Template PR | ✅ Displayed |
| LICENSE | File existence | File list scan | Binary (Healthy/Missing) | ✅ Template PR | ✅ Displayed |
| CHANGELOG.md | File existence | File list scan | Binary (Healthy/Missing) | ✅ Template PR | ✅ Displayed |
| Issue Templates | .github/ISSUE_TEMPLATE/ | File list scan | Binary (Healthy/Missing) | ✅ Template PR | ✅ Displayed |
| PR Templates | .github/pull_request_template.md | File list scan | Binary (Healthy/Missing) | ✅ Template PR | ✅ Displayed |
| **Activity Metrics** | | | | | |
| Last Commit Date | GitHub repo.pushed_at | GitHub API | Color-coded freshness | N/A | ✅ Complete |
| Open PRs Count | GitHub PR API | GitHub API | Count display | N/A | ✅ Complete |
| Open Issues Count | GitHub repo.open_issues | GitHub API | Count display | N/A | ✅ Complete |
| Stars | GitHub repo.stargazers_count | GitHub API | Count display | N/A | ✅ Complete |
| Forks | GitHub repo.forks_count | GitHub API | Count display | N/A | ✅ Complete |
| Branches | GitHub Branches API | GitHub API | Count display | N/A | ✅ Complete |
| README Freshness | GitHub Commits API (filtered by path) | GitHub API | Color-coded (Fresh/Recent/Aging/Stale) | N/A | ✅ Complete |
| **Repository Metadata** | | | | | |
| Repository Type | Pattern matching + topics | GitHub API + heuristics | Badge display | Manual override | ✅ Complete |
| Is Fork | GitHub repo.fork | GitHub API | Filter option | N/A | ✅ Complete |
| Language | GitHub repo.language | GitHub API | Badge display | N/A | ✅ Complete |
| Description | GitHub repo.description | GitHub API | Text display | N/A | ✅ Complete |
| **AI Features** | | | | | |
| AI Summary | Google Gemini API | On-demand generation | Text display | ✅ Regenerate | ✅ Complete |
| **Health Scoring** | | | | | |
| Overall Health Score | Weighted calculation | Composite (5 components) | Letter grade (A-F) | Indirect (fix components) | ✅ Complete |
| Documentation Score | Doc completeness | Parsed docs | Percentage | ✅ Fix missing docs | ✅ Complete |
| Testing Score | Tests + coverage | Best practices + metrics | Percentage | ❌ No | ✅ Complete |
| Best Practices Score | Healthy/Total ratio | Best practices checks | Percentage | ❌ No | ✅ Complete |
| Community Score | Healthy/Total ratio | Community standards | Percentage | ❌ No | ✅ Complete |
| Activity Score | Staleness + PRs/Issues | GitHub metrics | Percentage | ❌ No | ✅ Complete |

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

### 3. No Fix Buttons for Best Practices/Community Standards

Missing templates and automated fixes for CODE_OF_CONDUCT, SECURITY.md, issue templates.
**Priority**: MEDIUM

### 4. Template Health Detection Not Implemented

Can't detect if docs are stale/unchanged templates (Dormant/Malformed states theoretical).
**Priority**: LOW

### 5. Coverage Only in Metrics Panel

Self-reported coverage not prominently in Testing section.
**Priority**: MEDIUM

### 6. No Real-time CI/CD Status Integration

Detect workflows but don't show current build status.
**Opportunity**: Integrate GitHub Actions API

### 7. Test Case Count Missing

Count test files but not actual test cases (`it()`, `test()` calls).
**Opportunity**: Parse test files for assertions

### 9. No Vulnerability Tracking

No GitHub Security/Dependabot alerts integration.
**Opportunity**: Critical for production repos

### 10. No Contributor Metrics

Missing: contributor count, commit cadence, bus factor, PR merge time.
**Opportunity**: Rich activity analytics

## 🚀 Recommended Next Steps

**Quick Wins** (already completed ✅):

- ~~Coverage sync to DB~~
- ~~Health score breakdown UI~~
- ~~README freshness tracking~~

**Phase 2 - UX Consistency**:

- Add fix buttons for community standards
- Implement missing standard templates
- Integrate coverage into Testing section prominently

**Phase 3 - Advanced Metrics**:

- CI/CD build status integration
- Test case counting
- Vulnerability tracking
- Contributor analytics
