import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import logger from './lib/log';

// Validate required environment variables
if (!process.env.GITHUB_ID) {
    throw new Error('Missing required environment variable: GITHUB_ID');
}
if (!process.env.GITHUB_SECRET) {
    throw new Error('Missing required environment variable: GITHUB_SECRET');
}
if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('Missing required environment variable: NEXTAUTH_SECRET');
}

logger.info('Initializing NextAuth with:', {
    githubIdPresent: !!process.env.GITHUB_ID,
    githubSecretPresent: !!process.env.GITHUB_SECRET,
    nextauthSecretPresent: !!process.env.NEXTAUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    basePath: '/api/auth',
    debug: true, // enable verbose logging
    trustHost: true, // Required for Netlify preview deployments with dynamic URLs
    useSecureCookies: process.env.NODE_ENV === 'production', // Use secure cookies in production
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            authorization: {
                params: {
                    scope: 'repo read:user user:email',
                },
            },
            // Safely map profile fields; avoid undefined .toString()
            profile(profile) {
                return {
                    id: profile.id?.toString(),
                    name: profile.name ?? profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            logger.debug('JWT callback', { token, account });
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            logger.debug('Session callback', { session, token });
            // Extend session with accessToken (type augmentation)
            (session as typeof session & { accessToken?: string }).accessToken = token.accessToken as string;
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Log redirect attempts to debug localhost issue
            logger.info('Redirect callback', { url, baseUrl, env: process.env.NODE_ENV });
            // Always redirect to the same domain
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
    },
});
