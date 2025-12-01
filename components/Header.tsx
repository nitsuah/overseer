"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Github, Shield, Sparkles, LogOut, Zap, CheckCircle, AlertCircle, Tag, Plus, Filter, X, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useGeminiStatus } from "@/hooks/useGeminiStatus";
import { RepoType } from "@/lib/repo-type";

interface HeaderProps {
  repoCount?: { filtered: number; total: number };
  showAddRepo?: boolean;
  addRepoUrl?: string;
  addRepoType?: string;
  addingRepo?: boolean;
  showFilters?: boolean;
  syncing?: boolean;
  filterType?: RepoType | 'all';
  filterLanguage?: string;
  filterFork?: 'all' | 'no-forks' | 'forks-only';
  languages?: string[];
  onAddRepoUrlChange?: (url: string) => void;
  onAddRepoTypeChange?: (type: RepoType) => void;
  onAddRepoSubmit?: (e: React.FormEvent) => void;
  onToggleAddRepo?: () => void;
  onToggleFilters?: () => void;
  onSync?: () => void;
  onFilterTypeChange?: (type: RepoType | 'all') => void;
  onFilterLanguageChange?: (language: string) => void;
  onFilterForkChange?: (fork: 'all' | 'no-forks' | 'forks-only') => void;
  onClearFilters?: () => void;
}

const repoTypes: RepoType[] = ['web-app', 'game', 'tool', 'library', 'bot', 'research', 'unknown'];

