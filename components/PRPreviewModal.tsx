"use client";

import { Modal } from './Modal';
import { FileText, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MarkdownPreview } from './MarkdownPreview';
import { YAMLPreview } from './YAMLPreview';

interface FilePreview {
  path: string;
  content: string;
  docType: string;
  type: 'doc' | 'practice';
  practiceType?: string;
}

interface PRPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
  files: FilePreview[];
  onConfirm: (selectedFiles: FilePreview[]) => void;
  loading?: boolean;
  mode: 'single' | 'batch';
}

export function PRPreviewModal({
  isOpen,
  onClose,
  repoName,
  files,
  onConfirm,
  loading = false,
  mode,
}: PRPreviewModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [activeFile, setActiveFile] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<Map<string, string>>(new Map());
  const [generatingAI, setGeneratingAI] = useState(false);

  // Reset selection and active file whenever modal opens or files change
  useEffect(() => {
    if (!isOpen) return;
    // Default selection: all files in batch mode, first file in single
    const initialSelected = new Set<string>();
    if (mode === 'batch') {
      files.forEach((f) => initialSelected.add(f.path));
    } else if (files[0]) {
      initialSelected.add(files[0].path);
    }
    setSelectedFiles(initialSelected);
    setActiveFile(files[0]?.path || '');
    setEditMode(false);
    // Initialize edited content with original content
    const contentMap = new Map<string, string>();
    files.forEach((f) => contentMap.set(f.path, f.content));
    setEditedContent(contentMap);
  }, [isOpen, files, mode]);

  const toggleFile = (path: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFiles(newSelected);
  };

  const handleConfirm = () => {
    const selected = files
      .filter((f) => selectedFiles.has(f.path))
      .map((f) => ({
        ...f,
        content: editedContent.get(f.path) || f.content,
      }));
    onConfirm(selected);
  };

  const handleAIGenerate = async () => {
    if (!activeFile || !activeFileContent) return;
    
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/enrich-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          docType: activeFileContent.docType,
          templateContent: editedContent.get(activeFile) || activeFileContent.content,
        }),
      });
      
      if (res.ok) {
        const { enrichedContent } = await res.json();
        const newContent = new Map(editedContent);
        newContent.set(activeFile, enrichedContent);
        setEditedContent(newContent);
      } else {
        console.error('Failed to generate AI enrichment');
      }
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const activeFileContent = files.find((f) => f.path === activeFile);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview PR for ${repoName}`}
      size="2xl"
    >
      <div className="space-y-4">
        {/* Warning/Info Banner */}
        <div className="bg-blue-900/30 border border-blue-500/40 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            {mode === 'batch'
              ? `You are about to create a PR with ${files.length} file(s). Review and select which files to include.`
              : 'Review the file content before creating the PR.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* File List */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">
              Files to Add ({selectedFiles.size}/{files.length})
            </h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.path}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    activeFile === file.path
                      ? 'bg-slate-700 border border-slate-600'
                      : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50'
                  }`}
                  onClick={() => setActiveFile(file.path)}
                >
                  {mode === 'batch' && (
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.path)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleFile(file.path);
                      }}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                  )}
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">
                      {file.path}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {file.type === 'practice' ? `Practice: ${file.practiceType}` : 'Documentation'}
                    </p>
                  </div>
                  {activeFile === file.path && (
                    <Check className="h-4 w-4 text-blue-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview Pane */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-300">
                {editMode ? 'Edit' : 'Preview'}: {activeFileContent?.path || 'Select a file'}
              </h3>
              {activeFileContent && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAIGenerate}
                    disabled={generatingAI}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                    title="Use AI to enrich this template with repo-specific details"
                  >
                    {generatingAI ? (
                      <>
                        <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="text-sm">✨</span>
                        AI Generate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition-colors"
                  >
                    {editMode ? 'Preview' : 'Edit'}
                  </button>
                </div>
              )}
            </div>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              {activeFileContent ? (
                editMode ? (
                  <textarea
                    value={editedContent.get(activeFile) || ''}
                    onChange={(e) => {
                      const newContent = new Map(editedContent);
                      newContent.set(activeFile, e.target.value);
                      setEditedContent(newContent);
                    }}
                    className="w-full h-80 bg-slate-900 text-slate-300 text-xs font-mono p-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500 resize-none"
                    spellCheck={false}
                  />
                ) : activeFile.endsWith('.md') || !activeFile.includes('.') || activeFile.split('/').pop()?.indexOf('.') === -1 ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <MarkdownPreview content={editedContent.get(activeFile) || ''} />
                  </div>
                ) : activeFile.endsWith('.yml') || activeFile.endsWith('.yaml') ? (
                  <YAMLPreview content={editedContent.get(activeFile) || ''} />
                ) : (
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {editedContent.get(activeFile)}
                  </pre>
                )
              ) : (
                <p className="text-sm text-slate-500 italic">No file selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {mode === 'batch' && (
              <p className="text-xs text-slate-400">
                {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
              </p>
            )}
            <button
              onClick={handleConfirm}
              disabled={loading || selectedFiles.size === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating PR...
                </>
              ) : (
                `Create PR (${selectedFiles.size})`
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
