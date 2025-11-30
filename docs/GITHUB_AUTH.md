# GitHub OAuth Authentication - Complete Guide

## Current Status

### What Works ✅

- **Local Development** (`localhost:3000`): OAuth works perfectly with separate dev OAuth app
- **Production** (`ghoverseer.netlify.app`): working!

### What Doesn't Work ❌

- **Preview Deployments** (`fix-gh-auth--ghoverseer.netlify.app`): OAuth redirect points to production URL instead of preview URL

## Problem Summary

When accessing preview deployments (branch deploys on Netlify), NextAuth OAuth flow redirects to **production URL** (`https://ghoverseer.netlify.app`) instead of the **preview URL** (`https://fix-gh-auth--ghoverseer.netlify.app`).

### Evidence

```text
# Expected OAuth redirect (what should happen):
redirect_uri=https://fix-gh-auth--ghoverseer.netlify.app/api/auth/callback/github

# Actual OAuth redirect (what's happening):
redirect_uri=https://ghoverseer.netlify.app/api/auth/callback/github
```

This causes GitHub to reject the OAuth callback because the redirect_uri doesn't match the one registered in the OAuth app.

## What We Tried

### Attempt 1: ❌ Add Preview URL to GitHub OAuth App

**Action**: Added `https://fix-gh-auth--ghoverseer.netlify.app/api/auth/callback/github` to OAuth app callback URLs

**Result**: Failed - GitHub OAuth Apps only allow ONE callback URL per app (not multiple)

**Learning**: Need separate OAuth apps for different environments

---

### Attempt 2: ✅ Environment Variable Detection

**Action**: Updated `auth.ts` to detect and use `DEPLOY_PRIME_URL` for preview deployments

```typescript
const publicUrl = process.env.DEPLOY_PRIME_URL || process.env.URL || process.env.NEXTAUTH_URL;
if (publicUrl && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = publicUrl;
}
```

**Result**: Partially worked - logs showed `NEXTAUTH_URL` was set correctly to preview URL, but OAuth still redirected to production

**Learning**: Setting `NEXTAUTH_URL` isn't enough - NextAuth v5 has its own URL resolution

---

### Attempt 3: ❌ Force URL in NextAuth Config

**Action**: Added explicit `url` parameter to NextAuth config

```typescript
...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }),
```

**Result**: Failed - Still redirected to production URL

**Learning**: NextAuth v5 ignores the `url` parameter or has other env vars taking precedence

---

### Attempt 4: ❌ Force AUTH_URL Environment Variables

**Action**: Set both `AUTH_URL` and `AUTH_REDIRECT_PROXY_URL` to match `NEXTAUTH_URL`

```typescript
process.env.AUTH_URL = process.env.NEXTAUTH_URL;
process.env.AUTH_REDIRECT_PROXY_URL = process.env.NEXTAUTH_URL;
```

**Result**: Failed - Still redirected to production URL

**Learning**: Something else is overriding the URL resolution

---

### Attempt 5: ❌ Update GitHub OAuth App Client ID

**Action**: Verified Netlify is using correct OAuth App (`Ov23liXJIXQzCBJ94ttg`) with preview callback URL configured

**Result**: Failed - OAuth app configuration was correct but redirect still went to production

**Learning**: Not a client ID mismatch issue

---

## Root Cause Hypothesis

NextAuth v5 in production/preview deployments appears to:

1. Detect it's running on Netlify
2. Use the primary site URL (`URL` env var = `https://ghoverseer.netlify.app`) for OAuth callbacks
3. Ignore `DEPLOY_PRIME_URL` and `NEXTAUTH_URL` overrides

Possible reasons:

- NextAuth v5 has hardcoded Netlify URL detection that prioritizes `URL` over `DEPLOY_PRIME_URL`
- Netlify's edge functions or build environment sets an env var we're not checking
- NextAuth is reading from a different source (headers, request context) rather than env vars
- There's a build-time vs runtime env var mismatch

## Current Workaround

**Merge to production and test there.** If production works, the issue is specific to preview deployments.

## OAuth App Configuration

### Local Development OAuth App

- **Client ID**: `Ov23linAE4aBxxDuEGUa` (in `.env.local`)
- **Homepage URL**: `http://localhost:3000`
- **Callback URL**: `http://localhost:3000/api/auth/callback/github`
- **Status**: ✅ Working

### Production OAuth App

- **Client ID**: `Ov23liXJIXQzCBJ94ttg` (in Netlify env vars)
- **Homepage URL**: `https://fix-gh-auth--ghoverseer.netlify.app/` (or should be `https://ghoverseer.netlify.app`)
- **Callback URL**: `https://fix-gh-auth--ghoverseer.netlify.app/api/auth/callback/github` (or should be `https://ghoverseer.netlify.app/api/auth/callback/github`)
- **Status**: ⏳ Testing pending (after merge to prod)

## Three New Strategies to Try

### Strategy 1: Request Header Based URL Detection 🔧

**Theory**: NextAuth might be reading the URL from request headers rather than env vars. We could override the redirect URL based on the actual `Host` header from the incoming request.

**Implementation**:

