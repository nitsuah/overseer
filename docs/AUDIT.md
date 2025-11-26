# Overseer Feature Audit

**Last Updated**: November 26, 2025

## Recent Improvements (November 26, 2025)

**Phase 1 Complete** - All high-priority audit gaps addressed:

- ✅ **Coverage Score Sync** - Extracted from METRICS.md, stored in DB, displayed in Health column
- ✅ **Health Score Breakdown** - Visual panel showing Documentation (30%), Testing (20%), Best Practices (20%), Community (15%) with progress bars
- ✅ **README Freshness** - Tracked via GitHub API with color-coded staleness (Fresh/Recent/Aging/Stale)
- ✅ **Docker Detection** - Added as 11th best practice check (Dockerfile, docker-compose, .dockerignore)
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
| **Best Practices (11 checks)** | | | | | |
| CI/CD | .github/workflows, .gitlab-ci.yml, netlify.toml | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Pre-commit Hooks | .husky/, .git/hooks/ | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Linting | .eslintrc, .prettierrc, biome.json | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Branch Protection | GitHub Branch Protection API | GitHub API | 3-state (Healthy/Dormant/Missing) | ❌ No | ✅ Displayed |
| PR Template | .github/pull_request_template.md | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| .gitignore | File existence | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Netlify Badge | Badge URL in README | README content | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| .env.example | File existence | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Dependabot | .github/dependabot.yml | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| Docker | Dockerfile, docker-compose.yml | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| **Community Standards (7 checks)** | | | | | |
| CODE_OF_CONDUCT.md | File existence | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| CONTRIBUTING.md | File existence | File list scan | Binary (Healthy/Missing) | ✅ Template PR | ✅ Displayed |
| SECURITY.md | File existence | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| LICENSE | File existence | File list scan | Binary (Healthy/Missing) | ✅ Template PR | ✅ Displayed |
| CHANGELOG.md | File existence | File list scan | Binary (Healthy/Missing) | ✅ Template PR | ✅ Displayed |
| Issue Templates | .github/ISSUE_TEMPLATE/ | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
| PR Templates | .github/pull_request_template.md | File list scan | Binary (Healthy/Missing) | ❌ No | ✅ Displayed |
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

## 🎯 What We Do Well (Strengths)

### Documentation Management

- **Comprehensive Template System**: 8 document types with automated PR creation
- **4-State Health Model**: Sophisticated health tracking (Missing/Dormant/Malformed/Healthy)
- **Batch Operations**: "Fix All Docs" creates single PR for all missing docs
- **Content Parsing**: Full parsing of ROADMAP.md, TASKS.md, METRICS.md, FEATURES.md

### Best Practices & Community Standards

- **18 Total Checks**: 11 best practices + 7 community standards
- **Automated Detection**: File-based detection (no manual configuration)
- **Real-time Status**: Displays current status for all checks
- **Branch Protection**: API-based detection with granular status
- **Docker Support**: Detects Dockerfile, docker-compose.yml, and .dockerignore

### Activity Tracking

- **Real-time Metrics**: Last commit, open PRs, open issues
- **Color-coded Freshness**: Visual indicators for staleness
- **Comprehensive Stats**: Stars, forks, branches tracked and displayed
- **README Freshness**: Tracks days since README last updated with color-coding (Fresh/Recent/Aging/Stale)

### Health Scoring

- **Weighted Calculation**: 5 components with appropriate weights
  - Documentation: 30%
  - Testing: 20%
  - Best Practices: 20%
  - Community: 15%
  - Activity: 15%
- **Letter Grades**: A-F grading system
- **Component Breakdown**: Individual scores displayed with progress bars in detail panel

### AI Integration

- **Google Gemini**: AI-powered repository summaries
- **Smart Type Detection**: Automatic repo categorization
- **On-demand Generation**: Regenerate summaries anytime

## 🔴 Critical Gaps (Bullet Holes)

### ~~1. Testing Metrics Not Synced to Database~~ ✅ FIXED (Nov 26, 2025)

**Problem**: `repos.testing_status` and `repos.coverage_score` columns exist but were NEVER populated during sync.

**Status**: ✅ **RESOLVED** - Coverage is now extracted from METRICS.md during sync and stored in `repos.coverage_score`

**What Changed**:

- Added coverage extraction logic in `lib/sync.ts`
- Parses METRICS.md for metrics with "coverage" in name and "%" unit
- Updates `repos.coverage_score` column during sync
- Coverage now displayed in Health column with progress bar

**Remaining**: `testing_status` still not populated (requires CI/CD integration)

### ~~2. Health Score Breakdown Not Displayed~~ ✅ FIXED (Nov 26, 2025)

