// Utility functions for handling GitHub API errors

export interface GitHubErrorDetails {
    type: 'oauth_restriction' | 'permission_denied' | 'not_found' | 'rate_limit' | 'unknown';
    message: string;
    userMessage: string;
    actionable: boolean;
    helpUrl?: string;
}

/**
 * Parse GitHub API errors and provide user-friendly messages
 */
export function parseGitHubError(error: unknown): GitHubErrorDetails {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for OAuth App access restrictions
    if (
        errorMessage.includes('OAuth App access restrictions') ||
        errorMessage.includes('organization has enabled OAuth App access restrictions') ||
        errorMessage.includes('restricting-access-to-your-organization')
    ) {
        const orgMatch = errorMessage.match(/`([^`]+)`\s+organization/);
        const orgName = orgMatch ? orgMatch[1] : 'this organization';
        
        return {
            type: 'oauth_restriction',
            message: errorMessage,
            userMessage: `${orgName} organization requires authorization. Click here to grant access to Overseer.`,
            actionable: true,
            helpUrl: getOAuthAuthorizationUrl()
        };
    }
    
    // Check for permission/scope issues
    if (
        errorMessage.includes('Resource not accessible by integration') ||
        errorMessage.includes('insufficient permissions') ||
        errorMessage.includes('requires authentication') ||
        errorMessage.includes('Bad credentials')
    ) {
        return {
            type: 'permission_denied',
            message: errorMessage,
            userMessage: 'You don\'t have permission to perform this action. Make sure you have write access to the repository and try reconnecting your GitHub account.',
            actionable: true,
            helpUrl: undefined
        };
    }
    
    // Check for not found errors
    if (errorMessage.includes('Not Found') || errorMessage.includes('404')) {
        return {
            type: 'not_found',
            message: errorMessage,
            userMessage: 'Repository or resource not found. It may have been deleted or you may not have access to it.',
            actionable: false,
            helpUrl: undefined
        };
    }
    
    // Check for rate limiting
    if (
        errorMessage.includes('rate limit') ||
        errorMessage.includes('API rate limit exceeded')
    ) {
        return {
            type: 'rate_limit',
            message: errorMessage,
            userMessage: 'GitHub API rate limit exceeded. Please wait a few minutes and try again.',
            actionable: false,
            helpUrl: 'https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting'
        };
    }
    
    // Unknown error
    return {
        type: 'unknown',
        message: errorMessage,
        userMessage: `An unexpected error occurred: ${errorMessage}`,
        actionable: false,
        helpUrl: undefined
    };
}

/**
 * Generate authorization URL for the OAuth app
 * Uses the client ID from environment variables
 */
export function getOAuthAuthorizationUrl(): string {
    // The client ID is safe to expose - it's public anyway (visible in OAuth flows)
    const clientId = process.env.GITHUB_ID || 'Ov23liXJIXQzCBJ94ttg';
    
    if (clientId) {
        return `https://github.com/settings/connections/applications/${clientId}`;
    }
    // Fallback to general applications page
    return 'https://github.com/settings/connections/applications';
}

/**
 * Generate authorization instructions for organization access
 */
export function getOrgAuthInstructions(orgName: string, appName: string = 'Overseer'): string {
    return `
To authorize ${appName} for the ${orgName} organization:

1. Go to: https://github.com/settings/connections/applications
2. Find "${appName}" in the list of Authorized OAuth Apps
3. Click on "${appName}" to view details
4. Under "Organization access", find "${orgName}"
5. Click "Grant" or "Request" access
6. If you're an org admin, you can grant access immediately
7. If you're not an admin, a request will be sent to the org admins

For organization admins:
1. Go to: https://github.com/organizations/${orgName}/settings/oauth_application_policy
2. Review pending requests or approve the ${appName} application

Once authorized, refresh this page and try again.
    `.trim();
}

/**
 * Extract organization name from repository full name
 */
export function extractOrgName(repoFullName: string): string | null {
    const parts = repoFullName.split('/');
    if (parts.length !== 2) return null;
    
    const owner = parts[0];
    // Simple heuristic: org names often have dashes or are all lowercase
    // But we can't really determine this from the name alone
    // This is just a helper; the actual org restriction error will tell us
    return owner;
}
