# Tasks

## Done

### Recent Completions (November 2025)

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
- [x] Documentation accuracy audit: Fixed Community Standards count from 8 to 9 (added CODEOWNERS, Copilot Instructions tracking)
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
- [x] Best Practices detection (10 checks) and Community Standards tracking (9 checks)
- [x] Features parser and display system with category organization
- [x] Default repositories feature for non-authenticated users
- [x] Database schema with comprehensive metric tracking

_For full feature details, see FEATURES.md. For historical changelog, see CHANGELOG.md._

## In Progress

- [ ] Fix Github Auth in PROD - currently failing due to OAuth app misconfiguration? or redirect URI issue? (we have local and prod versions in github, both authorized)
- [ ] When not logged in the two expected default repos are not shown (overseer, nitsuah-io) might be a routes auth thing? idk

```text
GET https://ghoverseer.netlify.app/api/auth/signin/github? 500 (Internal Server Error)
z	@	/_next/static/chunks…4a2ae1e8de70d8.js:1
ab	@	/_next/static/chunks…4a2ae1e8de70d8.js:1
uJ	@	/_next/static/chunks…4a2ae1e8de70d8.js:1
sf	@	/_next/static/chunks…4a2ae1e8de70d8.js:1
(anonymous)	@	/_next/static/chunks…4a2ae1e8de70d8.js:1
i7	@	/_next/static/chunks…4a2ae1e8de70d8.js:1
sB	@	/_next/static/chunks…4a2ae1e8de70d8.js:1
C	@	/_next/static/chunks…4a2ae1e8de70d8.js:1
```

## Todo

### Phase 7: UX Improvements

- [ ] Add modal window for doc fix preview before PR creation
- [ ] Implement template preview in modal with markdown rendering
- [ ] Add pick-and-choose functionality for batch fix operations
- [ ] Add "Do you really want to fix all?" confirmation with per-doc opt-in

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

- [ ] Add webhook integration for real-time updates
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
