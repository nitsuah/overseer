# Changelog

All notable changes to Overseer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **UX Roadmap Item:** Doc fix preview modal with template preview and pick-and-choose functionality before PR creation (planned)

## [1.4.0] - 2025-11-30

### Added

- **Detail Panel Redesign:** Complete UI overhaul with three-row layout architecture
- **Left Sidebar Layout:** AI Summary and Repository Stats consolidated in dedicated sidebar
- **Synchronized Expand/Collapse:** Row-level state management for project sections (Row 1), quality sections (Row 2), and standards sections (Row 3)
- **Gradient Backgrounds:** Unique color-coded gradients for all sections (purple AI/Roadmap, orange Features, blue Tasks/Testing, green Standards/Metrics, cyan Repo Stats, amber Documentation, red Issues)
- **Enhanced Health Shields:** Detailed tooltips showing component breakdowns for Community Standards, Best Practices, Testing, Coverage, and Documentation
- **Subsection Support:** Added subsection column to tasks table with migration script and parser support
- **AI Summary Component:** Extracted into dedicated component (AISummarySection) with generate button and dismissible state
- **Repository Stats Static Component:** Created RepositoryStatsSectionStatic with inline metrics and always-visible refresh button
- **Bold Text Parsing:** Created lib/markdown-utils.tsx for rendering **bold** markdown syntax in titles
- **Show More/Less Controls:** Granular controls for showing all quarters/subsections or completed items
- **Language Icon Mapping:** Created getLanguageIcon() helper with compact 2-3 letter labels
- **Health Shield Badges:** Coverage percentage and documentation health badges added to row displays

### Changed

- **Testing Section Header:** Moved coverage progress bar inline with section title for better space utilization
- **Refresh Button Location:** Moved from bottom of detail panel to Repository Stats header (always visible)
- **Type & Language Display:** Split type icon to Repository column (with name), language label to Description column (at end)
- **Features/Roadmap/Tasks Display:** Reversed order to show newest first with expandable card-based layout
- **Default Expansion States:** Row 1 (project) expanded by default, Rows 2-3 (quality/standards) collapsed
- **Section Organization:** Row 1 = Features/Roadmap/Tasks, Row 2 = Documentation/Best Practices/Testing, Row 3 = Standards/Metrics/Issues
- **Dashboard Table:** Removed Type and Language columns (moved to inline displays), enhanced row gradients
- **API Endpoint:** Added subsection field to tasks sync logic in sync-repos and repo sync

### Fixed

- **Array Mutation Warning:** Changed features .reverse() to .slice().reverse()
- **Doc Health Calculation:** Added bot and research repo types to getExpectedDocs()
- **Tasks Table Schema:** Added subsection column with proper index
- **Migration Endpoint:** Created /api/migrate/add_tasks_subsection for database updates

## [1.3.0] - 2025-11-27

### Added

- **OAuth Error Handling System:** Comprehensive error detection for organization access restrictions (lib/github-errors.ts)
- **GitHub Error Parsing:** Detects 5 error types (OAuth restrictions, permissions, not found, rate limits, unknown) with user-friendly messages
- **Auto-Redirect to GitHub:** Automatically opens GitHub OAuth settings when org access restrictions detected
- **Enhanced Error Responses:** API endpoints return detailed error types, instructions, and help URLs
- **OAuth Documentation:** Created GITHUB_OAUTH_ORG_ACCESS.md and OAUTH_ORG_FIX_SUMMARY.md user guides
- **Frontend Error Handling:** Enhanced useRepoActions hook with OAuth detection, toast notifications, and console logging
- **Template Path Debugging:** Added comprehensive logging to fix-doc endpoint for troubleshooting template resolution issues
- **Best Practices Fix Buttons:** Auto-fix for 4 best practices (Dependabot, Env Template, Docker, Netlify Badge) with one-click PR creation
- **Rate Limit Status Endpoint:** New /api/github-rate-limit endpoint to check current GitHub API rate limit status
- **Debug Endpoint:** New /api/repos/[name]/debug endpoint to inspect database records for troubleshooting
- **FUNDING.yml Community Standard:** 10th community standard check with template and auto-fix support
- **Refresh Button in Detail Panel:** Force re-sync individual repos with animated RefreshCw icon

### Changed

