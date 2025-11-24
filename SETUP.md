# Overseer Setup Guide

## Quick Start (5 minutes)

### 1. Create GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `overseer`
   - **Homepage URL:** `http://localhost:3000` (for local) or `https://ghoverseer.netlify.app` (for production)
   - **Authorization callback URL:** 
     ```
     http://localhost:3000/api/auth/callback/github
     https://ghoverseer.netlify.app/api/auth/callback/github
     ```
     *(Add both URLs, one per line)*
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"** and copy it

### 2. Set Up Environment Variables

Create `.env.local` in the project root:

```env
# GitHub OAuth (from step 1)
GITHUB_ID=your_client_id_here
GITHUB_SECRET=your_client_secret_here

# NextAuth Secret (run: openssl rand -base64 32)
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Netlify DB (leave empty for now, Netlify will auto-configure on deploy)
DATABASE_URL=
```

**Generate NextAuth Secret:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` → Click "Sign in with GitHub" → Authorize → Done!

---

## Deploy to Netlify

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repo (`nitsuah/overseer`)
4. Netlify will auto-detect Next.js settings
5. Click **"Deploy site"**

### 3. Add Netlify DB (Neon)

1. In your Netlify site dashboard, go to **"Integrations"**
2. Search for **"Neon"** and click **"Add integration"**
3. Click **"Create new database"**
4. Netlify will automatically set `DATABASE_URL` environment variable

### 4. Run Database Schema

1. In Netlify dashboard, go to **"Integrations" → "Neon"**
2. Click **"Open Neon Console"**
3. Go to **"SQL Editor"**
4. Copy the contents of `database/schema.sql` from your repo
5. Paste and run it

### 5. Add Environment Variables

In Netlify dashboard, go to **"Site configuration" → "Environment variables"**:

```
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=https://ghoverseer.netlify.app
```

*(DATABASE_URL is already set by Neon integration)*

### 6. Update GitHub OAuth App

Go back to your GitHub OAuth app settings and update:
- **Homepage URL:** `https://ghoverseer.netlify.app`
- **Authorization callback URL:** Add `https://ghoverseer.netlify.app/api/auth/callback/github`

### 7. Redeploy

Netlify will auto-deploy when you push to GitHub, or click **"Trigger deploy"** in the dashboard.

---

## Using Overseer

### First Sync

1. Sign in with GitHub
2. Click **"Sync Repos"** button
3. Overseer will fetch all your repos and parse MD files

### Add Standardized Docs to Your Repos

Copy templates from `/templates` to your repos:

```bash
# In each repo:
cp /path/to/overseer/templates/ROADMAP.md ./ROADMAP.md
cp /path/to/overseer/templates/TASKS.md ./TASKS.md
cp /path/to/overseer/templates/METRICS.md ./METRICS.md
```

Edit them for your project, commit, and sync again!

### Expandable Rows

Click any repo name to see:
- **Tasks:** Backlog, In Progress, Done
- **Roadmap:** Quarterly milestones
- **Docs:** Which MD files exist

---

## Troubleshooting

### "Not authenticated" error
- Make sure you've signed in with GitHub
- Check that `GITHUB_ID` and `GITHUB_SECRET` are set correctly

### "DATABASE_URL not configured"
- For local dev: Create a free Neon database at [neon.tech](https://neon.tech) and add the connection string
- For production: Make sure Neon integration is installed in Netlify

### OAuth callback error
- Verify callback URL matches exactly: `http://localhost:3000/api/auth/callback/github`
- Check that both URLs (local + production) are added to GitHub OAuth app

---

## Next Steps

- Add ROADMAP.md, TASKS.md to your repos
- Explore expandable rows
- Check doc health scores
- Deploy to production!
