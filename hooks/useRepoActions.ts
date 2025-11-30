// Custom hooks for repository actions

import { useState } from 'react';
import { Repo } from '@/types/repo';

interface FilePreview {
  path: string;
  content: string;
  docType: string;
  type: 'doc' | 'practice';
  practiceType?: string;
}

export function useRepoActions(
  refetchRepos: () => Promise<void>,
  setRepos: React.Dispatch<React.SetStateAction<Repo[]>>,
  setToastMessage: (msg: string | null) => void
) {
  const [addingRepo, setAddingRepo] = useState(false);
  const [fixingDoc, setFixingDoc] = useState(false);
  const [syncingRepo, setSyncingRepo] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<FilePreview[]>([]);
  const [previewRepoName, setPreviewRepoName] = useState('');
  const [previewMode, setPreviewMode] = useState<'single' | 'batch'>('single');

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

  const handleFixAllDocs = async (repoName: string, missingDocs?: string[]) => {
    // Fetch template previews
    try {
      setFixingDoc(true);
      
      // If no missing docs provided, fetch from repo
      let docsToFix: string[] = missingDocs || [];
      if (!missingDocs) {
        const reposRes = await fetch('/api/repos');
        const reposData = await reposRes.json();
        const repo = reposData.repos?.find((r: Repo) => r.name === repoName);
        if (!repo) {
          setToastMessage('Repo not found');
          return;
        }
        docsToFix = repo.doc_statuses
          ?.filter((d: { exists: boolean; doc_type: string }) => !d.exists && ['roadmap', 'tasks', 'metrics', 'features', 'readme'].includes(d.doc_type))
          .map((d: { doc_type: string }) => d.doc_type) || [];
      }

      if (docsToFix.length === 0) {
        setToastMessage('No missing docs to fix');
        return;
      }

      const previewRes = await fetch('/api/preview-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docTypes: docsToFix }),
      });

      if (previewRes.ok) {
        const { previews } = await previewRes.json();
        setPreviewFiles(previews);
        setPreviewRepoName(repoName);
        setPreviewMode('batch');
        setPreviewModalOpen(true);
      } else {
        setToastMessage('Failed to load previews');
      }
    } catch (error) {
      console.error('Failed to fetch previews:', error);
      setToastMessage('Failed to load previews');
    } finally {
      setFixingDoc(false);
    }
  };

  const handleFixDoc = async (repoName: string, docType: string) => {
    // Show preview modal first
    try {
      setFixingDoc(true);
      const previewRes = await fetch('/api/preview-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docTypes: [docType] }),
      });

      if (previewRes.ok) {
        const { previews } = await previewRes.json();
        setPreviewFiles(previews);
        setPreviewRepoName(repoName);
        setPreviewMode('single');
        setPreviewModalOpen(true);
      } else {
        setToastMessage('Failed to load preview');
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error);
      setToastMessage('Failed to load preview');
    } finally {
      setFixingDoc(false);
    }
  };

  const handleFixStandard = async (repoName: string, standardType: string) => {
    // Use the preview modal flow for community standards where templates exist
    try {
      setFixingDoc(true);
      const previewRes = await fetch('/api/preview-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docTypes: [standardType] }),
      });

      if (previewRes.ok) {
        const { previews } = await previewRes.json();
        if (previews && previews.length > 0) {
          setPreviewFiles(previews);
          setPreviewRepoName(repoName);
          setPreviewMode('single');
          setPreviewModalOpen(true);
          return; // Continue via confirmPRCreation
        }
      }

      // Fallback direct PR if no preview available
      const res = await fetch(`/api/repos/${repoName}/fix-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: standardType }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.prUrl) window.open(data.prUrl, '_blank');
        setToastMessage(`PR created for ${standardType.toUpperCase()}!`);
      } else {
        const err = await res.json();
        handlePRError(err);
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
    // Show a preview modal for best practices when a template exists
    try {
      setFixingDoc(true);
      const previewRes = await fetch('/api/preview-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docTypes: [practiceType] }),
      });

      if (previewRes.ok) {
        const { previews } = await previewRes.json();
        if (previews && previews.length > 0) {
          setPreviewFiles(previews);
          setPreviewRepoName(repoName);
          setPreviewMode('single');
          setPreviewModalOpen(true);
          return; // Wait for modal confirm to proceed
        }
      }

      // Fallback: no preview template found, proceed directly
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
        handlePRError(err);
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

  const confirmPRCreation = async (selectedFiles: FilePreview[]) => {
    if (selectedFiles.length === 0) {
      setToastMessage('No files selected');
      return;
    }

    try {
      setFixingDoc(true);
      
      if (selectedFiles.length === 1) {
        // Single file PR
        const f = selectedFiles[0];
        if (f.type === 'practice') {
          const res = await fetch(`/api/repos/${previewRepoName}/fix-best-practice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ practiceType: f.practiceType }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.prUrl) window.open(data.prUrl, '_blank');
            setToastMessage(`PR created for ${String(f.practiceType)}!`);
            setPreviewModalOpen(false);
          } else {
            const err = await res.json();
            handlePRError(err);
          }
        } else {
          const docType = f.docType.toLowerCase();
          const res = await fetch(`/api/repos/${previewRepoName}/fix-doc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ docType }),
          });
        
          if (res.ok) {
            const data = await res.json();
            if (data.prUrl) {
              window.open(data.prUrl, '_blank');
            }
            setToastMessage(`PR created for ${docType.toUpperCase()}!`);
            setPreviewModalOpen(false);
          } else {
            const err = await res.json();
            handlePRError(err);
          }
        }
      } else {
        // Batch PR - create fix-all-docs endpoint that accepts selected files
        const docs = selectedFiles.filter(f => f.type === 'doc').map(f => f.docType.toLowerCase());
        const practices = selectedFiles.filter(f => f.type === 'practice').map(f => String(f.practiceType));

        // Docs: single batch PR via fix-all-docs
        let docsMessage = '';
        if (docs.length > 0) {
          const res = await fetch(`/api/repos/${previewRepoName}/fix-all-docs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ docTypes: docs }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.prUrl) window.open(data.prUrl, '_blank');
            docsMessage = `Added ${docs.length} documentation file(s).`;
          } else {
            const err = await res.json();
            handlePRError(err);
          }
        }

        // Practices: create individual PRs (current implementation is one-per-practice)
        let practiceSuccess = 0;
        for (const p of practices) {
          try {
            const res = await fetch(`/api/repos/${previewRepoName}/fix-best-practice`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ practiceType: p }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.prUrl) window.open(data.prUrl, '_blank');
              practiceSuccess++;
            }
          } catch {}
        }
        
        setToastMessage([docsMessage, practiceSuccess > 0 ? `Created ${practiceSuccess} best-practice PR(s).` : '']
          .filter(Boolean).join(' '));
        setPreviewModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create PR:', error);
      setToastMessage('Failed to create PR');
    } finally {
      setFixingDoc(false);
    }
  };

  const handlePRError = (err: { type?: string; error?: string; helpUrl?: string; instructions?: string }) => {
    if (err.type === 'oauth_restriction' && err.helpUrl) {
      console.error('🔐 OAuth Restriction - Authorization Required');
      setToastMessage(`${err.error || 'Authorization required'} - Opening authorization page...`);
      setTimeout(() => {
        window.open(err.helpUrl!, '_blank');
      }, 500);
    } else if (err.type === 'oauth_restriction' && err.instructions) {
      console.error('OAuth Restriction:', err.instructions);
      setToastMessage(err.error || 'Failed to create PR - OAuth restriction');
      if (err.helpUrl) {
        setTimeout(() => {
          if (confirm('Need help authorizing the app for this organization? Click OK to view instructions.')) {
            window.open(err.helpUrl!, '_blank');
          }
        }, 1000);
      }
    } else {
      setToastMessage(err.error || 'Failed to create PR');
    }
  };

  return {
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
  };
}