- **Error Messages:** Replaced raw GitHub API errors with actionable, user-friendly messages
- **Fix Button UX:** Now shows toast notifications with authorization instructions instead of generic errors
- **API Error Handling:** All fix endpoints now parse and classify GitHub errors before responding
- **Metrics Parser:** Enhanced to normalize percentage formats (both 0.8666 and 86.66% now correctly display as 86.66)
- **Testing Section Display:** Separated metric values from long descriptions with detail text display
- **Features Display Order:** Reversed to show newest features first (most recent at top)
- **Doc Health Calculation:** Removed LICENSE, CONTRIBUTING, and ROUTES.md from health scoring (focus on core docs)
- **Doc Health Tooltips:** Added comprehensive breakdown showing individual document states on hover
- **Doc Counter Badge:** Removed redundant 5/5 badge from Docs column (health states now in tooltip)

### Fixed

- **OAuth Organization Restrictions:** Users now get clear instructions when org blocks OAuth app access instead of cryptic errors
- **Error Context:** Console logs now show detailed error information for debugging template and authorization issues
- **Coverage Score Sync:** Always updates coverage_score in repos table (sets to NULL when no coverage found) to prevent stale values bleeding across repos
- **Batch Sync Coverage:** Sync-repos endpoint now properly extracts and updates coverage_score (was missing this logic)
- **Metrics Duplication:** Removed duplicate metrics that were accumulating from template instructions being parsed
- **Template Content Pollution:** Identified that markdown templates with example data can pollute parsing results
- **Duplicate Metrics Display:** Fixed DELETE before INSERT in metrics sync to prevent accumulation
- **Refresh Not Refetching:** Added force=true parameter to bypass cache when using refresh button
- **Array Mutation Warning:** Changed .reverse() to .slice().reverse() in FeaturesSection component
- **Duplicate Repo Type Detection:** Centralized detection logic to prevent multiple calls per render
- **TypeScript Build Error:** Extended Session interface with accessToken property via module augmentation
- **Windows Line Endings Bug:** Changed markdown parsers to use split(/\r?\n/) instead of split('\n') to handle CRLF line endings
- **GraphQL Rate Limit Type Error:** Added null safety check for data.resources.graphql before accessing properties

## [1.2.0] - 2025-11-27

### Added

- **Smart Links Column:** Issues and Dependabot alerts now show as badge buttons with counts (only when > 0)
- **Dependabot Alerts Button:** New shield icon button linking to /security/dependabot when alerts exist
- **Security Configuration Tracking:** Added Security Detail section to ROADMAP.md tracking 6 GitHub security settings
- **Activity Badge in Health Column:** Moved activity indicator to Health shields as 5th badge with time formatting
- **Health Breakdown Hover:** Interactive tooltip showing all 5 health components on grade letter hover
- **Community Standards Templates:** Expanded Fix buttons to 6 standards (CODE_OF_CONDUCT, SECURITY, LICENSE, CHANGELOG, ISSUE_TEMPLATE, PR_TEMPLATE)
- **Template Health Detection (Phase 4):** Content hashing to detect unchanged/stale templates marked as "dormant"
- **Template Version Tracking (Phase 4):** Track which template version docs are based on with template_version column
- **Malformed Detection (Phase 4):** Detect docs with template markers like "TODO:" or <50 characters
- **Contributor Analytics (Phase 5):** Track contributor count, commit frequency, bus factor, PR merge time
- **Bus Factor Analysis (Phase 5):** Calculate contributor concentration risk using 80/20 rule
- **Commit Frequency Tracking (Phase 5):** Average commits/week from last 12 weeks
- **PR Merge Time Tracking (Phase 5):** Average hours from PR creation to merge for last 30 PRs
- **Contributor Metrics Display (Phase 5):** Show contributor count, commits/week, bus factor, PR merge time in Repository Stats
- Database migrations: 006_add_template_version.sql, 007_add_contributor_metrics.sql
- Lines of Code (LOC) metrics with language breakdown from GitHub API
- LOC display in Repository Stats section with K suffix formatting (e.g., "12.5K")
- Test case counting parser (detects it(), test(), describe() calls in test files)
- Test case count display in Testing section with prominent badge
- CI/CD build status integration via GitHub Actions API
- CI/CD status badge in Best Practices section (passing/failing with workflow name and last run date)
- Vulnerability alerts integration via GitHub Security/Dependabot API
- Vulnerability count display in Repository Stats with severity-based color coding
- Critical vulnerability count highlighted in parentheses
- Database migrations: 002_add_loc_metrics.sql, 003_add_test_counts.sql, 004_add_ci_status.sql, 005_add_vulnerability_alerts.sql
- Health score component breakdown display with progress bars (Documentation 30%, Testing 20%, Best Practices 20%, Community 15%)
- README freshness tracking with color-coded staleness indicators (Fresh/Recent/Aging/Stale)
- Coverage score sync from METRICS.md to database during repository sync
- Docker as 10th best practice check (detects Dockerfile, docker-compose files, .dockerignore)
- PR Template correctly categorized under Community Standards (now 9 checks total: added CODEOWNERS and Copilot Instructions)
- Toast notification system replacing browser alerts
- Testing section enhancement with framework detection and test file counting
- Comprehensive feature audit and documentation accuracy review (November 2025)
- Feature detection matrix tracking 60+ items with detection/health/fix status
- AUDIT.md documenting critical gaps, strengths, and opportunities
- Repository stats (stars, forks, branches) in detail panel
- LICENSE.md tracking as a document type
- Comprehensive FEATURES.md documentation
- Code coverage visualization with progress bars
- AI summary display in expandable rows
- Activity tracking (last commit, PRs, issues)
- Default repositories feature
- Dynamic OAuth URL support for Netlify deployments
- 2-column layout for detail panels
- Repository type detection and badges

