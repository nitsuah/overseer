# Overseer Features

## 🎯 Core Capabilities

### 📊 Repository Intelligence

- **Health Scoring**: Comprehensive health scores (0-100) based on documentation, testing, best practices, community standards, and activity with component breakdown display
- **Documentation Tracking**: Monitors presence and status of key docs with 4-state health model (Missing, Dormant, Malformed, Healthy)
- **Template Health Detection**: Content hashing to detect unchanged/stale templates marked as "dormant" state (Phase 4)
- **Template Version Tracking**: Tracks which template version docs are based on with template_version column (Phase 4)
- **Malformed Doc Detection**: Identifies docs with template markers like `TODO:` or <50 characters (Phase 4)
- **Code Coverage Visualization**: Progress bars showing test coverage synced from METRICS.md (self-reported from target repositories)
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
- **Community Standards**: 10 checks for CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, Issue/PR templates, CODEOWNERS, Copilot Instructions, FUNDING

### 🤖 AI-Powered Features

- **AI Summaries**: Google Gemini-powered repository summaries
- **Smart Repo Type Detection**: Automatically categorizes repos (web-app, game, tool, library, bot, research)

### 📝 Documentation Management

- **Standardized Templates**: ROADMAP.md, TASKS.md, METRICS.md, FEATURES.md, and community standards templates
- **Agent Instructions (PROMPT.md)**: Comprehensive guide for AI agents to update repository documentation while maintaining Overseer compliance and avoiding hallucination
- **Auto-Fix Missing Docs**: One-click PR creation for missing documentation (8 doc types)
- **Auto-Fix Best Practices**: One-click PR creation for missing best practices (4 types: Dependabot, Env Template, Docker, Netlify Badge)
- **Auto-Fix Community Standards**: One-click PR creation for missing standards (10 types: CODE_OF_CONDUCT, SECURITY, LICENSE, CHANGELOG, CONTRIBUTING, Issue Templates, PR Template, CODEOWNERS, Copilot Instructions, FUNDING)
- **Batch Operations**: Fix all missing docs or all missing standards with single PR
- **Doc Health Scoring**: Percentage-based health scores for documentation completeness
- **Template Health Detection**: Content hashing to identify unchanged/dormant templates
- **OAuth Error Handling**: Comprehensive error detection for organization access restrictions with auto-redirect to GitHub authorization
- **GitHub Error Parsing**: Detects 5 error types (OAuth restrictions, permissions, not found, rate limits, unknown) with user-friendly messages
- **Authorization Auto-Redirect**: Automatically opens GitHub OAuth settings when org restrictions detected
- **Error Instructions**: Step-by-step guidance for resolving OAuth and permission issues

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

- **Modern Dashboard**: Clean, dark-mode interface with glassmorphism effects and gradient backgrounds
- **Three-Row Detail Layout**: Organized information architecture (Project/Quality/Standards)
- **Left Sidebar**: AI Summary and Repository Stats consolidated for quick access
- **Synchronized Expand/Collapse**: Row-level state management for coordinated section control
- **Color-Coded Sections**: Unique gradients for visual organization (purple AI/Roadmap, orange Features, blue Tasks/Testing, green Standards/Metrics, cyan Repo Stats, amber Documentation, red Issues)
- **Responsive Design**: Adapts to different screen sizes with mobile-friendly controls
- **Filtering & Sorting**: Filter by type, language, fork status with advanced controls
- **Visual Indicators**: Icons, badges, and color-coding for quick scanning
- **Enhanced Health Shields**: Tooltips with detailed component breakdowns (Community, Best Practices, Testing, Coverage, Documentation)
- **Repository Stats**: Stars, forks, branches, LOC, vulnerabilities, contributor analytics displayed in compact sidebar
- **CI/CD Badges**: Prominent passing/failing status indicators in Best Practices section
- **Test Metrics**: Test file and test case counts with inline coverage progress bars
- **Vulnerability Warnings**: Color-coded severity indicators (red for critical, orange for high)
- **Always-Visible Refresh**: Repository Stats header includes refresh button for immediate sync access
- **Expandable Cards**: Collapsible quarter/subsection cards with show more/less controls

