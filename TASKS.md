# Tasks

## Done

### Recent Completions (November 2025)

- [x] **Dependency Updates**: Bumped @types/node to 24.10.1, dotenv to 17.2.3, and minor-and-patch group packages
- [x] **Detail Panel Redesign**: Complete UI overhaul with three-row layout, left sidebar (AI Summary + Repo Stats), synchronized expand/collapse
- [x] **Gradient Backgrounds**: Applied unique color-coded gradients to all sections (purple, orange, blue, green, cyan, amber, red)
- [x] **Enhanced Health Shields**: Detailed tooltips with component breakdowns for all health metrics
- [x] **Subsection Support**: Added subsection column to tasks table with migration and parser support
- [x] **AI Summary Component**: Extracted into dedicated AISummarySection with generate button
- [x] **Repository Stats Static**: Created component with inline metrics and always-visible refresh button
- [x] **Bold Text Parsing**: Created markdown-utils for **bold** syntax rendering
- [x] **Language Icons**: Added getLanguageIcon() helper with compact labels (TS, JS, PY, etc.)
- [x] **Type & Language Split**: Type icon with repo name, language label with description
- [x] **Testing Section Enhancement**: Inline coverage progress bar in header
- [x] **Windows Line Endings Bug Fix**: Fixed markdown parsers to handle CRLF line endings (split(/\r?\n/) instead of split('\n'))
- [x] **GraphQL Rate Limit Safety**: Added null check for data.resources.graphql in rate-limit endpoint
- [x] **TypeScript Build Fixes**: Extended Session interface, fixed array mutation, centralized repo type detection
- [x] **UI Improvements Phase 4**: Reversed features order, doc health tooltips, removed duplicate badges
- [x] **FUNDING.yml Standard**: Added 10th community standard with template and auto-fix support
- [x] **Refresh Button**: Added force refetch capability in detail panel with animated icon
- [x] **Duplicate Metrics Fix**: Implemented DELETE before INSERT pattern to prevent metric accumulation
- [x] Documentation system overhaul: PROMPT.md for agent instructions, full audit, accuracy fixes
- [x] Advanced metrics integration: LOC, test case counting, CI/CD status, vulnerability tracking
- [x] Contributor analytics: count, commit frequency, bus factor, PR merge time
- [x] Template health detection: content hashing, dormant/malformed state detection, version tracking
- [x] UI/UX enhancements: health breakdown hover, detail panel reorganization, toast notifications
- [x] Testing infrastructure: Pre-commit hooks, full E2E test suite with Playwright
- [x] Component refactoring: Extracted hooks (useDashboard, useRepoActions, useRepoFilters), modular components
- [x] OAuth error handling: Comprehensive error parsing, auto-redirect to GitHub authorization, user-friendly messages
- [x] Error detection system: Created lib/github-errors.ts with OAuth restriction, permission, rate limit detection
- [x] Enhanced API error responses: Detailed error types and actionable instructions in fix-doc and fix-best-practice endpoints
- [x] OAuth documentation: Created GITHUB_OAUTH_ORG_ACCESS.md and OAUTH_ORG_FIX_SUMMARY.md guides
- [x] Best practices auto-fix: Fix buttons for Dependabot, Env Template, Docker, Netlify Badge (4 practices with templates)
- [x] Documentation accuracy audit: Fixed Community Standards count from 8 to 10 (added CODEOWNERS, Copilot Instructions, FUNDING)
- [x] Coverage sync bug fix: Always update coverage_score to NULL when no coverage found (prevents stale values)
- [x] Batch sync coverage fix: Added coverage extraction to sync-repos endpoint
- [x] Metrics parser enhancement: Normalize percentage formats (0.8666 → 86.66%, 86.66% stays 86.66)
- [x] Testing section display: Separate metric values from long descriptions with detail text
- [x] Rate limit detection: Created /api/github-rate-limit endpoint for monitoring API usage
- [x] Debug tooling: Created /api/repos/[name]/debug endpoint for database inspection

### Core Features Delivered (Earlier in Q4 2025)

- [x] Repository dashboard with health scoring, filtering, and expandable details
- [x] Documentation tracking and automated fixes (single/batch PR creation for 8 doc types)
- [x] AI-powered summaries (Google Gemini 2.5)
- [x] Best Practices detection (10 checks) and Community Standards tracking (10 checks)
- [x] Features parser and display system with category organization
- [x] Default repositories feature for non-authenticated users
- [x] Database schema with comprehensive metric tracking

### Fixed Auth

- [x] Fix Github Auth in PROD
- [x] When not logged in the two expected default repos are are shown

_For full feature details, see FEATURES.md. For historical changelog, see CHANGELOG.md._

## In Progress

_No tasks currently in progress._

## Todo

### Phase 7: UX Improvements

- [x] Add modal window for doc fix preview before PR creation
- [x] Implement template preview in modal with markdown rendering
- [x] Add pick-and-choose functionality for batch fix operations
- [x] Add "Do you really want to fix all?" confirmation with per-doc opt-in
- [ ] AI fix Community Standards Gaps (Cake Test) - Overseer tracks these but doesn't have them itself at root, will need to add them as a test of using overseer to test the features (maybe now we can connect AI generate to take the template, and the repo info, and create them):
  - CODE_OF_CONDUCT.md (exists in templates/ only)
  - SECURITY.md (exists in templates/ only)
  - Issue Templates (exists in templates/ only)
  - PR Template (not present)
  - AI only provides updates to source files using repo knowledge, no other input that would mess up file format expected
  - **Priority**: Medium - Nice to have for dogfooding our own standards and integrating AI further.

### Phase 8: Performance & Rate Limiting

- [ ] Implement smart caching for GitHub API calls using content_hash from doc_status
- [ ] Add ETag support to skip unchanged file fetches
- [ ] Add delay batching between repos during sync to reduce rate limit pressure
- [ ] Display rate limit status in UI with warning when approaching limits
- [ ] Consider implementing exponential backoff for rate limit retries

### Phase 9: Security Configuration & Tracking

- [ ] Add new "Security Details" section to application detail window.
- [ ] Track GitHub security policy presence (SECURITY.md existence)
- [ ] Detect security advisory configuration (vulnerability disclosure enabled)
- [ ] Check private vulnerability reporting status
- [ ] Monitor Dependabot alerts status (enabled/disabled)
- [ ] Track code scanning alerts configuration
- [ ] Track secret scanning alerts configuration

### Phase 10: Future Enhancements

- [ ] Add webhook integration for real-time updates (get repo after 5 minutes, if panel is expanded, scheduler for refreshes)
- [ ] Token Density Metric (LOC per logical unit with AI-assisted parsing)
- [ ] Zombie Branch Detection (stale branches past merge)
- [ ] Maintenance Mode Detection (activity patterns suggesting abandonment)
- [ ] Comment-to-Code Ratio Analysis (documentation density)
- [ ] Implement Dark/Light Mode Toggle and other UI enhancements

<!--
AGENT INSTRUCTIONS:
1. Add new tasks to "Todo" as they arise.
2. Move tasks to "In Progress" when you start working on them.
3. Move tasks to "Done" when completed.
4. Keep task descriptions concise.
5. Wait for PM to add new Tasks if completed all current tasks.
-->
