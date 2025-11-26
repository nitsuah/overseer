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

## In Progress

- [ ] Test all new features end-to-end after migration
- [ ] Verify Features/Best Practices/Community Standards display in UI


## Todo

### High Priority

- [ ] Add Testing Metrics Display (test count, coverage %, framework detection)
- [ ] Add Health State Icons to main table row for each section
- [ ] Add README Freshness metric calculation
- [ ] Validate Health Score Meter visualization with new calculation
- [ ] FIX GitHub OAuth in production environment (token/callback issues)
- [ ] FIX Gemini API integration (404 errors - model version mismatch)

### Medium Priority

- [ ] Metrics Display Enhancement (ensure all METRICS.md data shows in panels)
- [ ] Verify GitHub OAuth works in all environments (local, preview, production)

### Future Enhancements

- [ ] Add pre-commit hooks to Overseer project
- [ ] Implement full E2E tests with Playwright
- [ ] Implement Dark/Light Mode Toggle
- [ ] Add webhook integration for real-time updates
- [ ] Template health checking (dormant/malformed detection with hashing)
- [ ] Add "Fix" buttons for missing best practices and community standards
- [ ] Token Density Metric (LOC per logical unit with AI-assisted parsing)
- [ ] Bus Factor Analysis (contributor concentration risk)
- [ ] Zombie Branch Detection (stale branches past merge)
- [ ] Maintenance Mode Detection (activity patterns suggesting abandonment)
- [ ] Comment-to-Code Ratio Analysis (documentation density)

<!--
AGENT INSTRUCTIONS:
1. Add new tasks to "Todo" as they arise.
2. Move tasks to "In Progress" when you start working on them.
3. Move tasks to "Done" when completed.
4. Keep task descriptions concise.
-->
