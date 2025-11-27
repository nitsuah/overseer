# GitHub OAuth Setup

## Github Auth issues

Solving GitHub Auth (NextAuth v5)

Since you are using NextAuth v5, the setup is slightly stricter than v4. You likely have issues with callback URLs or scopes (since Overseer needs to write to your repos to open PRs).

The "Two-App" Strategy

GitHub does not allow localhost and production URLs in the same OAuth App. You need two separate OAuth Apps in your GitHub Developer Settings.

Setting

Local Development App - Production App

Homepage URL
[http://localhost:3000]
[https://ghoverseer.netlify.app]

Callback URL
[http://localhost:3000/api/auth/callback/github]
[https://ghoverseer.netlify.app/api/auth/callback/github]

The Code Fix

(auth.ts)
Create or update your auth.ts (or app/api/auth/[...nextauth]/route.ts depending on your routing).
Crucially, you must request the repo scope so Overseer can read your code and open PRs.

```ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          // 'repo' scope is REQUIRED for Overseer to read private repos
          // and create PRs (write access).
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    // This passes the GitHub Access Token to your session
    // so you can use it in Octokit to make API calls later.
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
});
```

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

```text
https://your-site.netlify.app/api/auth/callback/github
```

## Troubleshooting

**"redirect_uri not associated"**

- Verify callback URL is exactly: `/api/auth/callback/github` (not `/signin/`)
- Check URL in GitHub OAuth settings matches deployment

**Preview Deployments**

- Create separate OAuth app for dev/previews
- Or manually add preview URLs to GitHub OAuth app

See [CONTRIBUTING.md](../CONTRIBUTING.md) for full development setup guide.
