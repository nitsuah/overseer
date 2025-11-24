# Dashboard UI Integration - Manual Steps Required

## Status
- ✅ **Backend**: 100% Complete
  - Database columns added (`last_commit_date`, `open_prs`, `open_issues_count`)
  - Sync logic fetches and stores data
  - Type definitions updated
  - Utility functions created (`formatTimeAgo`, `getCommitFreshnessColor`)
  - Imports added to `app/page.tsx`

- ⏳ **Frontend**: Needs manual edit to `app/page.tsx`
  - Table headers already added (Activity, Last Sync)
  - Data cells need to be inserted

## Problem
The `app/page.tsx` file is large (698 lines) and automated patching keeps corrupting the file due to line ending and encoding issues. A manual edit is required.

## Solution: Manual Edit Required

### Step 1: Open `app/page.tsx`

### Step 2: Find the Health Column (around line 550-560)
Look for this code:
```tsx
                      </td>
                      <td className="px-6 py-4">
                        {details ? (
```

### Step 3: Insert Activity Column BEFORE the Docs column
Right after the Health column's `</td>` and BEFORE the Docs column's `<td>`, add:

```tsx
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className={`flex items-center gap-1 ${getCommitFreshnessColor(repo.last_commit_date)}`} title={repo.last_commit_date || 'No commits'}>
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(repo.last_commit_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            {(repo.open_prs !== undefined && repo.open_prs > 0) && (
                              <span className="flex items-center gap-1" title={`${repo.open_prs} open PRs`}>
                                <GitPullRequest className="h-3 w-3" />
                                {repo.open_prs}
                              </span>
                            )}
                            {(repo.open_issues_count !== undefined && repo.open_issues_count > 0) && (
                              <span className="flex items-center gap-1" title={`${repo.open_issues_count} open issues`}>
                                <AlertCircle className="h-3 w-3" />
                                {repo.open_issues_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
```

### Step 4: Verify Column Count
The table should now have 10 columns:
1. Repository
2. Type
3. Description
4. Language
5. Health
6. **Activity** (NEW)
7. Docs
8. Links
9. Last Sync
10. Actions

### Step 5: Update colSpan
Find the ExpandableRow (around line 675):
```tsx
<td colSpan={10} className="p-0">
```
Make sure it says `colSpan={10}` (not 8 or 9).

### Step 6: Save and Test
1. Save the file
2. Check that Next.js dev server reloads without errors
3. Open http://localhost:3000
4. Verify the new Activity column appears with commit freshness, PRs, and issues

## Alternative: Use the Patch Script
If you prefer, the `scripts/patch-dashboard.ts` file was created to automate this, but it has been having issues with file corruption. You can try:
```bash
npx tsx scripts/patch-dashboard.ts
```

But manual editing is recommended for reliability.

## After UI Integration
Once the UI is complete:
1. Run a full sync: Click "Sync Repos" button or call the API
2. Verify metrics populate correctly
3. Check color-coding on commit freshness (green=recent, yellow=stale, red=very old)
4. Move to next roadmap item: README Freshness calculation
