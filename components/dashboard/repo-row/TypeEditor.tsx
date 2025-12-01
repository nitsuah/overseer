// Type editor component for inline editing of repository type

import { useState } from 'react';
import { RepoType } from '@/lib/repo-type';

interface TypeEditorProps {
  repoType: RepoType;
  repoName: string;
  getTypeIcon: (type: RepoType) => string;
  isAuthenticated: boolean;
}

export function TypeEditor({ repoType, repoName, getTypeIcon, isAuthenticated }: TypeEditorProps) {
  const [editingType, setEditingType] = useState(false);
  const [updatingType, setUpdatingType] = useState(false);

  const handleTypeChange = async (newType: RepoType) => {
    try {
      setUpdatingType(true);
      const res = await fetch(`/api/repos/${repoName}/update-type`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType }),
      });

      if (res.ok) {
        // Refresh the page to show updated type
        window.location.reload();
      } else {
        console.error('Failed to update repo type');
      }
    } catch (error) {
      console.error('Error updating repo type:', error);
    } finally {
      setUpdatingType(false);
      setEditingType(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        disabled
        className="text-lg"
        title={repoType}
      >
        {getTypeIcon(repoType)}
      </button>
    );
  }

  if (editingType) {
    return (
      <select
        value={repoType}
        onChange={(e) => handleTypeChange(e.target.value as RepoType)}
        disabled={updatingType}
        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        onBlur={() => setEditingType(false)}
        onClick={(e) => e.stopPropagation()}
        autoFocus
      >
        <option value="web-app">🌐 Web App</option>
        <option value="game">🎮 Game</option>
        <option value="tool">🔧 Tool</option>
        <option value="library">📦 Library</option>
        <option value="bot">🤖 Bot</option>
        <option value="research">🔬 Research</option>
        <option value="unknown">📄 Unknown</option>
      </select>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setEditingType(true);
      }}
      className="text-lg hover:scale-110 transition-transform"
      title={`Click to edit type (${repoType})`}
    >
      {getTypeIcon(repoType)}
    </button>
  );
}
