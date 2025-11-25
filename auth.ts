import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

// Dynamically determine the base URL for OAuth callbacks
// Priority: NEXTAUTH_URL > DEPLOY_URL (Netlify) > URL (Netlify) > localhost
const getBaseUrl = () => {
    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
    if (process.env.DEPLOY_URL) return process.env.DEPLOY_URL;
    if (process.env.URL) return process.env.URL;
    return 'http://localhost:3000';
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    basePath: '/api/auth',
    trustHost: true, // Required for Netlify and dynamic URLs
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            authorization: {
                params: {
                    scope: 'repo read:user user:email',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            // Extend session with accessToken (type augmentation)
            (session as typeof session & { accessToken?: string }).accessToken = token.accessToken as string;
            return session;
        },
    },
})