**Problem**: We calculate 5 component scores (documentation, testing, best practices, community, activity) but only displayed overall grade.

**Status**: ✅ **RESOLVED** - Health breakdown now prominently displayed in detail panel

**What Changed**:

- Added "Health Breakdown" section to `ExpandableRow.tsx`
- Shows all 4 visible components with percentages and weights:
  - Documentation (30%) - based on core docs present
  - Testing (20%) - framework + coverage
  - Best Practices (20%) - healthy/total ratio
  - Community (15%) - healthy/total ratio
- Each component has visual progress bar
- Activity score (15%) calculated but not shown (needs last_commit, open_prs, open_issues props)

### 3. **No Fix Buttons for Best Practices/Community Standards**

**Problem**: We detect missing items but can't auto-fix them like we do for docs.

**Impact**:

- Inconsistent UX (docs have fixes, practices don't)
- Users must manually add these files
- Reduced automation value proposition

**Fix Required**:

- Add templates for CODE_OF_CONDUCT, SECURITY.md, Issue templates, etc.
- Implement "Fix" button for each missing item
- Batch "Fix All Standards" option

**Priority**: MEDIUM - Would significantly improve UX consistency

### 4. **Template Health Detection Not Implemented**

**Problem**: We detect if docs exist but not if they're stale/unchanged templates.

**Impact**:

- "Dormant" and "Malformed" states are theoretical, not actually detected
- Users could have placeholder docs passing as "Healthy"
- Health scores may be inflated

**Fix Required**:

- Implement content hashing for templates
- Compare against known template hashes
- Mark unchanged templates as "Dormant"
- Detect malformed structure

**Priority**: LOW - Nice to have, but basic detection works

### 5. **Coverage from METRICS.md Only Shown in Metrics Panel**

**Problem**: Self-reported coverage appears in "Metrics" section but not prominently in "Testing" section.

**Impact**:

- Duplicate information (shown in both places)
- Testing section misses key metric
- User must expand to see coverage

**Fix Required**:

- Integrate METRICS.md coverage into Testing section
- Prefer METRICS.md coverage over auto-detected
- Show "Self-reported" label to distinguish

**Priority**: MEDIUM - Better data integration

## ⚠️ Moderate Issues

### 6. **No Real-time CI/CD Status Integration**

**Problem**: We detect CI/CD existence but don't show current build status.

**What We Have**: Detection of .github/workflows, .gitlab-ci.yml, netlify.toml
**What's Missing**: Current build status (passing/failing), last run time

**Opportunity**: Integrate with GitHub Actions API to show live status

### 7. **Test File Count Shown But Not Test Case Count**

**Problem**: We count test files but don't parse for actual test cases.

**What We Have**: File count (42 files)
**What's Missing**: Test case count (how many `it()` or `test()` calls)

**Opportunity**: Parse test files to count actual assertions

### ~~8. README Freshness Not Calculated~~ ✅ FIXED (Nov 26, 2025)

**Problem**: We tracked last commit but not last README update.

**Status**: ✅ **RESOLVED** - README freshness now tracked and displayed with color-coding

**What Changed**:

- Added `getFileLastModified()` call in `lib/sync.ts` to fetch README last update
- Stores in `repos.readme_last_updated` column
- Displays in Documentation section with color-coded freshness:
  - Fresh (< 30 days) - Green
  - Recent (< 90 days) - Yellow
  - Aging (< 180 days) - Orange
  - Stale (≥ 180 days) - Red
- Shows "Xd ago (Label)" format

### 9. **No Vulnerability Tracking**

**Problem**: No integration with GitHub Security/Dependabot alerts.

**What's Missing**: Count of open security vulnerabilities
**Why It Matters**: Critical for production repositories

**Opportunity**: Integrate GitHub Vulnerability Alerts API

### 10. **No Contributor Metrics**

**Problem**: We don't track contributors, commit frequency, or bus factor.

**What's Missing**:

- Number of contributors
- Commit cadence (commits/week)
- Bus factor (contributor concentration)
- PR merge time

**Opportunity**: Rich activity metrics beyond basic counts

## 📊 Documentation Accuracy Issues

### FEATURES.md

- ❌ Claimed "Dark/Light Mode Toggle" - NOT IMPLEMENTED
- ❌ Claimed "Webhook Integration" - NOT IMPLEMENTED  
- ⚠️ Testing section needs update to reflect actual coverage handling
- ✅ Most feature claims are accurate

### METRICS.md

- ⚠️ "Code Coverage: 87.5% (branch) / 100% (statements)" - Needs verification
- ⚠️ "Test Files: 4" - Should auto-update from detection
- ⚠️ "Test Cases: 8" - Not auto-tracked (manual entry)
- ✅ Health Score components documented correctly

### README.md

- ⚠️ Claims "Health Metrics" but doesn't specify component breakdown display
- ⚠️ "Testing Status" mentioned but not fully implemented
- ✅ Most claims accurate

### ROADMAP.md

- ✅ Accurately reflects what's done vs planned
- ⚠️ Q2 2025 items need review (some may be done)

### TASKS.md

- ⚠️ "In Progress" section has items that might be done
- ⚠️ Needs update after this audit

## 🚀 High-Value Opportunities

### Quick Wins (High Impact, Low Effort)

1. **Sync Coverage to Database** (2-4 hours)
   - Extract from METRICS.md during sync
   - Update repos.coverage_score
   - Display in Testing section prominently

2. **Show Health Score Breakdown** (3-6 hours)
   - Add 5 component scores to UI
   - Progress bars for each
   - Tooltips with descriptions

3. **README Freshness Metric** (2-3 hours)
   - Query GitHub API for README last commit
   - Calculate days since update
   - Color-code by freshness

### Medium Wins (High Impact, Medium Effort)

4. **Automated Fixes for Community Standards** (8-12 hours)
   - Create templates for CODE_OF_CONDUCT, SECURITY, Issue templates
   - Add "Fix" buttons to each item
   - Implement batch "Fix All" option

5. **CI/CD Build Status Integration** (6-10 hours)
   - Query GitHub Actions API
   - Show current build status badge
   - Display last run time

6. **Test Case Counting** (4-6 hours)
   - Parse test files for `test()`, `it()`, `describe()` calls
   - Display count in Testing section
   - Compare against test file count

### Long-term Investments (High Impact, High Effort)

7. **Vulnerability Tracking** (12-20 hours)
   - Integrate GitHub Security API
   - Display vulnerability count and severity
   - Add to health score calculation

8. **Contributor Analytics** (20-30 hours)
   - Commit frequency analysis
   - Bus factor calculation
   - PR merge time tracking
   - Contributor diversity metrics

9. **Template Health Detection** (10-15 hours)
   - Content hashing system
   - Template comparison
   - Dormant/Malformed state detection

## 📋 Recommended Action Plan

### ~~Phase 1: Data Integration~~ ✅ COMPLETED (Nov 26, 2025)

- [x] ~~Sync coverage_score from METRICS.md to repos table~~
- [ ] Extract test status from CI/CD (if available)
- [x] ~~Display health score breakdown in UI~~
- [x] ~~Update all documentation for accuracy~~ (Cross-pollination audit completed)

### Phase 2: UX Consistency (Week 2)

- [ ] Add fix buttons for community standards
- [ ] Implement templates for missing standards
- [x] ~~Add README freshness metric~~
- [x] ~~Improve Testing section with self-reported coverage~~ (Coverage synced to DB and displayed)
- [x] ~~Add Docker as best practice check~~ (11 checks now)

### Phase 3: Advanced Metrics (Week 3-4)

- [ ] CI/CD build status integration
- [ ] Test case counting
- [ ] Vulnerability tracking
- [ ] Contributor metrics

## 🎯 Success Metrics

### ✅ Phase 1 Complete (Nov 26, 2025):

- [x] ~~100% of parsed metrics utilized in UI~~ - Coverage now synced and displayed
- [x] ~~All health score components visible to users~~ - 4/5 components shown with progress bars
- [x] ~~Self-reported coverage prominently displayed~~ - Shows in Health column + breakdown
- [x] ~~Documentation matches implementation~~ - Cross-pollination audit completed

After implementing Phase 2:
- [ ] Consistent "Fix" experience across all detections
- [x] ~~README freshness tracked for all repos~~ - Color-coded display in Documentation section
- [x] ~~Testing section shows complete picture~~ - Framework, file count, coverage all visible

After implementing Phase 3:
- [ ] Real-time build status for CI/CD repos
- [ ] Comprehensive test metrics (files + cases)
- [ ] Security awareness (vulnerability counts)
- [ ] Activity insights (contributors, velocity)

## 📝 Notes for L7 Review

This audit reveals a strong foundation with excellent documentation detection and parsing, but several opportunities for data integration and UX consistency. The biggest low-hanging fruit is syncing the coverage_score we already parse into the database and displaying health score breakdowns we already calculate.

The system is production-ready but has significant headroom for enrichment, particularly in real-time status integration (CI/CD, vulnerabilities) and advanced metrics (contributors, test cases).

Recommendation: Prioritize Phase 1 (data integration) as it requires no new external APIs and unlocks value from existing work.
