# Changelog

All notable changes to Overseer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
- PR Template correctly categorized under Community Standards (now 8 checks total, was in Best Practices)
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

- Reordered dashboard columns: Health, Activity, Links, Docs (previously Health, Docs, Activity, Links)
- GitHub link icon changed to purple Github icon, homepage link to green ExternalLink icon
- Hide button changed to red X icon with toast notification (removed confirmation dialog)
- Login redirect from header now correctly redirects to homepage instead of /api/auth/signin
- Moved Stats column from main table to detail panel
- Description column now hidden on smaller screens (xl+ only)
- Updated Gemini API model to `gemini-1.5-flash`
- Reorganized ExpandableRow component for better space utilization

### Fixed

- Coverage score from METRICS.md now properly stored in database and displayed in UI
- Health score breakdown now visible to users (previously calculated but not shown)
- Login redirect loop when signing in from header
- React key warnings in metrics mapping
- Null safety checks for metric names
- OAuth callback URL configuration for Netlify

## [0.1.0] - 2024-11-24

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

*This changelog is maintained manually. For detailed commit history, see the Git log.*

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
