# Tasks

## Done

- [x] **Guided Tour System**: Interactive 16-step tour with spotlight overlay, auto-advance (3s), and data-tour attributes
- [x] **Tour Navigation**: Welcome → Table columns → Expanded sections (Features/Roadmap/Tasks/Documentation/Best Practices/Testing/Community) → Controls → Status pills
- [x] **Row Expansion Logic**: Smart expand/collapse for proper section visibility during tour steps
- [x] Fix Modal content/markdown view and DiffView overflow issues
- [x] Update Health Breakdown weights: Documentation 20%, Testing 25%, Best Practices 25%, Community Standards 10%, Activity 10%
- [x] **Best Practices AI Generation**: Implement modal-based PR creation with AI enrichment for CI/CD, Gitignore, Pre-commit Hooks, Testing Framework, Linting
- [x] **Fix All Button**: Add batch PR creation for all missing best practices (includes env_template fix)
- [x] **AI Prompt Chain**: Context-aware documentation generation using repo metadata (language, description, topics, homepage)
- [x] **Dependabot Template**: Create valid configuration without duplicate package-ecosystem entries
- [x] **Test Coverage**: Achieve 60.21% coverage with comprehensive unit tests for date-utils, log, repo-type, health-score
- [x] **Test Suite Expansion**: Add 81 new tests across 4 utility files (24 date tests, 40 repo-type tests, 11 health-score tests, 6 log tests)

_For full feature details, see FEATURES.md. For historical changelog, see CHANGELOG.md._

## In Progress

- [ ] **Test Coverage Target**: Increase coverage from 60% to 70%+ with additional utility and component tests

## Todo

### v0.1.8: Performance & Rate Limiting

- [ ] Implement smart caching for GitHub API calls using content_hash from doc_status
- [ ] **Improve Error Handling in GitHub API Client** - Standardize error messages and logging in lib/github.ts
- [ ] Add ETag support to skip unchanged file fetches
- [ ] Add delay batching between repos during sync to reduce rate limit pressure
- [ ] Display rate limit status in UI with warning when approaching limits
- [ ] Consider implementing exponential backoff for rate limit retries

### v0.1.9: Security & Tracking

- [ ] Add new "Security Details" section to application detail window.
- [ ] Track GitHub security policy presence (SECURITY.md existence)
- [ ] Detect security advisory configuration (vulnerability disclosure enabled)
- [ ] Check private vulnerability reporting status
- [ ] Monitor Dependabot alerts status (enabled/disabled)
- [ ] Track code scanning alerts configuration
- [ ] Track secret scanning alerts configuration

### v0.1.10: Future Enhancements

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
