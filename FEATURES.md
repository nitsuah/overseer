# Overseer Features

Status guide: features listed here are shipped unless explicitly marked as planned in ROADMAP.md or TASKS.md.

## 🎯 Core Capabilities

### 📊 Repository Intelligence

- **Health Scoring**: Comprehensive health scores (0-100) based on documentation, testing, best practices, community standards, activity, and security with component breakdown display
- **Documentation Tracking**: Monitors presence and status of key docs with 4-state health model (Missing, Dormant, Malformed, Healthy)
- **Template Health Detection**: Content hashing to detect unchanged/stale templates marked as "dormant" state
- **Template Version Tracking**: Tracks which template version docs are based on with template_version column
- **Malformed Doc Detection**: Identifies docs with template markers or <50 characters
- **Code Coverage Visualization**: Progress bars showing test coverage synced from METRICS.md (self-reported from target repositories)
- **README Freshness Tracking**: Days since README last updated with color-coded staleness (Fresh/Recent/Aging/Stale)
- **Activity Monitoring**: Last commit dates, open PRs, open issues with color-coded freshness indicators
- **Lines of Code (LOC)**: Total LOC calculated from GitHub language stats with K suffix formatting (e.g., "12.5K")
- **Test Case Counting**: Automatic parsing of test files to count it(), test(), describe() calls
- **CI/CD Status**: Live build status from GitHub Actions (passing/failing with workflow name and last run)
- **Vulnerability Tracking**: Open Dependabot alerts with count and severity (critical/high) color-coded display, weighted into the security health score component alongside open secret-scanning alerts
- **Contributor Analytics**: Track contributor count, commit frequency (commits/week), bus factor, PR merge time
- **Bus Factor Analysis**: Contributor concentration risk using 80/20 rule
- **Commit Frequency**: Average commits/week from last 12 weeks
- **PR Merge Time**: Average hours from creation to merge for last 30 PRs
- **Features Parser**: Extracts and displays features from FEATURES.md by category
- **Best Practices Detection**: 10 automated checks (CI/CD, pre-commit, linting, branch protection, testing, Docker, etc.)
- **Community Standards**: 12 checks for CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, Issue/PR templates, CODEOWNERS, Copilot Instructions, FUNDING, FLOW-TASKS Prompt, HANDOFF Prompt
- **Org-Level Fallback Awareness**: Community standards satisfied solely by the owner's `.github` repo (no repo-local copy) are marked with a distinct "Org" badge and a tooltip naming the source repo, instead of an indistinguishable "Present"

### 🤖 Cross-Repo Orchestration (Planned)

- **Cross-Repo Dependency Mapping**: Infer and display connections between related repos sharing a stack (e.g., agent-board ↔ bb-mcp ↔ overseer)
- **Agent Dispatch Bridge**: Route tasks from overseer's agent task queue to agent-board's local model runtime for execution
- **MCP Server**: `POST /api/mcp` — JSON-RPC 2.0 endpoint (MCP spec 2024-11-05) exposing `get_repo_health` (health score, CI, vuln counts, activity) and `list_tasks` (per-repo tasks with optional status filter) to any MCP-compatible agent client; Bearer token auth via `MCP_API_KEY` env var; 60 req/min rate limit; `GET /api/mcp` returns public capability doc

### 🔄 Agent Prompt Toolkit

- **FLOW-TASKS Prompt**: Standard template for agents to triage, prioritize, and sequence tasks from TASKS.md across any repo in the portfolio
- **HANDOFF Prompt**: Structured context-capture brief enabling agents to hand off in-progress work to a new session without loss of state
- **PM Prompt v1.2**: Extended with portfolio map, cross-repo awareness rules, and agent prompt companion reference
- **TEST Prompt v2**: Expanded to cover all portfolio repos with per-repo stack, test tool, and mocking strategy

### 🤖 AI-Powered Features

