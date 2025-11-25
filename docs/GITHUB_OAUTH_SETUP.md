# GitHub OAuth Setup for Netlify Previews

## The Problem
GitHub OAuth does not support wildcard callback URLs, so Netlify preview deployments (with URLs like `deploy-preview-123--ghoverseer.netlify.app`) cannot authenticate unless their specific URL is added to the GitHub OAuth app.

## Solution: Two GitHub OAuth Apps

### 1. Create Two GitHub OAuth Apps

#### Production OAuth App
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: `Overseer (Production)`
   - **Homepage URL**: `https://ghoverseer.netlify.app`
   - **Authorization callback URL**: `https://ghoverseer.netlify.app/api/auth/callback/github`
4. Save the **Client ID** and **Client Secret**

#### Development OAuth App
1. Create another OAuth App
2. Fill in:
   - **Application name**: `Overseer (Development)`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Save the **Client ID** and **Client Secret**

### 2. Configure Netlify Environment Variables

#### For Production Site
1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Set **Production** scope variables:
   ```
   GITHUB_ID=<production_client_id>
   GITHUB_SECRET=<production_client_secret>
   NEXTAUTH_SECRET=<your_secret>
   ```

#### For Deploy Previews
1. In the same Environment Variables section
2. Set **Deploy Preview** scope variables:
   ```
   GITHUB_ID=<development_client_id>
   GITHUB_SECRET=<development_client_secret>
   NEXTAUTH_SECRET=<your_secret>
   ```

### 3. Local Development (.env.local)

Create a `.env.local` file in your project root:
```env
GITHUB_ID=<development_client_id>
GITHUB_SECRET=<development_client_secret>
NEXTAUTH_SECRET=<your_secret>
NEXTAUTH_URL=http://localhost:3000
```

## How It Works

The updated `auth.ts` file now:
1. Sets `trustHost: true` to allow dynamic URLs
2. Uses `basePath: '/api/auth'` for consistent routing
3. Automatically detects the deployment URL from environment variables

Netlify automatically provides:
- `DEPLOY_URL` - The URL of the current deploy
- `URL` - The main site URL

The auth system will use these to construct the correct callback URL.

## Testing

### Local Development
```bash
npm run dev
```
Visit http://localhost:3000 and test GitHub login

### Production
Deploy to Netlify and test at https://ghoverseer.netlify.app

### Preview Deployments
**Important**: Preview deployments will still fail unless you:
1. Use the development OAuth app credentials for preview deployments (configured in Netlify)
2. Manually add each preview URL to the development OAuth app's callback URLs

## Recommended Approach

For preview deployments, the most practical solution is:
1. **Skip authentication in preview deployments** - Add a check to bypass auth for preview URLs
2. **Use a development OAuth app** - Configure it with a generic callback that you update as needed
3. **Test authentication only in production** - Focus preview deployments on UI/functionality testing

Would you like me to implement option 1 (skip auth in previews) for easier testing?