### Changed

- **Table Structure:** Removed Activity column (now 8 columns: Links, Repository, Type, Description, Language, Health, Docs, Actions)
- **Column Order:** Links moved to first position, Activity badge integrated into Health shields
- **AI Summary Display:** Changed condition from `includes('unavailable')` to `startsWith('Summary unavailable')` for better accuracy
- **Health Breakdown Positioning:** Moved hover group to grade span only (not entire Health column)
- **Doc Tooltips:** Enhanced with multiline status showing individual doc health states
- Reordered dashboard columns: Health, Activity, Links, Docs (previously Health, Docs, Activity, Links)
- GitHub link icon changed to purple Github icon, homepage link to green ExternalLink icon
- Hide button changed to red X icon with toast notification (removed confirmation dialog)
- Login redirect from header now correctly redirects to homepage instead of /api/auth/signin
- Moved Stats column from main table to detail panel
- Description column now hidden on smaller screens (xl+ only)
- Updated Gemini API model to `gemini-1.5-flash`
- Reorganized ExpandableRow component for better space utilization

### Removed

- **Activity Column:** Removed redundant Activity column from main table (functionality moved to Health shields)

### Fixed

- Coverage score from METRICS.md now properly stored in database and displayed in UI
- Health score breakdown now visible to users (previously calculated but not shown)
- Login redirect loop when signing in from header
- React key warnings in metrics mapping
- Null safety checks for metric names
- OAuth callback URL configuration for Netlify

## [0.1.0] - 2025-11-24

### Implemented

- Initial release
- GitHub OAuth authentication
- Repository dashboard with health scores
- Documentation tracking (ROADMAP, TASKS, METRICS)
- AI-powered repository summaries with Google Gemini
- Auto-fix missing documentation feature
- Batch "Fix All Docs" functionality
- Custom repository support
- Netlify deployment with Neon PostgreSQL
- Repository filtering and sorting
- Expandable detail rows

### Technical

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- NextAuth v5
- Neon (PostgreSQL) database
- Netlify Functions

---

_This changelog is maintained manually. For detailed commit history, see the Git log._

<!--
AGENT INSTRUCTIONS:
This file tracks all notable changes using Keep a Changelog format.

CRITICAL FORMAT REQUIREMENTS:
1. Use ## [Version] - YYYY-MM-DD for releases
2. Use ## [Unreleased] for upcoming changes
3. Group changes under: Added, Changed, Deprecated, Removed, Fixed, Security
4. Keep entries concise and user-focused
5. Link to issues/PRs where relevant

When updating:
1. Add new changes to [Unreleased] section
2. When releasing, rename [Unreleased] to version number with date
3. Create new empty [Unreleased] section
4. Follow semantic versioning (MAJOR.MINOR.PATCH)
-->
