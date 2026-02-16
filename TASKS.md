# Tasks

## Done

_For full feature details, see FEATURES.md. For historical changelog, see CHANGELOG.md._

## In Progress

## Todo

### v0.1.8: Performance & Rate Limiting

- [x] Add sorting to Repo list ui (name, health, stars, updated, language columns)
- [x] Improve Error Handling in GitHub API Client - Standardized error messages and logging in lib/github.ts
- [x] Display rate limit status in UI with warning when approaching limits (RateLimitIndicator component)
- [x] Add delay batching between repos during sync to reduce rate limit pressure (configurable SYNC_DELAY_MS=2000)
- [x] Implement exponential backoff for rate limit retries (3 attempts with backoff)
- [x] Implement smart caching for GitHub API calls using content_hash from doc_status (in-memory cache with 5-min TTL)
- [x] Add ETag support to skip unchanged file fetches (integrated in getFileContent and listRepos)
- [x] Fix TypeScript errors in scripts/debug-skyview.ts
- [x] Fix failing Playwright tests in dashboard.spec.ts
- [ ] **Test Coverage Target**: Increase coverage from 60% to 70%+ with additional utility and component tests

### v0.1.9: Security & Tracking

- [x] Add new "Security Details" section to application detail window.
- [x] Track GitHub security policy presence (SECURITY.md existence)
- [x] Detect security advisory configuration (vulnerability disclosure enabled)
- [x] Check private vulnerability reporting status
- [x] Monitor Dependabot alerts status (enabled/disabled)
- [x] Track code scanning alerts configuration
- [x] Track secret scanning alerts configuration

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
