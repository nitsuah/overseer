"use client";

import { Toast } from '@/components/Toast';
import { PRPreviewModal } from '@/components/PRPreviewModal';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import { RepoTableRow } from '@/components/dashboard/RepoTableRow';
import { useRepos, useRepoDetails, useRepoExpansion } from '@/hooks/useDashboard';
import { useRepoActions } from '@/hooks/useRepoActions';
import { useRepoFilters } from '@/hooks/useRepoFilters';
import { RepoType } from '@/lib/repo-type';

export default function Dashboard() {
  const { data: session } = useSession();
  const { repos, setRepos, loading, refetch } = useRepos();
  const { repoDetails, fetchRepoDetails, fetchAllRepoDetails } = useRepoDetails();
  const { expandedRepos, toggleRepo } = useRepoExpansion();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddRepo, setShowAddRepo] = useState(false);
  const [addRepoUrl, setAddRepoUrl] = useState('');
  const [addRepoType, setAddRepoType] = useState<RepoType>('unknown');

  const {
    addingRepo,
    fixingDoc,
    syncingRepo,
    generatingSummary,
    previewModalOpen,
    previewFiles,
    previewRepoName,
    previewMode,
    setPreviewModalOpen,
    handleAddRepo,
    handleRemoveRepo,
    handleFixAllDocs,
    handleFixDoc,
    handleFixStandard,
    handleFixAllStandards,
    handleFixPractice,
    handleFixAllPractices,
    handleGenerateSummary,
    handleSyncSingleRepo,
    confirmPRCreation,
  } = useRepoActions(refetch, setRepos, setToastMessage);

  const {
    filterType,
    setFilterType,
    filterLanguage,
    setFilterLanguage,
    filterFork,
    setFilterFork,
    languages,
    filteredRepos,
    clearFilters,
  } = useRepoFilters(repos);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/sync-repos', { method: 'POST' });
      if (res.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Failed to sync repos:', error);
    } finally {
      setSyncing(false);
    }
  };

  const onAddRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleAddRepo(addRepoUrl, addRepoType);
    if (success) {
      setAddRepoUrl('');
      setAddRepoType('unknown');
      setShowAddRepo(false);
    }
  };

  const handleToggleExpanded = (repoName: string) => {
    if (!expandedRepos.has(repoName)) {
      fetchRepoDetails(repoName);
    }
    toggleRepo(repoName);
  };

  const handleSyncAndRefresh = async (repoName: string) => {
    await handleSyncSingleRepo(repoName, () => {
      if (expandedRepos.has(repoName)) {
        fetchRepoDetails(repoName, true); // Force refetch after sync
      }
    });
  };

  // Fetch details for all repos when repos change
  React.useEffect(() => {
    if (repos.length > 0 && Object.keys(repoDetails).length === 0) {
      const repoNames = repos.map(r => r.name);
      fetchAllRepoDetails(repoNames);
    }
  }, [repos, repoDetails, fetchAllRepoDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400">Loading repositories...</div>
      </div>
    );
  }

  return (
    <>
      <Header
        repoCount={{ filtered: filteredRepos.length, total: repos.length }}
        showAddRepo={showAddRepo}
        addRepoUrl={addRepoUrl}
        addRepoType={addRepoType}
        addingRepo={addingRepo}
        showFilters={showFilters}
        syncing={syncing}
        filterType={filterType}
        filterLanguage={filterLanguage}
        filterFork={filterFork}
        languages={languages}
        onAddRepoUrlChange={setAddRepoUrl}
        onAddRepoTypeChange={setAddRepoType}
        onAddRepoSubmit={onAddRepoSubmit}
        onToggleAddRepo={() => setShowAddRepo(!showAddRepo)}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onSync={handleSync}
        onFilterTypeChange={setFilterType}
        onFilterLanguageChange={setFilterLanguage}
        onFilterForkChange={setFilterFork}
        onClearFilters={clearFilters}
      />
      <div className="px-6 py-8 space-y-6">
        {filteredRepos.length === 0 ? (
          <div className="glass rounded-lg p-12 text-center">
            <p className="text-slate-400 text-lg">No repositories found</p>
            <p className="text-slate-500 text-sm mt-2">
              Click &quot;Sync Repos&quot; to fetch your GitHub repositories
            </p>
          </div>
        ) : (
          <div className="glass rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Links
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Repository
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 hidden xl:table-cell">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Health
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Docs
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRepos.map((repo) => (
                  <RepoTableRow
                    key={repo.id}
                    repo={repo}
                    details={repoDetails[repo.name]}
                    isExpanded={expandedRepos.has(repo.name)}
                    fixingDoc={fixingDoc}
                    syncingRepo={syncingRepo}
                    generatingSummary={generatingSummary}
                    isAuthenticated={!!session}
                    onToggleExpanded={() => handleToggleExpanded(repo.name)}
                    onRemove={() => handleRemoveRepo(repo.name)}
                    onFixAllDocs={() => handleFixAllDocs(repo.name)}
                    onFixDoc={(type) => handleFixDoc(repo.name, type)}
                    onFixStandard={(type) => handleFixStandard(repo.name, type)}
                    onFixAllStandards={() => handleFixAllStandards(repo.name)}
                    onFixPractice={(type) => handleFixPractice(repo.name, type)}
                    onFixAllPractices={() => handleFixAllPractices(repo.name)}
                    onGenerateSummary={() => handleGenerateSummary(repo.name)}
                    onSyncSingleRepo={() => handleSyncAndRefresh(repo.name)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <PRPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        repoName={previewRepoName}
        files={previewFiles}
        onConfirm={confirmPRCreation}
        loading={fixingDoc}
        mode={previewMode}
      />
    </>
  );
}
