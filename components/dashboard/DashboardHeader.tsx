// Dashboard header component with sync and add repo buttons

import { RefreshCw, Filter, X } from 'lucide-react';
import { RepoType } from '@/lib/repo-type';

interface DashboardHeaderProps {
  filteredCount: number;
  totalCount: number;
  showAddRepo: boolean;
  addRepoUrl: string;
  addRepoType: string;
  addingRepo: boolean;
  showFilters: boolean;
  syncing: boolean;
  isAuthenticated?: boolean;
  onAddRepoUrlChange: (url: string) => void;
  onAddRepoTypeChange: (type: RepoType) => void;
  onAddRepoSubmit: (e: React.FormEvent) => void;
  onToggleAddRepo: () => void;
  onToggleFilters: () => void;
  onSync: () => void;
}

export function DashboardHeader({
  filteredCount,
  totalCount,
  showAddRepo,
  addRepoUrl,
  addRepoType,
  addingRepo,
  showFilters,
  syncing,
  isAuthenticated = true,
  onAddRepoUrlChange,
  onAddRepoTypeChange,
  onAddRepoSubmit,
  onToggleAddRepo,
  onToggleFilters,
  onSync,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold">Repositories</h2>
        <p className="text-slate-400 mt-1">
          {filteredCount} of {totalCount} {totalCount === 1 ? 'repository' : 'repositories'}
          {filteredCount !== totalCount ? ' (filtered)' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!isAuthenticated ? (
          <button
            onClick={() => window.location.href = '/login'}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Sign in to manage repositories
          </button>
        ) : showAddRepo ? (
          <form onSubmit={onAddRepoSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={addRepoUrl}
              onChange={(e) => onAddRepoUrlChange(e.target.value)}
              placeholder="owner/repo or URL"
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
              autoFocus
            />
            <select
              value={addRepoType}
              onChange={(e) => onAddRepoTypeChange(e.target.value as RepoType)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="unknown">Unknown</option>
              <option value="web-app">Web App</option>
              <option value="game">Game</option>
              <option value="tool">Tool</option>
              <option value="library">Library</option>
              <option value="bot">Bot</option>
              <option value="research">Research</option>
            </select>
            <button
              type="submit"
              disabled={addingRepo}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {addingRepo ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={onToggleAddRepo}
              className="p-2 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <>
            <button
              onClick={onToggleAddRepo}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
            >
              <span className="text-xl leading-none">+</span> Add Repo
            </button>
            <button
              onClick={onToggleFilters}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button
              onClick={onSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Repos'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