```typescript
// In auth.ts providers config
GitHub({
  clientId: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  authorization: {
    params: {
      scope: 'repo read:user user:email',
      // Force redirect_uri based on request context
      redirect_uri: undefined, // Will be set dynamically
    },
  },
  // Add custom authorization URL builder
  authorization(request) {
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const redirectUri = `${protocol}://${host}/api/auth/callback/github`;

    return {
      url: 'https://github.com/login/oauth/authorize',
      params: {
        scope: 'repo read:user user:email',
        redirect_uri: redirectUri,
      },
    };
  },
}),
```

**Pros**:

- Uses actual request URL (what user sees)
- Works for any deployment URL automatically
- No env var configuration needed

**Cons**:

- Might not work if NextAuth doesn't support custom authorization builder
- Need to ensure GitHub OAuth app allows dynamic callback URLs (it doesn't - need wildcard or multiple apps)

---

### Strategy 2: Separate OAuth Apps Per Environment with Build-Time Selection 🏗️

**Theory**: Instead of trying to force one OAuth app to work everywhere, use completely separate apps and select at build time based on Netlify context.

**Implementation**:

```typescript
// In auth.ts
const isPreview = process.env.CONTEXT === 'deploy-preview';
const isProduction = process.env.CONTEXT === 'production';

const githubConfig = isPreview
  ? {
      clientId: process.env.GITHUB_ID_PREVIEW,
      clientSecret: process.env.GITHUB_SECRET_PREVIEW,
      // Preview OAuth app configured for *.netlify.app wildcard (if GitHub supports it)
    }
  : {
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    };

GitHub(githubConfig);
```

**Netlify Env Vars**:

- `GITHUB_ID` / `GITHUB_SECRET` - Production app
- `GITHUB_ID_PREVIEW` / `GITHUB_SECRET_PREVIEW` - Preview app
- Use Netlify's environment-specific variables feature

**GitHub OAuth App Setup**:

- **Preview OAuth App**: Homepage = `https://deploy-preview-*--ghoverseer.netlify.app`
- **Production OAuth App**: Homepage = `https://ghoverseer.netlify.app`

**Pros**:

- Clean separation of concerns
- Each environment fully isolated
- Easy to debug - know exactly which app is used
- Can have different scopes/permissions per environment

**Cons**:

- Need to maintain two OAuth apps
- GitHub doesn't support wildcard URLs (but you could add multiple specific preview URLs)
- More configuration overhead

---

### Strategy 3: Middleware-Based URL Rewriting 🔄

**Theory**: The issue might be that NextAuth is determining the URL too early (at build/import time). Use middleware to intercept OAuth requests and rewrite URLs dynamically.

**Implementation**:

```typescript
// In middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept OAuth signin requests
  if (pathname.startsWith('/api/auth/signin')) {
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

    // Force NEXTAUTH_URL in headers for this request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-forwarded-host', host || '');
    requestHeaders.set('x-forwarded-proto', protocol);

    // Clone request with updated headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}
```

Additionally, configure NextAuth to trust proxy headers:

```typescript
// In auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
  // ... rest of config
});
```

**Pros**:

- Works at request time (not build time)
- Uses the actual incoming request URL
- No need for multiple OAuth apps
- `trustHost: true` tells NextAuth to use proxy headers

**Cons**:

- More complex architecture
- Might conflict with Netlify's own proxy setup
- Need to ensure GitHub OAuth app accepts the dynamic URLs

---

## Recommendation Priority

1. **Strategy 3 (Middleware)** - Try first, likely to work because NextAuth supports `trustHost` and proxy headers
2. **Strategy 2 (Separate Apps)** - Most reliable fallback, but requires maintenance
3. **Strategy 1 (Request Headers)** - Might not be supported by NextAuth v5 API

## Testing Plan

After merge to production:

1. **Verify production works** - Test OAuth on `ghoverseer.netlify.app`
2. **Check environment variables** - Log all Netlify env vars during build to see what's available
3. **Test middleware approach** - Implement Strategy 3 and create new preview deployment
4. **Compare local vs preview behavior** - Debug why local works but preview doesn't

## Additional Debugging Steps

1. **Add verbose logging in auth.ts**:

```typescript
logger.info('ALL ENV VARS:', {
  AUTH_URL: process.env.AUTH_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  URL: process.env.URL,
  DEPLOY_URL: process.env.DEPLOY_URL,
  DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
  CONTEXT: process.env.CONTEXT,
  BRANCH: process.env.BRANCH,
});
```

1. **Check NextAuth's resolved config** at runtime (in browser console)
2. **Test with NextAuth debug mode** enabled (already have `debug: true`)
3. **Review NextAuth v5 changelog** for Netlify-specific behaviors

## Related Documentation Files

- `GITHUB_OAUTH_SETUP.md` - Basic OAuth setup instructions
- `GITHUB_OAUTH_ORG_ACCESS.md` - Organization access restrictions
- `OAUTH_ORG_FIX_SUMMARY.md` - OAuth restriction error handling implementation
- `OAUTH_FIX_INSTRUCTIONS.md` - Preview deployment troubleshooting (outdated)

## Key Takeaways

1. **Local works, preview doesn't** = Environment-specific configuration issue
2. **NextAuth v5 URL resolution is opaque** = Hard to debug, limited documentation
3. **GitHub OAuth is strict** = One callback URL per app (no wildcards)
4. **Netlify preview URLs are dynamic** = Can't pre-register all possible URLs

The issue is almost certainly in how NextAuth v5 resolves the base URL in Netlify's preview deployment environment. Once we confirm production works, we'll know the problem is isolated to preview deployments and can implement one of the three strategies above.
