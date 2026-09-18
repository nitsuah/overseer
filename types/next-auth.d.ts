import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    /**
     * The GitHub user's stable numeric id (JWT `sub`), always present for a
     * valid session. Unlike `session.user.email` -- which GitHub can omit
     * when the account has no public email and the `/user/emails` fallback
     * request fails -- this is safe to use as a metering/identity key that
     * must never be silently absent (CWE-770).
     */
    userId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
