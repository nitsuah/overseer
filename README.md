# Overseer

[![CI](https://github.com/nitsuah/overseer/actions/workflows/ci.yml/badge.svg)](https://github.com/nitsuah/overseer/actions)

[![Netlify Status](https://api.netlify.com/api/v1/badges/ebf5c761-34fb-495b-bd86-ea57932296b3/deploy-status)](https://app.netlify.com/projects/ghoverseer/deploys)

> **Meta-Repository Intelligence Layer**
> A dashboard that gives you and your AI agents a unified view across all your GitHub repositories.

## Mission Statement

Overseer bridges human intent and AI execution through enforced documentation standards (ROADMAP, TASKS, METRICS, FEATURES).

**Key Outcomes:**

- **Standardized Context**: Every repo provides necessary context for immediate contribution
- **Visible Momentum**: Track velocity from strategy to shipped code
- **Automated Governance**: AI maintains documentation health without blocking workflow

## Features

- 📊 **Repository Intelligence** - Health scoring, doc tracking, activity monitoring
- 🤖 **AI Automation** - Gemini-powered summaries, failover, and context-aware doc generation with multi-stage RAG
- 🔧 **One-Click Fixes** - PR creation for docs, 9 best practices, 10 community standards
- 🎯 **Interactive Onboarding** - 16-step guided tour with spotlight highlighting
- 🔗 **GitHub Integration** - OAuth auth, full metadata sync, rate limit monitoring, custom repo paths
- 📈 **Composite Metrics** - Testing (60%+ coverage), vulnerabilities, contributor analytics

## Tech Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- **Backend:** Netlify Functions (serverless)
- **Database:** Neon Postgres (serverless)
- **Auth:** NextAuth v5 with GitHub OAuth
- **APIs:** GitHub REST API via Octokit, Google Gemini, OpenAI, Anthropic
- **Testing:** Vitest + Playwright E2E

## Getting Started

### Prerequisites

- Node.js 20.x
- GitHub OAuth App (for authentication)
- Neon Postgres database (free tier)
- Google Gemini API key (optional, for AI summaries)

### Installation

```bash
# Clone the repo
git clone https://github.com/nitsuah/overseer.git
cd overseer

# Install dependencies
npm install

# Set up environment variables (see CONTRIBUTING.md for details)
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
npm run setup-db

# Run development server
npm run dev
```

**For detailed setup instructions, see [CONTRIBUTING.md](./CONTRIBUTING.md)**

### Docker Validation

```bash
# Build the production image without injecting real secrets
docker build -t overseer-devops-check .

# Run unit tests in the test container
docker compose -f docker-compose.test.yml run --rm test

# Run unit coverage in the test container
docker compose -f docker-compose.test.yml run --rm coverage
```

### Environment Variables

```env
# GitHub OAuth
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret

# NextAuth
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

# Neon Database (get from Neon console or Netlify)
DATABASE_URL=postgresql://user:pass@host/db

# Google Gemini (optional - for AI summaries)
GEMINI_API_KEY=your_gemini_api_key

# Optional model override
GEMINI_MODEL_NAME=models/gemini-2.5-flash

# Optional Netlify
NETLIFY_SITE_ID=
NETLIFY_AUTH_TOKEN=
```

## Project Structure

```bash
overseer/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard
│   ├── api/               # API routes
│   │   ├── repos/         # Repo management endpoints
│   │   └── sync-repos/    # Sync trigger endpoint
│   └── login/             # Auth pages
├── components/            # React components
├── lib/                   # Shared utilities
│   ├── parsers/          # MD file parsers (roadmap, tasks, metrics)
│   ├── github.ts         # GitHub API client
│   ├── db.ts             # Neon database client
│   ├── ai.ts             # Google Gemini integration
│   └── sync.ts           # Repository sync logic
├── netlify/functions/    # Serverless API endpoints
│   └── sync-repos.ts     # Background sync job
├── templates/            # MD file templates
└── database/            # Database schema & migrations
```

## Standardized MD Files

Overseer expects repos to have these files for full functionality:

- **README.md** - Project overview and setup instructions
- **ROADMAP.md** - High-level objectives and quarterly plans
- **TASKS.md** - Granular task tracking with status
- **METRICS.md** - Test coverage and performance metrics

See `/templates` for examples with AI agent instructions.

## API Endpoints

### Repository Management

```bash
# Get all repositories
GET /api/repos

# Get repository details
GET /api/repo-details/[name]

# Add a custom repository
POST /api/repos/add
{
  "url": "owner/repo" or "https://github.com/owner/repo"
}

# Hide a repository
POST /api/repos/[name]/hide

# Fix missing documentation (single file)
POST /api/repos/[name]/fix-doc
{
  "docType": "readme" | "roadmap" | "tasks" | "metrics"
}

# Fix all missing documentation
POST /api/repos/[name]/fix-all-docs

# Generate AI summary
POST /api/repos/[name]/generate-summary

# Sync all repositories
POST /api/sync-repos
```

## Deployment

Deploy to Netlify:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

## License

See `LICENSE` file

## Author

Austin J. Hardy ([@nitsuah](https://github.com/nitsuah))

<!--
AGENT INSTRUCTIONS:
This is the primary project documentation file.

CRITICAL FORMAT REQUIREMENTS:
1. Keep introduction clear and concise (project name, tagline, mission)
2. Features section should list key capabilities
3. Tech stack should be current and accurate
4. Getting Started must have working installation steps
5. Environment variables section must be complete
6. API endpoints should document all available routes

When updating:
1. Test all installation commands before committing
2. Update version numbers when dependencies change
3. Verify all linked files (CONTRIBUTING.md, LICENSE) exist
4. Keep feature list in sync with FEATURES.md
5. Update tech stack when adding/removing major dependencies
6. Ensure API endpoint documentation matches actual routes
7. Add screenshots or diagrams for major UI changes
-->
