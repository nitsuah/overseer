# GitHub OAuth Preview Deployment Fix

## Problem

Your GitHub OAuth authentication is failing with a "Configuration" error because of a URL mismatch between where you're accessing the site and where OAuth is redirecting.

## Current Status

- **Accessing site at**: `https://devserver-fix-gh-auth--ghoverseer.netlify.app`
- **OAuth redirecting to**: `https://fix-gh-auth--ghoverseer.netlify.app`
- **Error**: Configuration error during OAuth callback
- **Root Cause**: URL mismatch - the site uses `DEPLOY_PRIME_URL` for OAuth but is accessed via the devserver URL

## Solution

### Option 1: Add BOTH URLs to GitHub OAuth App (Recommended)

1. Go to your GitHub OAuth App settings:
   - Visit: https://github.com/settings/developers
   - Select your Overseer OAuth App

2. Add BOTH preview deployment callback URLs:

   ```
   https://fix-gh-auth--ghoverseer.netlify.app/api/auth/callback/github
   https://devserver-fix-gh-auth--ghoverseer.netlify.app/api/auth/callback/github
   ```

3. Click "Update application"

4. Try logging in again - it should work now

### Option 2: Use Production OAuth App (Alternative)

If you don't want to keep updating callback URLs for each preview:

1. Ensure your production OAuth App has:

   ```
   https://ghoverseer.netlify.app/api/auth/callback/github
   ```

2. In your auth configuration, you could force using production URL for OAuth callbacks (though this is not recommended for testing)

### Option 3: Development OAuth App (Recommended for Testing)

Create a separate GitHub OAuth App specifically for development/testing:

1. Create new OAuth App:
   - **Name**: `Overseer Dev`
   - **Homepage**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:3000/api/auth/callback/github`

2. Use these credentials locally with `netlify dev`

3. For preview deployments, you'll still need to add each preview URL (or use production)

## Why This Happens

GitHub OAuth Apps require you to explicitly list all authorized callback URLs for security. Netlify creates unique URLs for each branch preview (e.g., `fix-gh-auth--ghoverseer.netlify.app`), and GitHub will reject OAuth callbacks to URLs not in your app's whitelist.

## Recommended Workflow

For active development with preview deployments:

1. **Production OAuth App**: Keep for `ghoverseer.netlify.app`
2. **Local OAuth App**: Use for `localhost:3000` development
3. **Add preview URLs as needed**: When testing specific branches

## Next Steps

1. Add the preview URL to your GitHub OAuth App (Option 1 above)
2. Refresh the page and try signing in again
3. Once it works, merge to main so future users hit the production URL

---

**Current Preview URLs to Add**:

```
https://fix-gh-auth--ghoverseer.netlify.app/api/auth/callback/github
https://devserver-fix-gh-auth--ghoverseer.netlify.app/api/auth/callback/github
```

Note: Netlify dev server creates the `devserver-` prefix for local dev mode.
