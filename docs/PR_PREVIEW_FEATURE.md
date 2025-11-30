# PR Preview Feature

## Overview

The PR Preview feature provides users with an interactive modal to review and select documentation files before creating pull requests. This enhances the UX by giving users full control over which files to include in batch operations.

## Components

### 1. Modal.tsx

**Location**: `components/Modal.tsx`

Base modal component with:

- Backdrop blur and overlay
- Keyboard navigation (Escape to close)
- Click-outside-to-close behavior
- Responsive sizing (`sm`, `md`, `lg`, `xl`)
- Clean header/content separation

### 2. PRPreviewModal.tsx

**Location**: `components/PRPreviewModal.tsx`

Specialized modal for PR previews featuring:

- **File List Panel**: Shows all files to be added with checkboxes
- **Preview Pane**: Live preview of selected file content
- **Pick-and-Choose**: Toggle individual files on/off for batch operations
- **File Counter**: Shows selected vs total files
- **Mode Support**: Single file or batch mode
- **Loading States**: Shows spinner during PR creation

**Props**:

```typescript
interface PRPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
  files: FilePreview[];
  onConfirm: (selectedFiles: FilePreview[]) => void;
  loading?: boolean;
  mode: 'single' | 'batch';
}
```

### 3. ConfirmDialog.tsx

**Location**: `components/ConfirmDialog.tsx`

General-purpose confirmation dialog with:

- Danger/primary variants
- Custom confirmation text
- Warning icons for destructive actions
- Loading state support

## API Endpoints

### /api/preview-templates

**Method**: POST  
**Purpose**: Fetch template content for preview before PR creation

**Request Body**:

```json
{
  "docTypes": ["roadmap", "tasks", "features"]
}
```

**Response**:

```json
{
  "previews": [
    {
      "path": "ROADMAP.md",
      "content": "# Roadmap\n...",
      "docType": "ROADMAP"
    }
  ]
}
```

### /api/repos/[name]/fix-all-docs (Updated)

**Enhancement**: Now accepts optional `docTypes` array in request body to support selective file creation from preview modal.

**Request Body** (optional):

```json
{
  "docTypes": ["roadmap", "features"]
}
```

## User Flow

### Single File Fix

1. User clicks "Fix" button for a missing doc
2. System fetches template preview via `/api/preview-templates`
3. Modal opens showing file content
4. User reviews content
5. User clicks "Create PR (1)"
6. PR is created and opened in new tab

### Batch Fix

1. User clicks "Fix All" button
2. System fetches all missing doc templates
3. Modal opens with file list (all checked by default)
4. User can:
   - Click files to view preview
   - Uncheck files to exclude from PR
   - Review each template
5. User clicks "Create PR (n)" where n = selected count
6. Single PR created with all selected files
7. PR opens in new tab

## Integration Points

### useRepoActions Hook

**Location**: `hooks/useRepoActions.ts`

**New State**:

- `previewModalOpen`: Controls modal visibility
- `previewFiles`: Array of FilePreview objects
- `previewRepoName`: Target repository name
- `previewMode`: 'single' | 'batch'

**Updated Functions**:

- `handleFixDoc`: Now shows preview modal instead of immediate PR creation
- `handleFixAllDocs`: Fetches previews and opens modal for selection
- `confirmPRCreation`: New function to handle modal confirmation and PR creation
- `handlePRError`: Centralized OAuth and error handling

**Exported**:

```typescript
return {
  // ... existing exports
  previewModalOpen,
  previewFiles,
  previewRepoName,
  previewMode,
  setPreviewModalOpen,
  confirmPRCreation,
};
```

### Dashboard Component

**Location**: `app/page.tsx`

**Changes**:

- Imports `PRPreviewModal` component
- Destructures new modal state from `useRepoActions`
- Renders modal at bottom of component tree
- Passes `confirmPRCreation` as confirmation handler

## Error Handling

### OAuth Restrictions

When PR creation fails due to OAuth restrictions:

1. Error is parsed via `handlePRError`
2. Toast message shows user-friendly error
3. Authorization page opens automatically (if `helpUrl` present)
4. Console logs detailed instructions

### Template Not Found

If template file missing:

- Returns 404 with clear error message
- Shows expected template path in response
- Logs warning to server console

### Network Errors

- Caught in try/catch blocks
- Toast notification shown to user
- Loading states cleared appropriately
- Modal remains open on error (user can retry or cancel)

## Styling

### Dark Theme

All modals use dark theme matching dashboard:

- Background: `bg-slate-900`
- Borders: `border-slate-700`
- Text: `text-slate-100` to `text-slate-500`
- Backdrop: `bg-black/60` with blur

### Animations

- Smooth fade-in for backdrop
- No jarring transitions
- Loading spinner for async operations
- Hover states on interactive elements

## Accessibility

- **Keyboard Navigation**: Escape key closes modal
- **Focus Management**: Modal traps focus when open
- **ARIA Labels**: Close button has `aria-label="Close modal"`
- **Semantic HTML**: Proper heading hierarchy
- **Click Targets**: Adequate size for touch/click

## Future Enhancements

### Phase 8 Potential Additions

1. **Markdown Rendering**: Render preview as formatted markdown (currently raw text)
2. **Diff View**: Show changes for existing files being updated
3. **Template Customization**: Edit template content before PR creation
4. **Multi-Repo Batch**: Select files across multiple repositories
5. **Preview Best Practices**: Extend preview to best practice templates (dependabot, docker, etc.)
6. **Commit Message Editor**: Allow custom commit messages per file or PR
7. **Branch Name Customization**: Let users specify custom branch names

### Accessibility Improvements

- Screen reader announcements for state changes
- High contrast mode support
- Keyboard shortcuts for common actions
- Focus indicators on all interactive elements

## Testing Recommendations

### Unit Tests

- Modal open/close behavior
- File selection toggle logic
- Preview content loading
- Error state handling

### Integration Tests

- End-to-end PR creation flow
- OAuth error recovery
- Batch vs single mode switching
- API endpoint responses

### Manual Testing Checklist

- [ ] Single doc fix shows preview correctly
- [ ] Batch fix allows file selection
- [ ] Unchecking all files shows validation
- [ ] Cancel closes modal without creating PR
- [ ] Created PR opens in new tab
- [ ] Toast notifications appear for all states
- [ ] Loading spinner shows during async operations
- [ ] Keyboard navigation works (Escape, Tab)
- [ ] OAuth errors trigger authorization flow
- [ ] Template not found shows helpful error

## Dependencies

### NPM Packages

- `next` (React framework)
- `lucide-react` (Icons: X, FileText, Check, AlertTriangle)
- `next-auth` (Session management)

### Internal Dependencies

- `@/lib/github` (GitHubClient for PR creation)
- `@/lib/db` (Database queries)
- `@/types/repo` (TypeScript types)
- `@/components/Toast` (Toast notifications)

## Performance Considerations

- Template fetching is async and shows loading state
- Modal renders conditionally (unmounts when closed)
- File previews fetch on-demand (not all at once)
- Large file content previewed with scrolling (no pagination needed for templates)
- Database queries optimized with indexed lookups

## Security Notes

- Template paths validated server-side
- User must be authenticated to preview/create PRs
- GitHub token required in session
- OAuth restrictions properly handled
- No user-provided file paths (only predefined doc types)
