# Overseer Features

## Core Capabilities

### 📊 Repository Intelligence

- **Health Scoring**: Comprehensive health scores (0-100) based on documentation, testing, best practices, community standards, and activity with component breakdown display
- **Documentation Tracking**: Monitors presence and status of key docs with 4-state health model (Missing, Dormant, Malformed, Healthy)
- **Template Health Detection**: Content hashing to detect unchanged/stale templates marked as "dormant" state (Phase 4)
- **Template Version Tracking**: Tracks which template version docs are based on with template_version column (Phase 4)
- **Malformed Doc Detection**: Identifies docs with template markers like "TODO:" or <50 characters (Phase 4)
- **Code Coverage Visualization**: Progress bars showing test coverage synced from METRICS.md
- **README Freshness Tracking**: Days since README last updated with color-coded staleness (Fresh/Recent/Aging/Stale)
- **Activity Monitoring**: Last commit dates, open PRs, open issues with color-coded freshness indicators
- **Lines of Code (LOC)**: Total LOC calculated from GitHub language stats with K suffix formatting (e.g., "12.5K")
- **Test Case Counting**: Automatic parsing of test files to count it(), test(), describe() calls
- **CI/CD Status**: Live build status from GitHub Actions (passing/failing with workflow name and last run)
- **Vulnerability Tracking**: Open Dependabot alerts with count and severity (critical/high) color-coded display
- **Contributor Analytics**: Track contributor count, commit frequency (commits/week), bus factor, PR merge time (Phase 5)
- **Bus Factor Analysis**: Contributor concentration risk using 80/20 rule (Phase 5)
- **Commit Frequency**: Average commits/week from last 12 weeks (Phase 5)
- **PR Merge Time**: Average hours from creation to merge for last 30 PRs (Phase 5)
- **Features Parser**: Extracts and displays features from FEATURES.md by category
- **Best Practices Detection**: 10 automated checks (CI/CD, pre-commit, linting, branch protection, testing, Docker, etc.)
- **Community Standards**: 8 checks for CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, Issue/PR templates

### 🤖 AI-Powered Features

- **AI Summaries**: Google Gemini-powered repository summaries
- **Smart Repo Type Detection**: Automatically categorizes repos (web-app, game, tool, library, bot, research)

### 📝 Documentation Management

- **Standardized Templates**: ROADMAP.md, TASKS.md, METRICS.md, and more
- **Auto-Fix Missing Docs**: One-click PR creation for missing documentation
- **Batch Operations**: Fix all missing docs across repositories
- **Doc Health Scoring**: Percentage-based health scores for documentation completeness

### 🎯 Project Tracking

- **Task Management**: Parse and display tasks by status (Todo, In Progress, Done)
- **Roadmap Visualization**: Quarterly planning with status tracking (Planned, In Progress, Completed)
- **Metrics Tracking**: Custom metrics per repository
- **Testing Metrics**: Test file count and test case count prominently displayed
- **CI/CD Monitoring**: Live workflow status with last run timestamp
- **Vulnerability Alerts**: Real-time security alert tracking
- **Expandable Details**: Rich detail panels with organized information

### 🔐 Authentication & Security

- **GitHub OAuth**: Secure authentication with GitHub
- **Dynamic URL Support**: Works on localhost, Netlify production, and preview deployments
- **Access Token Management**: Secure token handling for GitHub API

### 🎨 User Interface

- **Modern Dashboard**: Clean, dark-mode interface with glassmorphism effects
- **Responsive Design**: Adapts to different screen sizes
- **Filtering & Sorting**: Filter by type, language, fork status
- **Visual Indicators**: Icons, badges, and color-coding for quick scanning
- **Repository Stats**: Stars, forks, branches, LOC, vulnerabilities displayed in detail panels
- **CI/CD Badges**: Prominent passing/failing status indicators in Best Practices section
- **Test Metrics**: Test file and test case counts with highlighted badges in Testing section
- **Vulnerability Warnings**: Color-coded severity indicators (red for critical, orange for high)

