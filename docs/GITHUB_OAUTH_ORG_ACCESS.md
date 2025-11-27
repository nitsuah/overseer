# GitHub OAuth App - Organization Access

## Overview

When using Overseer with organization-owned repositories, you may encounter an error message:

```text
The [organization] organization has enabled OAuth App access restrictions, meaning that data access to third-parties is limited.
```

This is a **GitHub security feature** that allows organizations to control which OAuth applications can access their data.

**Quick Fix:** When this error occurs, Overseer will automatically open the authorization page where you can grant access. Just follow the prompts!

## Solution for Organization Owners/Admins

If you're an **owner or admin** of the organization, you can grant access immediately:

### Method 1: From Organization Settings

1. Go to your organization's settings: `https://github.com/organizations/[YOUR_ORG]/settings/oauth_application_policy`
2. Find "Overseer" in the list of OAuth applications
3. Click "Grant" to approve access for all organization members
4. Optionally, you can review and approve specific permissions

### Method 2: From Your Personal Settings

1. Go to the [GitHub Applications page](https://github.com/settings/connections/applications)
   - **Or** use the direct link that Overseer opens for you when the error occurs
2. Find "Overseer" in the list of Authorized OAuth Apps
3. Click on "Overseer" to view details
4. Under "Organization access", find your organization
5. Click "Grant" to approve access immediately

## Solution for Organization Members

If you're a **member** (not an admin) of the organization:

1. When the error occurs, Overseer will automatically open the authorization page
2. Scroll to "Organization access" and find your organization
3. Click "Request" to send an approval request to organization admins
4. Wait for an admin to approve the request
5. Once approved, refresh the Overseer page and try again

**Alternative manual steps:**

1. Go to the [GitHub Applications page](https://github.com/settings/connections/applications)
2. Find "Overseer" in the list of Authorized OAuth Apps
3. Click on "Overseer" to view details
4. Under "Organization access", find your organization
5. Click "Request" to send an approval request to organization admins
6. Wait for an admin to approve the request
7. Once approved, refresh the Overseer page and try again

## How It Works

### OAuth Scopes

Overseer requests the following GitHub OAuth scopes:

- **`repo`** - Full control of private repositories (needed to create PRs, read files, etc.)
- **`read:user`** - Read user profile data
- **`user:email`** - Access user email addresses

These scopes are required for Overseer to:

- Sync repository metadata and file structure
- Create pull requests for documentation fixes
- Read repository contents for health analysis

### Personal vs Organization Repos

- **Personal repos**: OAuth works immediately after you sign in with GitHub
- **Organization repos**: Requires additional authorization per organization (this is what causes the error)

The distinction exists because:

- Personal repos are owned by you directly
- Organization repos have additional security layers controlled by org admins

## Troubleshooting

### "Still getting the error after granting access"

1. **Clear your session**: Sign out of Overseer and sign back in
2. **Re-authorize**: Go to GitHub settings → Applications → Overseer, and click "Revoke", then sign in to Overseer again
3. **Check organization settings**: Ensure the organization hasn't restricted OAuth app access entirely

### "I'm an admin but don't see the Grant button"

Your organization may have OAuth app access **completely disabled**. To enable it:

1. Go to: `https://github.com/organizations/[YOUR_ORG]/settings/oauth_application_policy`
2. Check the policy setting - it should be "Allow all OAuth apps" or "Only allow approved apps"
3. If set to "Deny all", you'll need to change this policy first

### "The organization doesn't appear in my OAuth apps list"

This usually means:

- You haven't tried to access any repos from that organization yet in Overseer
- The organization's repos aren't in your synced repositories list

Try:

1. Sync your repositories in Overseer
2. Click on an organization repo
3. Try to use a "Fix" button
4. The OAuth authorization prompt should appear

## For Collaborators on Organization Repos

If you're a **collaborator** (have write access but aren't a member):

- You should be able to create PRs if you have write permissions to the repository
- OAuth restrictions apply at the **organization** level, not repository level
- Contact the organization owner if you need access approved

## Security Considerations

### Why does GitHub have this feature?

Organization OAuth app restrictions exist to:

- Prevent unauthorized data access by third-party apps
- Give organizations control over their security posture
- Require explicit approval for each integration
- Protect sensitive organization data

### Is Overseer safe to authorize?

Overseer:

- Is open source - you can review all code
- Only requests necessary permissions (repo, read:user, user:email)
- Does not store your GitHub access token persistently (only in session)
- Only creates PRs when you explicitly click "Fix" buttons
- Does not have access to private organization secrets or settings

### Can I revoke access later?

Yes! You can revoke Overseer's access at any time:

1. Go to: `https://github.com/settings/connections/applications`
2. Find "Overseer"
3. Click "Revoke" to remove all access

## Additional Resources

- [GitHub Docs: OAuth App Access Restrictions](https://docs.github.com/en/organizations/managing-oauth-access-to-your-organizations-data/about-oauth-app-access-restrictions)
- [GitHub Docs: Approving OAuth Apps](https://docs.github.com/en/organizations/managing-oauth-access-to-your-organizations-data/approving-oauth-apps-for-your-organization)
- [GitHub Docs: Reviewing OAuth Applications](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/reviewing-your-authorized-integrations)

## Need Help?

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Try the troubleshooting steps above
3. Ensure your GitHub account has the necessary permissions
4. Open an issue in the Overseer repository with details about your setup
