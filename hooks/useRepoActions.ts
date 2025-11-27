// Custom hooks for repository actions

import { useState } from 'react';
import { Repo } from '@/types/repo';

export function useRepoActions(
  refetchRepos: () => Promise<void>,
  setRepos: React.Dispatch<React.SetStateAction<Repo[]>>,
  setToastMessage: (msg: string | null) => void
) {
  const [addingRepo, setAddingRepo] = useState(false);
  const [fixingDoc, setFixingDoc] = useState(false);
  const [syncingRepo, setSyncingRepo] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);

  const handleAddRepo = async (url: string, type: string) => {
    try {
      setAddingRepo(true);
      const res = await fetch('/api/repos/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      });
      if (res.ok) {
        const data = await res.json();
        setToastMessage(`Successfully added ${data.repo.fullName}`);
        await refetchRepos();
        return true;
      } else {
        const err = await res.json();
        setToastMessage(`Failed to add repo: ${err.error}`);
        return false;
      }
    } catch (error) {
      console.error('Failed to add repo:', error);
      setToastMessage('Failed to add repo');
      return false;
    } finally {
      setAddingRepo(false);
    }
  };

  const handleRemoveRepo = async (repoName: string) => {
    try {
      const res = await fetch(`/api/repos/${repoName}/hide`, { method: 'POST' });
      if (res.ok) {
        await refetchRepos();
        setToastMessage(`Successfully hid ${repoName}`);
      } else {
        const err = await res.json();
        setToastMessage(`Failed to hide repo: ${err.error}`);
      }
    } catch (error) {
      console.error('Failed to hide repo:', error);
      setToastMessage('Failed to hide repo');
    }
  };

  const handleFixAllDocs = async (repoName: string) => {
    if (!confirm(`Create a single PR to add ALL missing docs to ${repoName}?`)) return;
    try {
      setFixingDoc(true);
      const res = await fetch(`/api/repos/${repoName}/fix-all-docs`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.prUrl) {
          window.open(data.prUrl, '_blank');
        }
        setToastMessage(`PR created! Added ${data.count} files.`);
      } else {
        const err = await res.json();
        setToastMessage(err.message || `Failed to create PR: ${err.error}`);
      }
    } catch (error) {
      console.error('Failed to fix all docs:', error);
      setToastMessage('Failed to create PR');
    } finally {
      setFixingDoc(false);
    }
  };

  const handleFixDoc = async (repoName: string, docType: string) => {
    try {
      setFixingDoc(true);
      const res = await fetch(`/api/repos/${repoName}/fix-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.prUrl) {
          window.open(data.prUrl, '_blank');
        }
        setToastMessage(`PR created for ${docType.toUpperCase()}.md!`);
      } else {
        const err = await res.json();
        setToastMessage(err.error || 'Failed to create PR');
      }
    } catch (error) {
      console.error('Failed to fix doc:', error);
      setToastMessage('Failed to create PR');
    } finally {
      setFixingDoc(false);
    }
  };

  const handleFixStandard = async (repoName: string, standardType: string) => {
    try {
      setFixingDoc(true);
      const res = await fetch(`/api/repos/${repoName}/fix-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: standardType }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.prUrl) {
          window.open(data.prUrl, '_blank');
        }
        setToastMessage(`PR created for ${standardType.toUpperCase()}.md!`);
      } else {
        const err = await res.json();
        setToastMessage(err.error || 'Failed to create PR');
      }
    } catch (error) {
      console.error('Failed to fix standard:', error);
      setToastMessage('Failed to create PR');
    } finally {
      setFixingDoc(false);
    }
  };

  const handleFixAllStandards = async (repoName: string) => {
    try {
      setFixingDoc(true);
      const res = await fetch(`/api/repos/${repoName}/fix-all-standards`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setToastMessage(data.message);
        } else if (data.prUrl) {
          window.open(data.prUrl, '_blank');
          setToastMessage(`PR created! Added ${data.count} community standards.`);
        }
      } else {
        const err = await res.json();
        setToastMessage(err.error || 'Failed to create PR');
      }
    } catch (error) {
      console.error('Failed to fix all standards:', error);
      setToastMessage('Failed to create PR');
    } finally {
      setFixingDoc(false);
    }
  };

  const handleFixPractice = async (repoName: string, practiceType: string) => {
    try {
      setFixingDoc(true);
      const res = await fetch(`/api/repos/${repoName}/fix-best-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practiceType }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.prUrl) {
          window.open(data.prUrl, '_blank');
        }
        setToastMessage(`PR created for ${practiceType}!`);
      } else {
        const err = await res.json();
        setToastMessage(err.error || 'Failed to create PR');
      }
    } catch (error) {
      console.error('Failed to fix practice:', error);
      setToastMessage('Failed to create PR');
    } finally {
      setFixingDoc(false);
    }
  };

  const handleFixAllPractices = async (repoName: string) => {
    try {
      setFixingDoc(true);
      
      // Get fixable missing practices
      const fixablePractices = ['dependabot', 'env_template', 'docker', 'netlify_badge'];
      let successCount = 0;
      
      for (const practiceType of fixablePractices) {
        try {
          const res = await fetch(`/api/repos/${repoName}/fix-best-practice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ practiceType }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.prUrl) {
              window.open(data.prUrl, '_blank');
            }
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to fix ${practiceType}:`, error);
        }
      }
      
      if (successCount > 0) {
        setToastMessage(`Created ${successCount} PR(s) for best practices!`);
      } else {
        setToastMessage('No PRs created - practices may already exist');
      }
    } catch (error) {
      console.error('Failed to fix all practices:', error);
      setToastMessage('Failed to create PRs');
    } finally {
      setFixingDoc(false);
    }
  };

  const handleGenerateSummary = async (repoName: string) => {
    try {
      setGeneratingSummary(repoName);
      const res = await fetch(`/api/repos/${repoName}/generate-summary`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setRepos((prev) =>
          prev.map((r) => (r.name === repoName ? { ...r, ai_summary: data.summary } : r))
        );
        setToastMessage(`AI summary generated for ${repoName}.`);
      } else {
        const err = await res.json();
        setToastMessage(`Failed to generate summary: ${err.error}`);
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setToastMessage('Failed to generate summary');
    } finally {
      setGeneratingSummary(null);
    }
  };

  const handleSyncSingleRepo = async (repoName: string, onSuccess?: () => void) => {
    try {
      setSyncingRepo(repoName);
      const res = await fetch(`/api/repos/${repoName}/sync`, { method: 'POST' });
      if (res.ok) {
        await refetchRepos();
        onSuccess?.();
        setToastMessage(`Successfully synced ${repoName}!`);
      } else {
        const err = await res.json();
        setToastMessage(`Failed to sync: ${err.error}`);
      }
    } catch (error) {
      console.error('Failed to sync repo:', error);
      setToastMessage('Failed to sync repo');
    } finally {
      setSyncingRepo(null);
    }
  };

  return {
    addingRepo,
    fixingDoc,
    syncingRepo,
    generatingSummary,
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
  };
}
