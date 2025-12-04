# Tasks

## Done

- [x] Fix Modal content/markdown view and DiffView overflow issues

_For full feature details, see FEATURES.md. For historical changelog, see CHANGELOG.md._

## In Progress

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
