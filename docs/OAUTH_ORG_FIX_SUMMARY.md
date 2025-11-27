# OAuth Organization Access - Implementation Summary

## Problem

When users try to create PRs for organization-owned repositories, they get an error:

```
Although you appear to have the correct authorization credentials, the `Nitsuah-Labs` organization has enabled OAuth App access restrictions
```

This is a GitHub security feature where organizations can restrict which OAuth apps can access their data.

## Solution Implemented

### 1. Error Detection & Parsing (`lib/github-errors.ts`)

Created a comprehensive error parsing system that:

- Detects OAuth restriction errors specifically
- Extracts organization name from error message
- Provides user-friendly error messages
- Includes actionable help URLs
- Handles other common GitHub errors (permissions, not found, rate limits)

### 2. Enhanced API Error Responses

Updated API routes to return detailed error information:

- `/api/repos/[name]/fix-doc`
- `/api/repos/[name]/fix-best-practice`

Error response now includes:

```json
{
  "error": "User-friendly message",
  "type": "oauth_restriction",
  "instructions": "Step-by-step authorization guide",
  "helpUrl": "https://docs.github.com/..."
}
```

### 3. Frontend Error Handling (`hooks/useRepoActions.ts`)

Enhanced the fix handlers to:

- Detect OAuth restriction errors
- Display helpful error messages in toast
- Log detailed instructions to console
- Offer to open GitHub help documentation
- Provide confirmation dialog for help resources

### 4. Comprehensive Documentation

Created `docs/GITHUB_OAUTH_ORG_ACCESS.md` with:

- Clear explanation of the issue
- Step-by-step authorization instructions for admins
- Step-by-step request instructions for members
- Troubleshooting guide
- Security considerations
- FAQ section

## How It Works Now

### For Organization Admins/Owners:

1. User clicks "Fix" button on org repo
2. Gets error with clear message: "The [org] organization has OAuth App access restrictions enabled"
3. Confirmation dialog offers to open help docs
4. User follows instructions to grant access at: `https://github.com/organizations/[ORG]/settings/oauth_application_policy`
5. After granting access, user can retry the fix action

### For Organization Members:

1. User clicks "Fix" button
2. Gets same clear error message
3. User follows instructions to request access at: `https://github.com/settings/connections/applications`
4. Waits for admin approval
5. After approval, user can retry

### For Personal Repos & Authorized Org Repos:

Works immediately as before - no changes to successful flow.

## What You Need to Do

### As Owner of Nitsuah-Labs Organization:

**Option 1: Grant access for everyone (recommended)**

1. Go to: https://github.com/organizations/Nitsuah-Labs/settings/oauth_application_policy
2. Find "Overseer" in the list
3. Click "Grant" to approve for all members

**Option 2: Approve per-member requests**

1. Wait for members to request access
2. Review and approve each request individually

### Current OAuth Scopes

The app already requests the correct scopes in `auth.ts`:

```typescript
scope: 'repo read:user user:email';
```

- ✅ `repo` - Full access to repositories (needed for creating PRs)
- ✅ `read:user` - Read user profile
- ✅ `user:email` - Read email addresses

These are the standard scopes needed for repository management tools.

## Testing the Fix

1. Try to fix a doc/practice on a Nitsuah-Labs repo
2. You should see the improved error message
3. Console will show detailed authorization instructions
4. Confirmation dialog will offer to open help docs
5. After authorizing at GitHub, retry should work

## For Other Users

### Contributors/Collaborators on Org Repos:

If they have **write access** to a repository, they can create PRs, but:

- The organization must have OAuth restrictions configured to allow the app
- OR the user must be an organization member with approved app access

### Personal Repositories:

No changes needed - OAuth works immediately upon sign-in.

## Additional Benefits

The new error handling system also catches:

- **Permission errors**: When user lacks write access
- **Not found errors**: When repo is deleted/inaccessible
- **Rate limit errors**: When GitHub API limits are hit
- **Unknown errors**: With helpful context

All errors now provide user-friendly messages instead of raw GitHub API errors.

## Files Modified

1. ✅ `lib/github-errors.ts` (new) - Error parsing utilities
2. ✅ `app/api/repos/[name]/fix-doc/route.ts` - Enhanced error handling
3. ✅ `app/api/repos/[name]/fix-best-practice/route.ts` - Enhanced error handling
4. ✅ `hooks/useRepoActions.ts` - Frontend error display
5. ✅ `docs/GITHUB_OAUTH_ORG_ACCESS.md` (new) - User documentation

## Next Steps

1. **Authorize Overseer for Nitsuah-Labs org** (you need to do this)
2. Test with an org-owned repo to verify the improved error messages
3. Consider adding a UI panel/modal for authorization instructions instead of just console.log + confirm dialog
4. Update main README.md to reference the OAuth org access doc
5. Consider adding a "Troubleshooting" section to the UI for common issues

## Notes

- The fix doesn't require users to reinstall or re-auth unless they want to clear their session
- Organizations can revoke access at any time
- This is standard GitHub OAuth behavior - not specific to your app
- Many popular GitHub integrations (CircleCI, Netlify, etc.) require the same authorization process
