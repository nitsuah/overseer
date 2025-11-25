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

## In Progress
- [ ] Test AI Summary generation with corrected Gemini API
- [ ] Deploy to Netlify and verify OAuth flow

## Todo

### High Priority
- [ ] Add repo type selection to "Add Custom Repo" form
- [ ] Make "+X more" expandable in task/roadmap lists
- [ ] Add README Freshness metric calculation
- [ ] Validate Health Score Meter visualization

### Best Practices Detection System
- [ ] Create `lib/best-practices.ts` detection framework
- [ ] Detect pre-commit hooks (`.husky/`, `.git/hooks/`)
- [ ] Detect CI/CD configuration (`.github/workflows/`, `.gitlab-ci.yml`, `netlify.toml`)
- [ ] Detect testing frameworks (`vitest.config`, `jest.config`, `playwright.config`)
- [ ] Detect linting configuration (`.eslintrc`, `.prettierrc`, `biome.json`)
- [ ] Detect security files (`SECURITY.md`, `.github/dependabot.yml`)
- [ ] Detect issue/PR templates (`.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`)
- [ ] Detect package manager lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- [ ] Detect Docker configuration (`Dockerfile`, `docker-compose.yml`)
- [ ] Detect environment example files (`.env.example`)
- [ ] Add database schema for best practices tracking
- [ ] Integrate best practices into health score calculation
- [ ] Display best practices in dashboard

### Future Enhancements
- [ ] Add pre-commit hooks to Overseer project
- [ ] Implement full E2E tests with Playwright
- [ ] Implement Dark/Light Mode Toggle
- [ ] Add webhook integration for real-time updates

<!--
AGENT INSTRUCTIONS:
1. Add new tasks to "Todo" as they arise.
2. Move tasks to "In Progress" when you start working on them.
3. Move tasks to "Done" when completed.
4. Keep task descriptions concise.
-->
