# Changelog

All notable changes to Overseer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

### Added

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
