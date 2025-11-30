"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Github, Shield, Sparkles, LogOut } from "lucide-react";
import Image from "next/image";

export default function Header() {
    const { data: session, status } = useSession();

    if (status === "loading") return null;

    return (
        <header className="header-dark relative flex items-center justify-between px-5 py-4 text-white shadow-lg border-b border-white/10">
            {/* Left Cluster */}
            <div className="flex items-center gap-4">
                <div className="pulse-icon p-[2px] bg-gradient-to-tr from-indigo-600 via-purple-600 to-fuchsia-600">
                    <div className="rounded-full bg-slate-900/80 p-2">
                        <Shield className="h-6 w-6 text-indigo-300 drop-shadow" />
                    </div>
                </div>
                <div className="flex flex-col leading-tight">
                    <h1 className="text-xl md:text-2xl font-bold tracking-wide gradient-text flex items-center gap-2">
                        Overseer
                        <Sparkles className="h-4 w-4 text-fuchsia-300 animate-pulse" />
                        <span className="text-white/60 font-normal hidden sm:inline">| Dashboard</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`pill ${session ? 'pill-success' : 'pill-warn'}`}>{session ? 'Auth: Active' : 'Auth: Guest'}</span>
                        <span className="pill text-sky-300">v0.1.x</span>
                    </div>
                </div>
            </div>

            {/* Right Cluster */}
            <div className="flex items-center gap-5">
                {session ? (
                    <>
                        <div className="flex items-center gap-3">
                            {session.user?.image ? (
                                <div className="relative">
                                    <Image
                                        src={session.user.image}
                                        alt={session.user?.name ?? 'User'}
                                        width={40}
                                        height={40}
                                        className="rounded-full ring-2 ring-purple-500/40 shadow-md shadow-purple-900/40"
                                    />
                                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                                </div>
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">NA</div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{session.user?.name ?? 'User'}</span>
                                {session.user?.email && <span className="text-[11px] text-slate-400 truncate max-w-[140px]">{session.user.email}</span>}
                            </div>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="btn-raised btn-danger flex items-center gap-2 px-3 py-2"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => signIn('github', { redirectTo: '/' })}
                        className="btn-raised btn-primary-gradient flex items-center gap-2 px-5 py-2"
                    >
                        <Github className="h-5 w-5" />
                        <span className="font-semibold">Sign in with GitHub</span>
                    </button>
                )}
            </div>
        </header>
    );
}