export default function Header(props: HeaderProps = {}) {
    const { data: session, status } = useSession();
    const geminiStatus = useGeminiStatus();

    const {
        repoCount,
        showAddRepo,
        addRepoUrl,
        addRepoType,
        addingRepo,
        showFilters,
        syncing,
        filterType,
        filterLanguage,
        filterFork,
        languages = [],
        onAddRepoUrlChange,
        onAddRepoTypeChange,
        onAddRepoSubmit,
        onToggleAddRepo,
        onToggleFilters,
        onSync,
        onFilterTypeChange,
        onFilterLanguageChange,
        onFilterForkChange,
        onClearFilters,
    } = props;

    const hasActiveFilters = filterType && (filterType !== 'all' || filterLanguage !== 'all' || filterFork !== 'all');

    if (status === "loading") return null;

    return (
        <header className="header-dark relative flex items-center justify-between py-4 text-white shadow-lg border-b border-white/10">
        <div className="w-full flex items-center justify-between px-5">
            {/* Left Cluster */}
            <div className="flex items-center gap-4">
                {/* Super Zaazzed Icon */}
                <button
                    onClick={onSync}
                    disabled={syncing}
                    className="relative group/icon cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-opacity"
                    title="Sync all repositories"
                >
                    <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-600 via-purple-600 to-fuchsia-600 rounded-full opacity-50 group-hover/icon:opacity-75 blur-lg motion-safe:animate-pulse"></div>
                    <div className="relative pulse-icon p-[3px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 shadow-2xl shadow-purple-500/50 group-hover/icon:shadow-purple-400/70 transition-shadow duration-300">
                        <div className="rounded-full bg-gradient-to-br from-slate-900 to-slate-950 p-2.5 group-hover/icon:scale-110 active:scale-95 transition-transform duration-300">
                            <Shield className={`h-7 w-7 text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.8)] group-hover/icon:drop-shadow-[0_0_12px_rgba(165,180,252,1)] transition-transform duration-500 ${syncing ? 'animate-spin' : ''}`} />
                        </div>
                    </div>
                </button>
                <div className="flex flex-col leading-tight">
                    {/* Zaazzed Title */}
                    <h1 className="text-xl md:text-2xl font-black tracking-wider flex items-center gap-2">
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(192,132,252,0.5)] hover:drop-shadow-[0_0_15px_rgba(192,132,252,0.8)] transition-all duration-300">
                            Overseer
                        </span>
                        <Sparkles className="h-5 w-5 text-fuchsia-400 motion-safe:animate-pulse drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
                        <span className="bg-gradient-to-r from-sky-300/70 to-blue-300/70 bg-clip-text text-transparent font-semibold hidden sm:inline drop-shadow-[0_0_6px_rgba(125,211,252,0.3)]">
                            | Repos
                        </span>
                        {repoCount && (
                            <span className="pill relative overflow-hidden text-sky-300 font-bold shadow-lg shadow-sky-500/20 ml-2">
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent motion-safe:animate-[shimmer_3s_infinite]"></span>
                                <span className="relative">{repoCount.filtered}/{repoCount.total}</span>
                            </span>
                        )}
                    </h1>
                </div>
            </div>

            {/* Middle - Repo Controls */}
            {session && onToggleAddRepo && (
                <div className="flex items-center gap-2">
                    {/* Compact Add Repo */}
                    <div className="relative group/add">
                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg opacity-0 group-hover/add:opacity-20 blur transition-all duration-300 ${showAddRepo ? 'opacity-30' : ''}`}></div>
                        <div className={`relative flex items-center gap-2 bg-slate-800/90 border rounded-lg transition-all duration-300 ${
                            showAddRepo 
                                ? 'border-emerald-600/50 shadow-lg shadow-emerald-600/20 pr-2 py-2' 
                                : 'border-slate-700 hover:border-emerald-600/30 px-3 py-2'
                        }`}>
                            {showAddRepo ? (
                                <form onSubmit={onAddRepoSubmit} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={addRepoUrl}
                                        onChange={(e) => onAddRepoUrlChange?.(e.target.value)}
                                        placeholder="owner/repo"
                                        className="w-40 px-3 py-0 bg-transparent text-slate-200 placeholder:text-slate-500 focus:outline-none text-sm"
                                        autoFocus
                                    />
                                    <select
                                        value={addRepoType}
                                        onChange={(e) => onAddRepoTypeChange?.(e.target.value as RepoType)}
                                        className="px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-slate-300 focus:outline-none text-xs"
                                    >
                                        <option value="unknown">Type</option>
                                        <option value="web-app">Web App</option>
                                        <option value="game">Game</option>
                                        <option value="tool">Tool</option>
                                        <option value="library">Library</option>
                                        <option value="bot">Bot</option>
                                        <option value="research">Research</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={addingRepo || !addRepoUrl?.trim()}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded text-xs font-medium transition-all"
                                    >
                                        {addingRepo ? '...' : 'Add'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onToggleAddRepo}
                                        className="p-1 text-slate-400 hover:text-slate-200"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (showFilters) onToggleFilters?.();
                                        onToggleAddRepo();
                                    }}
                                    className="flex items-center gap-1.5 text-sm font-medium text-slate-300 group-hover/add:text-emerald-400 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Compact Filters */}
                    <div className="relative group/filter">
                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover/filter:opacity-20 blur transition-all duration-300 ${showFilters ? 'opacity-30' : ''}`}></div>
                        <div className={`relative flex items-center gap-2 bg-slate-800/90 border rounded-lg transition-all duration-300 ${
                            showFilters 
                                ? 'border-blue-600/50 shadow-lg shadow-blue-600/20 pr-2 py-2' 
                                : hasActiveFilters
                                    ? 'border-purple-600/50 px-3 py-2'
                                    : 'border-slate-700 hover:border-blue-600/30 px-3 py-2'
                        }`}>
                            {showFilters ? (
                                <div className="flex items-center gap-1.5">
                                    <select
                                        value={filterType}
                                        onChange={(e) => onFilterTypeChange?.(e.target.value as RepoType | 'all')}
                                        className="px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-slate-300 focus:outline-none text-xs"
                                    >
                                        <option value="all">Type</option>
                                        {repoTypes.map((t) => (
                                            <option key={t} value={t}>
                                                {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={filterLanguage}
                                        onChange={(e) => onFilterLanguageChange?.(e.target.value)}
                                        className="px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-slate-300 focus:outline-none text-xs"
                                    >
                                        <option value="all">Language</option>
                                        {languages.sort().map((lang) => (
                                            <option key={lang} value={lang}>
                                                {lang}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={filterFork}
                                        onChange={(e) => onFilterForkChange?.(e.target.value as 'all' | 'no-forks' | 'forks-only')}
                                        className="px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-slate-300 focus:outline-none text-xs"
                                    >
                                        <option value="all">Fork</option>
                                        <option value="no-forks">No Forks</option>
                                        <option value="forks-only">Forks Only</option>
                                    </select>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={onClearFilters}
                                            className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-slate-200"
                                        >
                                            Clear
                                        </button>
                                    )}
                                    <button
                                        onClick={onToggleFilters}
                                        className="p-1 text-slate-400 hover:text-slate-200"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (showAddRepo) onToggleAddRepo?.();
                                        onToggleFilters?.();
                                    }}
                                    className="flex items-center gap-1.5 text-sm font-medium transition-colors relative"
                                >
                                    <Filter className={`h-4 w-4 ${hasActiveFilters ? 'text-purple-400' : 'text-slate-300 group-hover/filter:text-blue-400'}`} />
                                    <span className={hasActiveFilters ? 'text-purple-400' : 'text-slate-300 group-hover/filter:text-blue-400'}>
                                        Filters
                                    </span>
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sync Button */}
            {onSync && (
                <button
                    onClick={onSync}
                    disabled={syncing}
                    className="flex items-center gap-1.5 px-3 py-2 btn-primary-gradient disabled:bg-slate-800 disabled:cursor-not-allowed rounded-lg transition-colors font-medium shadow-lg text-sm"
                >
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync'}
                </button>
            )}

            {/* Right Cluster */}
            <div className="flex items-center gap-3">
                {/* Ultra Zaazzed Status Pills - Icon Only with Hover Text, Stacked Vertically */}
                <div className="flex flex-col items-end gap-1.5">
                    <span 
                        className={`pill relative overflow-hidden ${session ? 'pill-success' : 'pill-warn'} shadow-lg ${session ? 'shadow-emerald-500/30' : 'shadow-amber-500/30'} font-bold group/auth cursor-pointer transition-all duration-300 ease-out ${session ? '' : 'pl-2'}`}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent motion-safe:animate-[shimmer_2s_infinite]"></span>
                        <span className="relative flex items-center">
                            {session ? (
                                <>
                                    <span className="w-0 group-hover/auth:w-auto overflow-hidden transition-all duration-300 ease-out">
                                        <span className="mr-1.5 whitespace-nowrap inline-block">Auth: OK</span>
                                    </span>
                                    <CheckCircle className="h-3.5 w-3.5 drop-shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
                                </>
                            ) : (
                                <>
                                    <span className="mr-1.5 whitespace-nowrap">Auth: Guest</span>
                                    <AlertCircle className="h-3.5 w-3.5" />
                                </>
                            )}
                        </span>
                    </span>
                    <span 
                        className={`pill relative overflow-hidden flex items-center gap-1 font-bold shadow-lg group/gemini cursor-pointer transition-all duration-300 ease-out ${!geminiStatus.healthy && !geminiStatus.loading ? 'pl-2' : ''} ${
                            geminiStatus.loading 
                                ? 'text-slate-400 shadow-slate-500/20' 
                                : geminiStatus.healthy 
                                    ? 'pill-success shadow-emerald-500/30' 
                                    : 'pill-error shadow-red-500/30'
                        }`}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent motion-safe:animate-[shimmer_2s_infinite]"></span>
                        <span className="relative flex items-center">
                            {!geminiStatus.healthy && !geminiStatus.loading ? (
                                <>
                                    <span className="mr-1.5 whitespace-nowrap">Gemini: Error</span>
                                    <Zap className="h-3.5 w-3.5" />
                                </>
                            ) : (
                                <>
                                    <span className="w-0 group-hover/gemini:w-auto overflow-hidden transition-all duration-300 ease-out">
                                        <span className="mr-1.5 whitespace-nowrap inline-block">
                                            {geminiStatus.loading ? 'Gemini: ...' : 'Gemini: OK'}
                                        </span>
                                    </span>
                                    <Zap className={`h-3.5 w-3.5 ${geminiStatus.healthy ? 'motion-safe:animate-pulse drop-shadow-[0_0_4px_rgba(52,211,153,0.8)]' : ''}`} />
                                </>
                            )}
                        </span>
                    </span>
                    <span 
                        className="pill relative overflow-hidden text-sky-300 font-bold shadow-lg shadow-sky-500/30 group/version cursor-pointer transition-all duration-300 ease-out"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent motion-safe:animate-[shimmer_2s_infinite]"></span>
                        <span className="relative flex items-center drop-shadow-[0_0_4px_rgba(125,211,252,0.6)]">
                            <span className="w-0 group-hover/version:w-auto overflow-hidden transition-all duration-300 ease-out">
                                <span className="mr-1.5 whitespace-nowrap inline-block">v0.1.x</span>
                            </span>
                            <Tag className="h-3.5 w-3.5" />
                        </span>
                    </span>
                </div>

                {session ? (
                    /* Enhanced Profile Section with Integrated Sign Out */
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-lg opacity-25 group-hover:opacity-40 blur transition duration-300"></div>
                        <div className="relative flex items-center gap-3 bg-slate-900/90 rounded-lg pl-4 pr-4 group-hover:pr-2 py-2.5 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 ease-out overflow-hidden">
                            {session.user?.image ? (
                                <div className="relative shrink-0">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full opacity-30 group-hover:opacity-50 blur transition duration-300"></div>
                                    <div className="relative">
                                        <Image
                                            src={session.user.image}
                                            alt={session.user?.name ?? 'User'}
                                            width={44}
                                            height={44}
                                            className="rounded-full ring-2 ring-purple-500/60 shadow-lg shadow-purple-900/50"
                                        />
                                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 shadow-lg shadow-emerald-500/50" />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                    {session.user?.name?.charAt(0) ?? 'U'}
                                </div>
                            )}
                            <div className="flex flex-col min-w-0 transition-all duration-300">
                                <span className="text-sm font-semibold bg-gradient-to-r from-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                                    {session.user?.name ?? 'User'}
                                </span>
                                {session.user?.email && (
                                    <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                        {session.user.email}
                                    </span>
                                )}
                            </div>
                            
                            {/* Sign Out Button - Slides in on Hover */}
                            <div className="flex items-center overflow-hidden transition-all duration-300 ease-out w-0 group-hover:w-10 opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        signOut();
                                    }}
                                    className="shrink-0 p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors hover:scale-110 transform"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
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
        </div>
        </header>
    );
}
