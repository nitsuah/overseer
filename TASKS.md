# Tasks

## Done

- [x] Build main dashboard table with sorting and filtering
- [x] Implement "Fix Missing Docs" feature
- [x] Integrate Google Gemini for AI summaries
- [x] Add "Add Custom Repo" functionality
- [x] Code coverage improvements (parsers now at 87.5%)
- [x] Implement baseline GitHub API metrics (Last Commit Date, Open PR/Issue Counts)
- [x] Add Last Commit Date to dashboard rows
- [x] Implement Sync Status timestamp display
- [x] Complete dashboard UI integration (Activity + Last Sync columns)
- [x] Add Stats column (Stars, Forks, Branches)
- [x] Implement code coverage visualization (progress bars)
- [x] Reorganize ExpandableRow component (2-column layout)
- [x] Add AI Summary display in expandable rows
- [x] Fix Gemini API model name (gemini-pro)
- [x] Implement default repositories feature
- [x] Add dynamic NEXTAUTH_URL for Netlify deployments
- [x] Move Stats to detail panel to save column space
- [x] Add LICENSE.md as tracked document type
- [x] Create comprehensive FEATURES.md
- [x] Update DEFAULT_REPOS (removed pverseer)
- [x] Make "+X more" expandable in task/roadmap lists
- [x] Create CHANGELOG.md and CONTRIBUTING.md
- [x] Consolidate documentation
- [x] Update database schema with features, best_practices, community_standards tables
- [x] Create FEATURES.md parser with category and description support
- [x] Implement Best Practices detection (10 checks including CI/CD, hooks, linting)
- [x] Implement Community Standards detection (7 checks)
- [x] Add document health states (missing, dormant, malformed, healthy)
- [x] Integrate new parsers and detection into sync workflow
- [x] Update API endpoints to return features, best practices, community standards
- [x] Display Features section in UI with real data
- [x] Display Best Practices section with status indicators
- [x] Display Community Standards section with status indicators
- [x] Implement comprehensive health score calculation (weighted)
- [x] Add repo type selector to Add Custom Repo form
- [x] Run database migration script (created migrate-schema.ts with dotenv support)
- [x] Execute migration successfully (all new tables and columns created)
- [x] Update Gemini AI integration (gemini-1.5-flash, improved prompts, error handling)
- [x] Complete feature audit and documentation update (November 2025)
- [x] Sync coverage_score from METRICS.md to repos.coverage_score column during sync
- [x] Update sync.ts to extract and store coverage in repos table
- [x] Display health score breakdown (5 components) in ExpandableRow UI
- [x] Integrate self-reported coverage from METRICS.md into Testing section prominently
- [x] Update FEATURES.md - ensure 100% accuracy (10 best practices, 8 community standards, README freshness, health breakdown)
- [x] Update METRICS.md with current accurate values (all features marked correctly)
- [x] Update ROADMAP.md Q1 status (marked as COMPLETED)
- [x] Add README Freshness metric (days since last README update)
- [x] Display README freshness with color-coding in Documentation section
- [x] Create templates for CODE_OF_CONDUCT.md, SECURITY.md, Issue templates
- [x] Show test file count more prominently in Testing section
- [x] Add tooltips to health score explaining each component
- [x] Add "Fix" buttons for missing community standards items (CODE_OF_CONDUCT, SECURITY)
- [x] Implement batch "Fix All Standards" option with API endpoint
- [x] Health Breakdown as hover popup (November 2025)
- [x] Limit Features display to 3 category cards (November 2025)
- [x] Reorganize detail panel layout - two rows with Doc/BP/CS in dedicated row (November 2025)
- [x] Fix metrics panel display - transform database metric_name to name (November 2025)
- [x] Add Documentation health shield to main table row (November 2025)
- [x] Integrate GitHub Actions API for live CI/CD build status (November 2025)
- [x] Display current build status (passing/failing) with last run time in Best Practices section (November 2025)
- [x] Parse test files to count actual test cases (it(), test() calls) (November 2025)
- [x] Show test case count alongside test file count in Testing section (November 2025)
- [x] Integrate GitHub Security/Vulnerability Alerts API (November 2025)
- [x] Display vulnerability count and severity in Repository Stats (November 2025)
- [x] Add Lines of Code (LOC) metrics: total LOC with language breakdown (November 2025)
- [x] Calculate and display LOC-based statistics in Repository Stats section (November 2025)
- [x] Implement content hashing for documentation templates (Phase 4, November 2025)
- [x] Detect unchanged/stale templates - mark as "Dormant" (Phase 4, November 2025)
- [x] Detect malformed document structure - mark as "Malformed" (Phase 4, November 2025)
- [x] Add template version tracking (Phase 4, November 2025)
- [x] Track contributor count and diversity (Phase 5, November 2025)
- [x] Calculate commit frequency (commits/week) (Phase 5, November 2025)
- [x] Implement bus factor analysis (contributor concentration) (Phase 5, November 2025)
- [x] Track PR merge time (cycle time) (Phase 5, November 2025)
- [x] Display contributor metrics in Repository Stats section (Phase 5, November 2025)
- [x] Refactor large files: ExpandableRow.tsx (892 → 175 lines) and page.tsx (890 → 198 lines) (November 2025)
- [x] Extract reusable hooks: useDashboard, useRepoActions, useRepoFilters (November 2025)
- [x] Create modular components: DashboardHeader, FilterPanel, RepoTableRow (November 2025)
- [x] Add Health State Icons to main table row for each major detail section
- [x] Validate Health Score Meter visualization with new calculation
- [x] Add Testing Metrics Display (test count, coverage %, framework detection) - COMPLETED
- [x] Add pre-commit hooks to Overseer project (husky + lint-staged + prettier)
- [x] Implement full E2E tests with Playwright (comprehensive test suite)
- [x] Default repos should appear when not logged in yet (preview screen)

## In Progress

- [ ] FIX GitHub OAuth in production environment (token/callback issues)
- [ ] FIX Gemini API integration (404 errors - model version mismatch)

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
- [ ] Template health checking (dormant/malformed detection with hashing)
- [ ] Add "Fix" buttons for missing best practices and community standards items (template, action)
- [ ] Token Density Metric (LOC per logical unit with AI-assisted parsing)
- [ ] Bus Factor Analysis (contributor concentration risk)
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
