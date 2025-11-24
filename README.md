# Overseer

**Meta-Repository Intelligence Layer**

A dashboard that gives you and your AI agents a unified view across all your GitHub repositories.

## Features

- 📊 **Unified Dashboard** - See all your repos at a glance
- 📝 **Standardized Documentation** - ROADMAP.md, TASKS.md, METRICS.md parsing
- 🤖 **AI Agent APIs** - Programmatic access for automated workflows
- 🔗 **GitHub Integration** - Sync repo metadata, PRs, and deployment status
- 📈 **Metrics Tracking** - Test coverage, deployment status, documentation health

## Tech Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Netlify Functions (serverless)
- **Database:** Supabase (PostgreSQL)
- **APIs:** GitHub REST API via Octokit

## Getting Started

### Prerequisites

- Node.js 18+
- GitHub Personal Access Token
- Supabase account (free tier)

### Installation

```bash
# Clone the repo
git clone https://github.com/nitsuah/overseer.git
cd overseer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

```env
# GitHub
GITHUB_TOKEN=your_github_personal_access_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Project Structure

```
overseer/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard
│   └── repos/[name]/      # Repo detail pages
├── components/            # React components
├── lib/                   # Shared utilities
│   ├── parsers/          # MD file parsers
│   ├── github.ts         # GitHub API client
│   └── supabase.ts       # Supabase client
├── netlify/functions/    # Serverless API endpoints
├── templates/            # MD file templates
└── supabase/            # Database schema
```

## Standardized MD Files

Overseer expects repos to have these files for full functionality:

- **ROADMAP.md** - High-level objectives and quarterly plans
- **TASKS.md** - Granular task tracking with status
- **METRICS.md** - Test coverage and performance metrics

See `/templates` for examples.

## API Endpoints

### For AI Agents

```bash
# Get tasks for a repo
GET /api/tasks?repo=games

# Create a new task
POST /api/tasks
{
  "repo": "games",
  "title": "Fix bug in Asteroid",
  "status": "in-progress"
}

# Update task status
PATCH /api/tasks/:id
{
  "status": "done"
}
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

Apache 2.0 - See LICENSE file

## Author

Austin J. Hardy ([@nitsuah](https://github.com/nitsuah))
