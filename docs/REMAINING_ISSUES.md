# Remaining Issues & Next Steps

## ✅ Recently Completed

### 1. LICENSE.md
**Status**: COMPLETED
- Added MIT License to Overseer repo
- Added LICENSE.md to tracked document types in sync logic

### 2. Stats Column Moved to Detail Panel
**Status**: COMPLETED
- Removed Stats column from main table
- Added Repository Stats section to ExpandableRow detail panel
- Updated colspan from 11 to 10
- Description now hidden on smaller screens (xl+ only)
- Saves valuable column space

### 3. FEATURES.md Created
**Status**: COMPLETED
- Comprehensive feature documentation
- Lists all tracked documentation types
- Documents best practices detection (current and planned)
- Includes tech stack and deployment info

## Priority Issues to Fix

### 1. Add Repo Type Selection
**Status**: TODO
**Location**: `app/api/repos/add/route.ts` and `app/page.tsx`
**Changes Needed**:
- Add dropdown in "Add Repo" form to select repo type
- Pass selected type to API
- Store in database

### 2. AI Summary Generation
**Status**: NEEDS TESTING
**Issue**: Gemini API model name was fixed to `gemini-pro`
**Action**: Test with valid GEMINI_API_KEY

### 3. GitHub OAuth
**Status**: NEEDS CONFIGURATION
**Issue**: OAuth callback URLs not configured for Netlify
**Action**: Follow `docs/GITHUB_OAUTH_SETUP.md`
- Create separate OAuth apps for prod/dev
- Configure Netlify environment variables
- Add callback URLs to GitHub

### 4. Activity Column Data
**Status**: NEEDS INVESTIGATION
**Issue**: Shows "Never 00" instead of actual data
**Possible Causes**:
- Data not being synced from GitHub API
- `last_commit_date`, `open_prs`, `open_issues_count` not populating
**Action**: 
- Run a full sync to populate data
- Check sync logic in `lib/sync.ts`
- Verify GitHub API responses

### 5. Metrics Not Visible
**Status**: NEEDS INVESTIGATION  
**Issue**: Metrics section not showing in detail panel
**Possible Causes**:
- No metrics data in database
- METRICS.md not being parsed
- Display logic issue in ExpandableRow
**Action**:
- Verify METRICS.md exists in test repos
- Check parser in `lib/parsers/metrics.ts`
- Add sample metrics data to test repos

### 6. Make "+X more" Expandable
**Status**: TODO
**Location**: `components/ExpandableRow.tsx`
**Changes Needed**:
- Add expand/collapse functionality for long task/roadmap lists
- Show all items when expanded
- Improve UX for repos with many tasks

## Best Practices Detection System

### Implementation Plan

#### Phase 1: Detection Framework
1. Create `lib/best-practices.ts` with detection functions
2. Add database schema for best practices tracking
3. Integrate into sync process

#### Phase 2: Individual Detectors
Implement detection for:
- ✅ **Documentation**: Already tracking README, LICENSE, CHANGELOG, CONTRIBUTING, SETUP, FEATURES
- 🔄 **Pre-commit Hooks**: `.husky/`, `.git/hooks/`
- 🔄 **CI/CD**: `.github/workflows/`, `.gitlab-ci.yml`, `netlify.toml`, `.circleci/`
- 🔄 **Testing**: `vitest.config`, `jest.config`, `playwright.config`, `cypress.json`
- 🔄 **Linting**: `.eslintrc`, `.prettierrc`, `biome.json`, `.stylelintrc`
- 🔄 **Security**: `SECURITY.md`, `.github/dependabot.yml`, `.snyk`
- 🔄 **Templates**: `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`
- 🔄 **Package Managers**: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`
- 🔄 **Docker**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`
- 🔄 **Environment**: `.env.example`, `.env.template`
- 🔄 **EditorConfig**: `.editorconfig`
- 🔄 **Git**: `.gitignore`, `.gitattributes`

#### Phase 3: Display & Scoring
1. Add best practices section to ExpandableRow
2. Update health score calculation to include best practices
3. Add visual indicators (badges, icons)
4. Create best practices summary card

### Database Schema Addition

```sql
CREATE TABLE best_practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
    practice_type VARCHAR(50) NOT NULL,
    detected BOOLEAN NOT NULL,
    file_path VARCHAR(255),
    last_checked TIMESTAMP DEFAULT NOW(),
    UNIQUE(repo_id, practice_type)
);
```

### Files to Create/Modify

**New Files**:
- `lib/best-practices.ts` - Detection functions
- `database/migrations/add_best_practices.sql` - Schema migration

**Modified Files**:
- `lib/sync.ts` - Add best practices detection to sync
- `components/ExpandableRow.tsx` - Display best practices
- `lib/doc-health.ts` - Include best practices in health score

## Next Session Goals
1. ✅ Fix Activity column data population (run sync)
2. ✅ Fix Metrics display (add METRICS.md to test repos)
3. ✅ Test AI Summary with valid API key
4. 🔄 Implement best practices detection framework
5. 🔄 Add repo type selection to Add Repo form
6. 🔄 Make "+X more" expandable

## Meta-System Alignment

All root-level documentation files in Overseer are now tracked by the system itself:
- ✅ README.md
- ✅ LICENSE.md
- ✅ ROADMAP.md
- ✅ TASKS.md
- ✅ METRICS.md
- ✅ FEATURES.md
- ✅ SETUP.md
- ⏳ CHANGELOG.md (to be created)
- ⏳ CONTRIBUTING.md (to be created)

This ensures Overseer "eats its own dog food" and demonstrates best practices.
