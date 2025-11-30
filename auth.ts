import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import logger from './lib/log';

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    basePath: '/api/auth',
    debug: true, // enable verbose logging
    trustHost: true, // Required for Netlify preview deployments with dynamic URLs
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
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
    },
});
