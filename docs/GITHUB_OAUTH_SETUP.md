# GitHub OAuth Setup

## Quick Setup

### 1. Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: `Overseer`
   - **Homepage URL**: `http://localhost:3000` (or your Netlify URL)
   - **Callback URL**: `http://localhost:3000/api/auth/callback/github`

### 2. Environment Variables

Create `.env.local`:
```env
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

Generate secret:
```bash
# Mac/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Netlify Deployment

The system auto-detects deployment URLs. Just set these in Netlify environment variables:
- `GITHUB_ID`
- `GITHUB_SECRET`
- `NEXTAUTH_SECRET`

Add callback URL to GitHub OAuth app:
```
https://your-site.netlify.app/api/auth/callback/github
```

## Troubleshooting

**"redirect_uri not associated"**
- Verify callback URL is exactly: `/api/auth/callback/github` (not `/signin/`)
- Check URL in GitHub OAuth settings matches deployment

**Preview Deployments**
- Create separate OAuth app for dev/previews
- Or manually add preview URLs to GitHub OAuth app

See [SETUP.md](../SETUP.md) for full deployment guide.
