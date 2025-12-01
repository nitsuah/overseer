# Tasks

## Done

_For full feature details, see FEATURES.md. For historical changelog, see CHANGELOG.md._

## In Progress

_No tasks currently in progress._

## Todo

### PR #16 Feedback (Copilot AI Review)

- [ ] **Fix Dynamic Tailwind Classes in Header.tsx** - Lines 202-206: `text-${textColor}` won't work with JIT compiler, needs color mapping or inline styles
- [ ] **Extract Gemini Model to Constant** - Hardcoded 'gemini-2.0-flash-exp' in 3 places in lib/ai.ts, use the get models output to define @latest (lines 20, 92, 151)
- [ ] **Add failover for GenAI** with multiple model providers (like claude, gpt-4) for redundancy and add switcher to user profile section
- [ ] **Refactor TestingSection Null Checks** - Verbose null/undefined checks could use helper function or nullish coalescing
- [ ] **Consider LICENSE Year Logic** - Use repo creation year instead of current year for copyright notices

## Todo

### Phase 8: Performance & Rate Limiting

- [ ] Implement smart caching for GitHub API calls using content_hash from doc_status
- [ ] **Improve Error Handling in GitHub API Client** - Standardize error messages and logging in lib/github.ts
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