### 🔄 Synchronization

- **Manual Sync**: On-demand repository synchronization
- **Automated Sync**: Netlify scheduled functions for background updates
- **Default Repositories**: Always-visible demo repositories
- **Custom Repository Support**: Add any public GitHub repository
- **Rate Limit Monitoring**: Check GitHub API rate limit status via /api/github-rate-limit endpoint
- **Debug Tools**: Inspect database records for troubleshooting via /api/repos/[name]/debug endpoint

### 🏠 Default Repositories

Overseer includes default repositories that are always synced and displayed:

- `nitsuah/overseer` - The Overseer dashboard itself
- `Nitsuah-Labs/nitsuah-io` - The Nitsuah.io website

These ensure the dashboard always has content, even for non-authenticated visitors. Configure in `lib/default-repos.ts`.

### 📋 Tracked Documentation

Overseer monitors the following documentation files in each repository:

- **FEATURES.md** - Features organized by category with descriptions
- **ROADMAP.md** - Quarterly planning and milestones
- **TASKS.md** - Task tracking by status
- **METRICS.md** - Custom repository metrics
- **README.md** - Project overview and setup
- **LICENSE.md** - Project license
- **CHANGELOG.md** - Version history
- **CONTRIBUTING.md** - Contribution guidelines

## ✨ Best Practices & Community Standards

Overseer tracks adherence to development and community standards with 4-state health tracking (Missing, Dormant, Malformed, Healthy):

### 🛡️ Community Standards

- **CODE_OF_CONDUCT.md** - Community behavior guidelines (template available)
- **CONTRIBUTING.md** - Contribution guidelines
- **SECURITY.md** - Security policy and vulnerability reporting (template available)
- **LICENSE** - Project license
- **CHANGELOG.md** - Version history
- **Issue Templates** - Standardized issue creation (templates available: bug_report, feature_request)
- **Pull Request Templates** - PR guidelines
- **CODEOWNERS** - Code ownership and review assignments (template available)
- **Copilot Instructions** - AI assistant guidance file (template available)
- **FUNDING.yml** - Funding/sponsorship information (template available)

### ✅ Best Practices

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

## 💯 Health Score System

Overseer calculates comprehensive health scores (0-100) based on 5 weighted components:

| Component             | Weight | What It Measures                                                                                                                       |
| --------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation Health  | 30%    | Presence and health of TASKS.md, ROADMAP.md, FEATURES.md, METRICS.md, README.md, LICENSE.md, CHANGELOG.md, CONTRIBUTING.md             |
| Testing & Quality     | 20%    | Test coverage, framework detection, CI/CD status                                                                                       |
| Best Practices        | 20%    | 10 checks: CI/CD, pre-commit, linting, branch protection, testing, .gitignore, Netlify badge, .env.example, Dependabot, Docker         |
| Community Standards   | 15%    | 9 checks: CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, Issue templates, PR templates, CODEOWNERS, Copilot Instructions |
| Activity & Engagement | 15%    | Commit frequency, PR/Issue counts, contributor activity                                                                                |

Health scores are displayed as letter grades (A-F) with detailed component breakdowns available in the expandable detail panel.

## 🛠️ Technology Stack

### 💻 Frontend

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### ⚙️ Backend

- **Neon (PostgreSQL)** - Serverless database
- **Netlify Functions** - Serverless API endpoints
- **NextAuth v5** - Authentication

### 🔌 APIs & Services

- **GitHub API** - Repository data and operations
- **Google Gemini** - AI-powered summaries
- **Octokit** - GitHub API client

## 🚀 Deployment

- **Platform**: Netlify
- **Database**: Netlify DB (Neon PostgreSQL)
- **Functions**: Netlify serverless functions
- **Scheduled Jobs**: Netlify scheduled functions for auto-sync

## 📅 Last Updated

November 26, 2025 - Phase 3 Advanced Metrics Complete
