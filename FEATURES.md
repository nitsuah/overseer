# Overseer Features

## Core Capabilities

### 📊 Repository Intelligence
- **Health Scoring**: Composite health grades (A-F) based on documentation, testing, and activity
- **Documentation Tracking**: Monitors presence and status of key docs (README, ROADMAP, TASKS, METRICS, LICENSE, etc.)
- **Code Coverage Visualization**: Progress bars showing test coverage at a glance
- **Activity Monitoring**: Last commit dates, open PRs, open issues with color-coded freshness indicators

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

## Tracked Documentation

Overseer monitors the following documentation files in each repository:

### Core Docs (Parsed & Displayed)
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

## Best Practices Detection

### Currently Implemented
- ✅ **Documentation Presence**: Tracks existence of key markdown files
- ✅ **Repository Type**: Detects project type from name, description, language, topics
- ✅ **Code Coverage**: Displays test coverage when available
- ✅ **Testing Status**: Shows passing/failing test status

### Planned
- 🔄 **Pre-commit Hooks**: Detect `.husky/`, `.git/hooks/`
- 🔄 **CI/CD Configuration**: Detect `.github/workflows/`, `.gitlab-ci.yml`, `netlify.toml`
- 🔄 **Testing Frameworks**: Detect `vitest.config`, `jest.config`, `playwright.config`
- 🔄 **Linting**: Detect `.eslintrc`, `.prettierrc`, `biome.json`
- 🔄 **Security Files**: Detect `SECURITY.md`, `.github/dependabot.yml`, `https://github.com/Nitsuah-Labs/nitsuah-io/security/dependabot` - dependabot results, codescanning, secret scanning results from GH
- 🔄 **Issue/PR Templates**: Detect `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`
- 🔄 **Package Managers**: Detect lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- 🔄 **Docker**: Detect `Dockerfile`, `docker-compose.yml`
- 🔄 **Environment Files**: Detect `.env.example`
- Community Standards as a section in detail panel but if they are a core doc can track that way instead of checklist - Checklist - 
 README (leave under docs detail section)
 Code of conduct (leave under docs detail section)
 Contributing (leave under docs section)
 License (leave under docs section)
 Security policy (leave under docs section)
Set up a security policy (leave under docs section)
 Issue templates (checklist)
 Pull request template (leave under docs section)
 Repository admins accept content reports (checklist)
- 

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

### Q1 2025
- Dark/Light mode toggle
- README Freshness metric
- Pre-commit hooks detection
- Full E2E tests

### Q2 2025
- Velocity tracking (PR merge time, commit cadence)
- Advanced health metrics (vulnerability alerts, failing CI/CD ratio)
- Technical debt scoring
- Plugin system for custom parsers

### Q3 2025
- Team collaboration features
- Enterprise SSO
- Mobile app
- Custom AI model fine-tuning

---

*Last updated: 2025-11-25*