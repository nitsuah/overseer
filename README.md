# Overseer

> **Meta-Repository Intelligence Layer**
> A dashboard that gives you and your AI agents a unified view across all your GitHub repositories.

## Mission Statement

🛡️ Overseer Mission: The "Meta-Repository" Standard

We believe that a healthy codebase is self-documenting, standardized, and AI-ready.

Overseer is not just a dashboard; it is an intelligence layer that sits above your Git repositories. Its mission is to bridge the gap between human developer intent and AI agent execution. By enforcing a strict documentation standard (ROADMAP, TASKS, METRICS) and visualizing the flow from "Strategy" to "Shipped Code," Overseer eliminates the context-switching tax of modern development.

We aim to:

- Standardize Context: Ensure every repo provides the necessary context windows for both humans and AI agents to contribute immediately.
- Visualize Momentum: Move beyond "commits" and track the true velocity of ideas turning into features.
- Automate Governance: Use AI to act as a gentle guardian, ensuring roadmap items are defined and documentation is never stale, without interfering with the granular code workflow.

Overseer gives you the input/output controls of a project manager, committed directly to the git history you already own.

## Features

- 📊 **Unified Dashboard** - See all your repos at a glance with health scores and filtering
- 📝 **Standardized Documentation** - ROADMAP.md, TASKS.md, METRICS.md parsing and tracking
- 🤖 **AI-Powered Summaries** - Generate repository descriptions using Google Gemini
- 🔧 **Automated Doc Fixes** - One-click PR creation for missing documentation
- 🔗 **GitHub Integration** - OAuth authentication and full repo metadata sync
- 📈 **Health Metrics** - Documentation coverage, testing status, and composite health scores
- ➕ **Custom Repos** - Track any public GitHub repository, not just your own

## Tech Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- **Backend:** Netlify Functions (serverless)
- **Database:** Neon Postgres (serverless)
- **Auth:** NextAuth v5 with GitHub OAuth
- **APIs:** GitHub REST API via Octokit, Google Gemini AI
- **Testing:** Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
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

See `LICENSE.md` file

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
3. Verify all linked files (CONTRIBUTING.md, LICENSE.md) exist
4. Keep feature list in sync with FEATURES.md
5. Update tech stack when adding/removing major dependencies
6. Ensure API endpoint documentation matches actual routes
7. Add screenshots or diagrams for major UI changes
-->
