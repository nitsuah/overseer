"use client";

import { Modal } from './Modal';
import { FileText, Check } from 'lucide-react';
import { useState } from 'react';

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
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(
    new Set(files.map((f) => f.path))
  );
  const [activeFile, setActiveFile] = useState<string>(files[0]?.path || '');

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
    const selected = files.filter((f) => selectedFiles.has(f.path));
    onConfirm(selected);
  };

  const activeFileContent = files.find((f) => f.path === activeFile);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview PR for ${repoName}`}
      size="xl"
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
            <h3 className="text-sm font-semibold text-slate-300 mb-2">
              Preview: {activeFileContent?.path || 'Select a file'}
            </h3>
            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              {activeFileContent ? (
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {activeFileContent.content}
                </pre>
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
