"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Github } from "lucide-react";

export default function Header() {
    const { data: session, status } = useSession();

    if (status === "loading") return null;

    return (
        <header className="flex items-center justify-between bg-linear-to-r from-indigo-600 to-purple-600 p-4 text-white shadow-lg">
            <h1 className="text-2xl font-bold tracking-wider">Overseer Dashboard</h1>
            <div className="flex items-center gap-4">
                {session ? (
                    <>
                        <span className="text-sm opacity-80">{session.user?.name ?? "User"}</span>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => signIn("github", { callbackUrl: "/" })}
                        className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
                    >
                        <Github className="h-5 w-5" />
                        Sign in with GitHub
                    </button>
                )}
            </div>
        </header>
    );
}
