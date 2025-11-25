# GitHub OAuth Setup for Overseer

## Overview
Overseer uses NextAuth v5 with GitHub OAuth for authentication. The system now supports dynamic URLs for Netlify deployments.

## Authentication Configuration

### Dynamic URL Detection
The `auth.ts` file automatically detects the deployment URL:
```typescript
// Priority: NEXTAUTH_URL > DEPLOY_URL (Netlify) > URL (Netlify) > localhost
const getBaseUrl = () => {
    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
    if (process.env.DEPLOY_URL) return process.env.DEPLOY_URL;
    if (process.env.URL) return process.env.URL;
    return 'http://localhost:3000';
};
```

### Key Settings
- `trustHost: true` - Required for Netlify and dynamic URLs
- `basePath: '/api/auth'` - Consistent routing across environments

## GitHub OAuth App Setup

### Important: Callback URL Format
The callback URL must use `/callback/` not `/signin/`:
```
https://your-domain.com/api/auth/callback/github
```

### Setup Steps

#### 1. Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `Overseer (Production)` or `Overseer (Development)`
   - **Homepage URL**: Your deployment URL
   - **Authorization callback URL**: `https://your-domain.com/api/auth/callback/github`

#### 2. For Production (Netlify)
**Callback URL**:
```
https://ghoverseer.netlify.app/api/auth/callback/github
```

**Environment Variables** (Netlify Dashboard → Site Settings → Environment Variables):
```
GITHUB_ID=<your_production_client_id>
GITHUB_SECRET=<your_production_client_secret>
NEXTAUTH_SECRET=<your_random_secret>
```

#### 3. For Local Development
**Callback URL** (add to same OAuth app or create separate):
```
http://localhost:3000/api/auth/callback/github
```

**Environment Variables** (`.env.local`):
```
GITHUB_ID=<your_dev_client_id>
GITHUB_SECRET=<your_dev_client_secret>
NEXTAUTH_SECRET=<your_random_secret>
NEXTAUTH_URL=http://localhost:3000
```

## Netlify Preview Deployments

### The Challenge
GitHub OAuth **does not support wildcard callback URLs**. Preview deployments have dynamic URLs like:
```
https://deploy-preview-123--ghoverseer.netlify.app
```

### Solutions

#### Option 1: Separate OAuth Apps (Recommended)
Create two GitHub OAuth Apps:
1. **Production** - For main Netlify site
2. **Development** - For localhost and previews

Configure Netlify environment variables with different scopes:
- **Production scope**: Use production OAuth credentials
- **Deploy Preview scope**: Use development OAuth credentials

#### Option 2: Manual URL Addition
For each preview deployment, manually add its callback URL to your GitHub OAuth app. **Not recommended** for frequent deployments.

#### Option 3: Skip Auth in Previews
Add logic to bypass authentication for preview deployments:
```typescript
if (process.env.CONTEXT === 'deploy-preview') {
  // Skip auth or use mock data
}
```

## Testing

### Local Development
```bash
npm run dev
```
Visit http://localhost:3000 and test GitHub login

### Production
Deploy to Netlify and test at your production URL

### Troubleshooting

**Error: "redirect_uri is not associated with this application"**
- Check that your callback URL is exactly: `https://your-domain.com/api/auth/callback/github`
- Verify the URL in GitHub OAuth app settings matches your deployment
- Make sure you're using `/callback/` not `/signin/`

**Error: "NEXTAUTH_URL not configured"**
- The system should auto-detect from Netlify environment variables
- If needed, manually set `NEXTAUTH_URL` in Netlify environment variables

## Environment Variables Reference

### Required
- `GITHUB_ID` - OAuth App Client ID
- `GITHUB_SECRET` - OAuth App Client Secret
- `NEXTAUTH_SECRET` - Random secret for session encryption

### Optional
- `NEXTAUTH_URL` - Override auto-detection (useful for debugging)

### Auto-Detected (Netlify)
- `DEPLOY_URL` - Current deployment URL
- `URL` - Main site URL
- `CONTEXT` - Deployment context (production, deploy-preview, branch-deploy)

## Security Notes
- Never commit `.env.local` to git
- Use different OAuth apps for production and development
- Rotate secrets regularly
- Use Netlify's environment variable scoping for security
