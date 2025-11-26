// Filter panel component for dashboard

import { RepoType } from '@/lib/repo-type';

interface FilterPanelProps {
  visible: boolean;
  filterType: RepoType | 'all';
  filterLanguage: string;
  filterFork: 'all' | 'no-forks' | 'forks-only';
  languages: string[];
  onFilterTypeChange: (type: RepoType | 'all') => void;
  onFilterLanguageChange: (language: string) => void;
  onFilterForkChange: (fork: 'all' | 'no-forks' | 'forks-only') => void;
  onClearFilters: () => void;
}

const repoTypes: RepoType[] = ['web-app', 'game', 'tool', 'library', 'bot', 'research', 'unknown'];

export function FilterPanel({
  visible,
  filterType,
  filterLanguage,
  filterFork,
  languages,
  onFilterTypeChange,
  onFilterLanguageChange,
  onFilterForkChange,
  onClearFilters,
}: FilterPanelProps) {
  if (!visible) return null;

  return (
    <div className="glass rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value as RepoType | 'all')}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {repoTypes.map((t) => (
              <option key={t} value={t}>
                {t.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
          <select
            value={filterLanguage}
            onChange={(e) => onFilterLanguageChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Languages</option>
            {languages.sort().map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Fork Status</label>
          <select
            value={filterFork}
            onChange={(e) => onFilterForkChange(e.target.value as 'all' | 'no-forks' | 'forks-only')}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Repos</option>
            <option value="no-forks">No Forks</option>
            <option value="forks-only">Forks Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}
