# Overseer Features

## Core Capabilities

### 📊 Repository Intelligence

- **Health Scoring**: Comprehensive health scores (0-100) based on documentation, testing, best practices, community standards, and activity
- **Documentation Tracking**: Monitors presence and status of key docs with 4-state health model (Missing, Dormant, Malformed, Healthy)
- **Code Coverage Visualization**: Progress bars showing test coverage at a glance
- **Activity Monitoring**: Last commit dates, open PRs, open issues with color-coded freshness indicators
- **Features Parser**: Extracts and displays features from FEATURES.md by category
- **Best Practices Detection**: 10 automated checks (CI/CD, pre-commit, linting, branch protection, templates, testing, etc.)
- **Community Standards**: 7 checks for CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, templates

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
- **Repository Stats**: Stars, forks, branches displayed in detail panels

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
- **SETUP.md** - Setup instructions
- **FEATURES.md** - Feature documentation

## Best Practices & Community Standards

Overseer tracks adherence to development and community standards with 4-state health tracking (Missing, Dormant, Malformed, Healthy):

### 🛡️ Community Standards (7 Checks)

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
- **PR Templates** - Pull request templates
- **Testing Framework** - Test files and framework detection
- **`.gitignore`** - Proper git ignore configuration
- **Netlify Badge** - Deployment status badge
- **`.env.example`** - Environment variable template
- **Dependabot** - Automated dependency updates

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

## Future Enhancements

See [ROADMAP.md](./ROADMAP.md) for detailed quarterly plans.

### Q2 2025

- Dark/Light mode toggle
- README Freshness metric
- Full E2E tests
- GitHub OAuth production fix
- Gemini API integration fix
- Testing metrics display
- Health state icons in main row
- Fix buttons for best practices

### Q3 2025

- Velocity tracking (PR merge time, commit cadence)
- Advanced health metrics (vulnerability alerts, failing CI/CD ratio)
- Technical debt scoring
- Plugin system for custom parsers

### Q4 2025

- Team collaboration features
- Enterprise SSO
- Mobile app
- Custom AI model fine-tuning

## Last Updated

November 25, 2025
