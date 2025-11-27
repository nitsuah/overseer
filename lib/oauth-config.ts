/**
 * OAuth configuration and authorization URLs
 * This file provides client-side access to OAuth app URLs
 */

/**
 * Get the GitHub OAuth app authorization URL
 * This will be the direct link to manage organization access
 */
export function getGitHubAuthorizationUrl(): string {
    // In production, you may want to store this in an environment variable
    // For now, hardcode the client ID since it's public anyway (visible in auth flows)
    const clientId = 'Ov23liXJIXQzCBJ94ttg';
    
    if (clientId) {
        return `https://github.com/settings/connections/applications/${clientId}`;
    }
    
    // Fallback to general applications page
    return 'https://github.com/settings/connections/applications';
}

/**
 * Get help instructions for authorizing an organization
 */
export function getOrgAuthHelpText(orgName: string): string {
    return `To authorize Overseer for the ${orgName} organization:

1. Click the link that opened (or visit: ${getGitHubAuthorizationUrl()})
2. Scroll to "Organization access"
3. Find "${orgName}" in the list
4. Click "Grant" (if you're an admin) or "Request" (if you're a member)
5. Come back here and try again

If you're a member (not an admin), organization admins will need to approve your request.`;
}
