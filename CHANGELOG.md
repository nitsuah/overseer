# Changelog

All notable changes to Overseer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Repository stats (stars, forks, branches) in detail panel
- LICENSE.md tracking as a document type
- Comprehensive FEATURES.md documentation
- Best practices detection framework planning
- Code coverage visualization with progress bars
- AI summary display in expandable rows
- Activity tracking (last commit, PRs, issues)
- Default repositories feature
- Dynamic OAuth URL support for Netlify deployments
- 2-column layout for detail panels
- Repository type detection and badges

### Changed

- Moved Stats column from main table to detail panel
- Description column now hidden on smaller screens (xl+ only)
- Updated Gemini API model to `gemini-pro`
- Reorganized ExpandableRow component for better space utilization

### Fixed

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
