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

### Core Features Delivered (Earlier in Q4 2025)

- [x] Repository dashboard with health scoring, filtering, and expandable details
- [x] Documentation tracking and automated fixes (single/batch PR creation)
- [x] AI-powered summaries (Google Gemini 2.5)
- [x] Best Practices detection (10 checks) and Community Standards tracking (8 checks)
- [x] Features parser and display system with category organization
- [x] Default repositories feature for non-authenticated users
- [x] Database schema with comprehensive metric tracking

_For full feature details, see FEATURES.md. For historical changelog, see CHANGELOG.md._

## In Progress

- [ ] FIX GitHub OAuth in production environment (token/callback issues)

## Todo

### Phase 7: Security Configuration & Tracking

- [ ] Track GitHub security policy presence (SECURITY.md existence)
- [ ] Detect security advisory configuration (vulnerability disclosure enabled)
- [ ] Check private vulnerability reporting status
- [ ] Monitor Dependabot alerts status (enabled/disabled)
- [ ] Track code scanning alerts configuration
- [ ] Track secret scanning alerts configuration

### Phase 8: Future Enhancements

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