- **AI Summaries**: Google Gemini 2.0-powered repository summaries
- **Multi-Provider AI Failover**: Automatic failover across Gemini, OpenAI (GPT-4), and Anthropic (Claude) for high availability
- **AI Health Endpoint**: `/api/health` monitors all AI providers, auto-discovers available Gemini models when primary model fails
- **Runtime Model Auto-Discovery**: When Gemini model fails, automatically discovers, tests, and switches to working model (no manual intervention)
- **Hot Model Swapping**: Runtime model cache (15min TTL) enables automatic model switching mid-session when Google API changes
- **Self-Healing AI**: System tests default model on each request, discovers alternatives if broken, caches working model across requests
- **AI Template Enrichment**: Context-aware documentation generation using repo metadata, structure, and content
- **Smart Repo Type Detection**: Automatically categorizes repos (web-app, game, tool, library, bot, research)
- **Gemini Health Monitoring**: Automated CI/CD health checks to detect model deprecations (tests fail when model breaks)
- **AI Feature Suggestions**: "Suggest features" button in the Features panel; analyzes repo health score, language, existing feature categories, and planned roadmap items to produce 3-5 prioritized feature ideas; supports an optional freeform prompt for user-directed output (PR #132)
- **AI Doc Improvement**: Inline compare-and-accept flow for existing documentation; fetches the current file from GitHub, generates an AI-improved version, and shows a side-by-side before/after preview before creating a PR; supports an optional user prompt to guide the rewrite (PR #133)
- **Provider Circuit Breaker**: Per-provider circuit breaker in `ai-failover.ts` auto-opens on quota/rate-limit errors (30 min backoff) or transient errors (5 min backoff); skips open circuits with logged reopen time; resets on first success — no manual `GEMINI_QUOTA_EXCEEDED` env var needed
- **Structured Model-Switch Logging**: `MODEL_SWITCHED: <old> → <new>` warning logged whenever Gemini model discovery selects a different model than the configured default (e.g. after a deprecation)
- **Non-Inferential Health Endpoint**: `GET /api/health` now reports circuit breaker state and configured providers without making inference API calls on every poll; supports `?probe=true` for lightweight provider-reachability checks via list APIs

### 📝 Documentation Management

- **PR Preview Modal**: Interactive file selection and preview before PR creation with pick-and-choose functionality
- **AI Template Enrichment**: Context-aware documentation generation using repo metadata, structure, and content
- **Diff View**: LCS-based Myers diff algorithm showing accurate line-by-line changes between original and AI-generated content
- **Inline Edit/Generate Toggle**: Switch between manual template editing and AI-powered generation
- **Auto-Fix Missing Docs**: One-click PR creation for missing documentation (8 doc types)
- **Auto-Fix Best Practices**: One-click PR creation for missing best practices (4 types: Dependabot, Env Template, Docker, Netlify Badge)
- **Auto-Fix Community Standards**: One-click PR creation for missing standards (12 types: CODE_OF_CONDUCT, SECURITY, LICENSE, CHANGELOG, CONTRIBUTING, Issue Templates, PR Template, CODEOWNERS, Copilot Instructions, FUNDING, FLOW-TASKS Prompt, HANDOFF Prompt)
- **Batch Operations**: Fix all missing docs or all missing standards with single PR
- **Standardized Templates**: ROADMAP.md, TASKS.md, METRICS.md, FEATURES.md, and community standards templates
- **Agent Instructions (PROMPT.md)**: Comprehensive guide for AI agents to update repository documentation while maintaining Overseer compliance and avoiding hallucination
- **Doc Health Scoring**: Percentage-based health scores for documentation completeness
- **Template Health Detection**: Content hashing to identify unchanged/dormant templates
- **OAuth Error Handling**: Comprehensive error detection for organization access restrictions with auto-redirect to GitHub authorization
- **GitHub Error Parsing**: Detects 5 error types (OAuth restrictions, permissions, not found, rate limits, unknown) with user-friendly messages
- **Authorization Auto-Redirect**: Automatically opens GitHub OAuth settings when org restrictions detected
- **Error Instructions**: Step-by-step guidance for resolving OAuth and permission issues

### 🛠️ Developer Experience

- **Template Path Debugging**: Enhanced logging for troubleshooting template resolution issues
- **Features Display Order**: Reversed chronological order to show newest features first
- **Duplicate Metrics Prevention**: DELETE before INSERT strategy to prevent metric accumulation
- **Windows Line Endings Support**: Parser compatibility with CRLF line endings using split(/\r?\n/)
- **GraphQL Rate Limit Safety**: Null checks for optional GraphQL rate limit data
- **TypeScript Build Stability**: Session type extensions, array mutation fixes, centralized repo detection
- **Batched DB Queries**: Per-repo detail queries consolidated into a single `db.transaction()` call, reducing Neon serverless round trips from up to 8 sequential requests to one per repo (PR #128)

### 🎯 Project Tracking

- **Task Management**: Parse and display tasks by status (Todo, In Progress, Done)
- **Roadmap Visualization**: Quarterly planning with status tracking (Planned, In Progress, Completed)
- **Per-Repo Roadmap Progress**: Expanded detail panel surfaces the current ("(IN PROGRESS)") roadmap quarter first, with a completion progress bar per quarter card
- **Workflow Pipeline Stage Indicator**: Visual pipeline bar (Planned → In Progress → In Review → Done) per roadmap item derived from linked PR state; "In Review" inferred from `linked_pr_number` on in-progress items (PR #131)
- **PMO Mode Dashboard**: Portfolio-wide roadmap progress view at `/pmo`; 4-stage pipeline summary cards, per-repo health/CI/stale-item cards, and progress bars across all tracked repos; accessible via PMO nav link in the header for authenticated users (PR #136)
- **DEV-Flow Handoff**: One-click "Hand off" button on every in-progress roadmap item in the PMO view; POSTs to the Agent Task Queue (`/api/agent/tasks`) and links the returned `agent_task_id` back to the roadmap item in one round trip (PR #136)
- **AI Roadmap Suggestions**: "Suggest" button in the per-repo Roadmap section panel; analyzes repo health score, language, and all existing roadmap items (grouped by quarter and status) to propose 2-3 non-duplicate quarterly goals; supports an optional focus-area prompt (e.g. "performance") to guide the output
- **Metrics Tracking**: Custom metrics per repository
- **Testing Metrics**: Test file count and test case count prominently displayed
- **CI/CD Monitoring**: Live workflow status with last run timestamp
- **Vulnerability Alerts**: Real-time security alert tracking
- **Expandable Details**: Rich detail panels with organized information

### 🎨 User Interface

- **Guided Tour System**: 16-step interactive onboarding with spotlight overlay and auto-advance (3s per step)
- **Smart Row Expansion**: Automatic expand/collapse during tour for proper section visibility
- **Data-Tour Attributes**: Comprehensive element targeting with full card highlighting
- **Tour Navigation Controls**: Skip tour, manual next/previous, pause on interaction
- **Modern Dashboard**: Clean, dark-mode interface with glass-morphic effects and gradient backgrounds
- **Three-Row Detail Layout**: Organized information architecture (Project/Quality/Standards)
- **Left Sidebar**: AI Summary and Repository Stats consolidated for quick access
- **Synchronized Expand/Collapse**: Row-level state management for coordinated section control
- **Color-Coded Sections**: Unique gradients for visual organization (purple AI/Roadmap, orange Features, blue Tasks/Testing, green Standards/Metrics, cyan Repo Stats, amber Documentation, red Issues)
- **Enhanced Health Shields**: Tooltips with detailed component breakdowns (Community, Best Practices, Testing, Coverage, Documentation)
- **Profile Section Compass Rose**: Pills positioned at NW, W, SW with rotating glow backdrop on profile picture
- **Dynamic Text Expansion**: Right-to-left pill text reveal (icon first, text expands left) with origin-right scaling
- **Color-Coded Filter Dropdowns**: Purple Type, Blue Language, Fuchsia Fork borders with 60% opacity and subtle shadows
- **Clickable Repository Names**: Direct GitHub links in table rows with hover underline styling
- **Filtering & Sorting**: Filter by type, language, fork status with advanced controls
- **Responsive Design**: Adapts to different screen sizes with mobile-friendly controls
- **Visual Indicators**: Icons, badges, and color-coding for quick scanning
- **Repository Stats**: Stars, forks, branches, LOC, vulnerabilities, contributor analytics displayed in compact sidebar
- **CI/CD Badges**: Prominent passing/failing status indicators in Best Practices section
- **Test Metrics**: Test file and test case counts with inline coverage progress bars
- **Vulnerability Warnings**: Color-coded severity indicators (red for critical, orange for high)
- **Expandable Cards**: Collapsible quarter/subsection cards with show more/less controls
- **Show More/Less Controls**: Granular controls to show all quarters/subsections or completed items on demand
- **AI Summary Component**: Extracted into dedicated component with generate button and dismissible state management
- **Bold Text Parsing**: Markdown-utils for **bold** syntax rendering in roadmap/task titles
- **Always-Visible Refresh**: Repository Stats header includes refresh button for immediate sync access
- **Force Refresh**: Detail panel includes refresh button with animated RefreshCw icon for immediate data reload
- **Subsection Support in Tasks**: Database schema and parser support for organized task groupings with granular show/hide controls
- **Visual Hierarchy Improvements**: Enhanced spacing, borders, shadows, and hover states for better visual flow
- **Organized Button Layout**: GitHub in Stats, Play in Health, Refresh/Remove in Actions columns
- **Green Play Button**: Homepage/demo links with filled Play icon in Health column after shields
- **Purple GitHub Button**: GitHub repo links in Repository Stats section header with consistent theming
- **Authenticated Controls**: Sync all button restricted to logged-in users only
- **Optimized Table Structure**: 5-column layout with colspan adjustments for expanded detail rows
- **Status Icon Preservation**: PRs, Issues, Vulnerabilities, CI/CD icons retained without column header
- **Responsive Card Width**: Profile card optimized with conditional padding (`pr-2` collapsed, `pr-16` on hover)
- **Enhanced Filter Visibility**: Lighter backgrounds (`bg-slate-700/60`) vs darker panel selector for better contrast

### 🔒 Security & Content Safety

- **Markdown Sanitization**: `react-markdown` with `rehype-sanitize` plugin for XSS protection
- **Battle-Tested Rendering**: Replaced custom HTML injection with industry-standard markdown library
- **GitHub Flavored Markdown**: Full support for tables, task lists, strikethrough, autolinks via `remark-gfm`
- **Link Security**: All external links include `rel="noopener noreferrer"` attribute
- **Event Isolation**: Button clicks use `stopPropagation` to prevent unintended interactions
- **Custom Component Renderers**: Tailwind-styled markdown elements with consistent slate color scheme
- **Dependency Hygiene**: Removed unused `baseline-browser-mapping` to reduce attack surface

### 🔄 Synchronization

- **Manual Sync**: On-demand repository synchronization
- **Automated Sync**: Netlify scheduled functions for background updates
- **Webhook-Driven Sync**: Real-time incremental sync via GitHub push webhooks; validates HMAC-SHA256 signatures, ignores untracked repos, and fires a background `syncRepo` within seconds of a push event with a 200 response before the sync completes (PR #134)
- **Default Repositories**: Always-visible demo repositories
- **Custom Repository Support**: Add any public GitHub repository
- **Rate Limit Monitoring**: Check GitHub API rate limit status via /api/github-rate-limit endpoint
- **Debug Tools**: Inspect database records for troubleshooting via /api/repos/[name]/debug endpoint

### 🏠 Default Repositories

Overseer includes default repositories that are always synced and displayed:

- `nitsuah/overseer` - The Overseer dashboard itself
- `Nitsuah-Labs/nitsuah-io` - The Nitsuah.io website

These ensure the dashboard always has content, even for non-authenticated visitors. Configure in `lib/default-repos.ts`.

## 🆕 Planned & Upcoming Features

- **AI-Assisted Roadmap Management**: Auto-suggest roadmap items from repo health signals; auto-update progress from linked PR/issue state (Q3 2026)
- **Conversational Interface**: Messenger-style chat panel with repo data as context for natural-language repo-hygiene workflows (Q3 2026)
- **Cross-Repo Dependency Mapping**: Interactive 3D graph visualizing shared-stack connections across the portfolio (Q3 2026)
- **MCP Server**: Expose `get_repo_health` and `list_tasks` as MCP tools for any agent client (Q3 2026)
- **Autonomous Plan Execution**: Agents read ROADMAP.md and TASKS.md, open PRs, and close items end to end (Q4 2026)
- **Portfolio Intelligence Dashboard**: Cross-repo health roll-up, trend lines, and strategic signal view (Q4 2026)
- **Mobile-Responsive PWA**: Lightweight PWA packaging and mobile adjustments (Q4 2026)

## 🤖 AI/ML & Market Trends

- **AI Model Failover**: Multi-provider AI failover (Gemini, OpenAI, Anthropic) for high availability
- **Self-Healing AI**: Runtime model auto-discovery and hot swapping
- **AI Doc Improvement**: Inline compare-and-accept flow for documentation (shipped PR #133)
- **AI Feature Suggestions**: Repo-context-aware feature ideation with optional user prompt (shipped PR #132)
- **AI Summaries**: Context-aware, market-trend-driven repository summaries
- **Security Signal Integration**: Dependabot and secret-scanning signals weighted in health score
- **Real-Time Analytics**: Velocity scoring, technical-debt trending, and zombie-branch detection (planned Q3)

## 📈 Market-Relevant Improvements

- **Quarterly Review**: Features and roadmap reviewed quarterly for alignment with market trends and user feedback
- **Community Feedback Loop**: Feature requests and roadmap items prioritized based on user and contributor input
- **Compliance & Best Practices**: Continuous updates to match evolving open-source and enterprise standards

## 📅 Last Validated

June 2026 - PMO review; Q2 2026 fully reconciled (PRs #128, #131, #132, #133, #134, #136, #137); PMO Mode and DEV-Flow Handoff moved from Planned to shipped

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
- **FLOW-TASKS Prompt** - Agent task triage and execution sequencing prompt (template available)
- **HANDOFF Prompt** - Agent session handoff brief prompt (template available)

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

Overseer calculates comprehensive health scores (0-100) based on 6 weighted components:

| Component             | Weight | What It Measures                                                                                                                                                                    |
| --------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation Health  | 20%    | Presence and health of TASKS.md, ROADMAP.md, FEATURES.md, METRICS.md, README.md, LICENSE.md, CHANGELOG.md, CONTRIBUTING.md                                                          |
| Testing & Quality     | 25%    | Test coverage, framework detection, CI/CD status                                                                                                                                    |
| Best Practices        | 25%    | 10 checks: CI/CD, pre-commit, linting, branch protection, testing, .gitignore, Netlify badge, .env.example, Dependabot, Docker                                                      |
| Community Standards   | 10%    | 12 checks: CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, LICENSE, CHANGELOG, Issue templates, PR templates, CODEOWNERS, Copilot Instructions, FUNDING, FLOW-TASKS Prompt, HANDOFF Prompt |
| Activity & Engagement | 10%    | Commit frequency, PR/Issue counts, contributor activity                                                                                                                             |
| Security              | 10%    | Critical/high Dependabot vulnerability alerts and open secret-scanning alerts                                                                                                       |

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

June 2026 - Q2 2026 shipped features added; Planned section updated for Q3