### 🔄 Synchronization

- **Manual Sync**: On-demand repository synchronization
- **Automated Sync**: Netlify scheduled functions for background updates
- **Default Repositories**: Always-visible demo repositories
- **Custom Repository Support**: Add any public GitHub repository

#### Default Repositories

Overseer includes default repositories that are always synced and displayed:

- `nitsuah/overseer` - The Overseer dashboard itself
- `Nitsuah-Labs/nitsuah-io` - The Nitsuah.io website

These ensure the dashboard always has content, even for non-authenticated visitors. Configure in `lib/default-repos.ts`.

## Tracked Documentation

Overseer monitors the following documentation files in each repository:

### Core Docs (Parsed & Displayed)

- **FEATURES.md** - Features organized by category with descriptions
- **ROADMAP.md** - Quarterly planning and milestones
- **TASKS.md** - Task tracking by status
- **METRICS.md** - Custom repository metrics

### Standard Docs (Presence Tracked)

- **README.md** - Project overview and setup
- **LICENSE.md** - Project license
- **CHANGELOG.md** - Version history
- **CONTRIBUTING.md** - Contribution guidelines

## Best Practices & Community Standards

Overseer tracks adherence to development and community standards with 4-state health tracking (Missing, Dormant, Malformed, Healthy):

### 🛡️ Community Standards (8 Checks)

- **CODE_OF_CONDUCT.md** - Community behavior guidelines
- **CONTRIBUTING.md** - Contribution guidelines
- **SECURITY.md** - Security policy and vulnerability reporting
- **LICENSE** - Project license
- **CHANGELOG.md** - Version history
- **Issue Templates** - Standardized issue creation
- **Pull Request Templates** - PR guidelines

### ✅ Best Practices (10 Checks)

- **CI/CD Integration** - GitHub Actions workflows
- **Pre-commit Hooks** - `.pre-commit-config.yaml` present
- **Linting Configuration** - ESLint, Prettier, or similar
- **Branch Protection** - Main branch protection with review requirements
- **Testing Framework** - Test files and framework detection
- **`.gitignore`** - Proper git ignore configuration
- **Netlify Badge** - Deployment status badge
- **`.env.example`** - Environment variable template
- **Dependabot** - Automated dependency updates
- **Docker** - Dockerfile, docker-compose files, .dockerignore

## Health Score System

Overseer calculates comprehensive health scores (0-100) based on 5 weighted components:

| Component             | Weight | What It Measures                                                                                                               |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Documentation Health  | 30%    | Presence and health of TASKS.md, ROADMAP.md, FEATURES.md, METRICS.md, README.md, LICENSE.md, CHANGELOG.md, CONTRIBUTING.md     |
| Testing & Quality     | 20%    | Test coverage, framework detection, CI/CD status                                                                               |
| Best Practices        | 20%    | 10 checks: CI/CD, pre-commit, linting, branch protection, testing, .gitignore, Netlify badge, .env.example, Dependabot, Docker |
| Community Standards   | 15%    | 8 checks: CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, Issue templates, PR templates                           |
| Activity & Engagement | 15%    | Commit frequency, PR/Issue counts, contributor activity                                                                        |

Health scores are displayed as letter grades (A-F) with detailed component breakdowns available in the expandable detail panel.

## Technology Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend

- **Neon (PostgreSQL)** - Serverless database
- **Netlify Functions** - Serverless API endpoints
- **NextAuth v5** - Authentication

### APIs & Services

- **GitHub API** - Repository data and operations
- **Google Gemini** - AI-powered summaries
- **Octokit** - GitHub API client

## Deployment

- **Platform**: Netlify
- **Database**: Netlify DB (Neon PostgreSQL)
- **Functions**: Netlify serverless functions
- **Scheduled Jobs**: Netlify scheduled functions for auto-sync

## Last Updated

November 26, 2025 - Phase 3 Advanced Metrics Complete
