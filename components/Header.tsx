"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Github, Shield } from "lucide-react";
import Image from "next/image";

export default function Header() {
    const { data: session, status } = useSession();

    if (status === "loading") return null;

    return (
        <header className="flex items-center justify-between bg-linear-to-r from-indigo-600 to-purple-600 p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold tracking-wider">
                    Overseer <span className="text-white/70 font-normal">| Dashboard</span>
                </h1>
            </div>
            <div className="flex items-center gap-4">
                {session ? (
                    <>
                        <div className="flex items-center gap-3">
                            {session.user?.image && (
                                <Image 
                                    src={session.user.image} 
                                    alt={session.user?.name ?? "User"} 
                                    width={32}
                                    height={32}
                                    className="rounded-full border-2 border-white/30"
                                />
                            )}
                            <span className="text-sm opacity-80">{session.user?.name ?? "User"}</span>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-1 rounded-md bg-black px-3 py-1 text-sm hover:bg-red-600 transition-colors"
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => signIn("github", { callbackUrl: "/" })}
                        className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm hover:bg-slate-800 transition-colors"
                    >
                        <Github className="h-5 w-5" />
                        Sign in with GitHub
                    </button>
                )}
            </div>
        </header>
    );
}
