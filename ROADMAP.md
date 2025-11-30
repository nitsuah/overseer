# 🗺️ Overseer Product Roadmap

## 2025Q4: 🚀 Stability & Core Integration

- [x] Initial Project Setup (Next.js, Tailwind, Neon DB)
- [x] GitHub Authentication & Integration
- [x] Repository Dashboard (Health Scores, Filtering)
- [x] Documentation Standards & Templates
- [x] Automated Documentation Fixes (Single & Batch PRs)
- [x] AI-Powered Repository Summaries (Gemini)
- [x] Support for Custom/Public Repositories
- [x] Default Repositories Feature
- [x] Dynamic OAuth URL Support (Netlify)

## 2025Q4: ✅ Feature Audit & Data Integration

- [x] Baseline Indicator Integration: Last Commit Date, Open PR/Issue Counts
- [x] Dashboard Polish: Stats column (Stars, Forks, Branches)
- [x] Code Coverage Visualization: Progress bars in table and detail panel
- [x] Reorganized Detail Panel: 2-column layout with card-based design
- [x] AI Summary Display: Prominent display in expandable rows
- [x] UX/Flow: Sync Status Clarity (Timestamp) and Type Column Tag Refinement
- [x] LICENSE.md Tracking: Added as tracked document type
- [x] Detail Panel 2.0: Features Section with parsed FEATURES.md
- [x] Meta-Features: Best Practices (10 checks) & Community Standards (10 checks) Detection
- [x] Basic Health Metrics: Testing framework, CI/CD, Linting, Pre-commit hooks, Docker
- [x] Compliance Checks: Gitignore, PR/Issue Templates, Environment Templates
- [x] Health Score 2.0: Comprehensive weighted calculation (Doc 30%, Testing 20%, Best Practices 20%, Community 15%, Activity 15%)
- [x] Document Health States: Missing, Dormant, Malformed, Healthy
- [x] Repo Type Selector: Added to custom repo form
- [x] Testing Section Enhancement: Framework detection, test file counting, improved display
- [x] Toast Notifications: Replaced alert() calls with non-intrusive toasts
- [x] Feature Audit: Comprehensive documentation vs implementation audit
- [x] Coverage Score Sync: Extract from METRICS.md and store in database
- [x] Health Score Breakdown Display: All 5 components visible with progress bars in UI
- [x] Self-reported Coverage Integration: Prominently displayed in Testing section
- [x] README Freshness Tracking: Days since last update with color-coded staleness
- [x] Documentation Accuracy: All docs updated to match implementation (100% accuracy)

## 2025Q4: 🎨 UX Consistency & Quick Wins

- [x] Templates for Community Standards: CODE_OF_CONDUCT, SECURITY, Issue templates
- [x] Fix Buttons: Add automated fixes for best practices/community standards
- [x] Batch Fix All Standards: Single PR for all missing standards
- [x] Test File Prominence: Show test file count more prominently in Testing section
- [x] Health Component Tooltips: Add tooltips explaining each health score component
- [x] Health State Icons: Display in main table row for each doc type
- [x] Foundation: Full E2E Tests and Pre-commit Hooks
- [x] Template File Hashing: Detect stale/unchanged templates

## 2025Q4: 🚀 Advanced Metrics & Integrations

- [x] CI/CD Build Status: Integrate GitHub Actions API for live build status
- [x] Test Case Counting: Parse test files for actual test case counts
- [x] Vulnerability Tracking: Integrate GitHub Security/Dependabot alerts API
- [x] Vulnerability Metrics: Display count and severity in dashboard
- [x] Lines of Code (LOC): Total LOC with language breakdown
- [x] LOC Display: Show LOC metrics in Repository Stats section
- [x] Test Cases Display: Show test case count in Testing section
- [x] CI/CD Status Display: Show passing/failing status with workflow name and last run in Best Practices section
- [x] Vulnerability Display: Show alert count with severity-based color coding in Repository Stats

## 2025Q4: ✅ Contributor Analytics & Enterprise Features

- [x] Template Health Detection: Content hashing to detect unchanged/stale templates
- [x] Template Version Tracking: Track which template version docs are based on
- [x] Dormant State Detection: Mark docs matching templates as "dormant"
- [x] Malformed State Detection: Detect docs with template markers or too short
- [x] Contributor Analytics: Track contributor count and diversity
- [x] Commit Frequency Tracking: Calculate commits/week from last 12 weeks
- [x] Bus Factor Analysis: Contributor concentration risk (80/20 rule)
- [x] PR Merge Time Tracking: Average cycle time from creation to merge
- [x] Contributor Metrics Display: Show all contributor analytics in Repository Stats
- [x] Gemini API Integration: Updated to use Gemini 2.5 models (deprecated 1.x models)

## 2025Q4: 📚 Docs & Agent Tooling

- [x] Agent Instruction Guide (templates/.github/prompts/PM.md): Comprehensive documentation standards for AI agents
- [x] Anti-Hallucination Guidelines: Format specifications and validation rules to prevent AI errors
- [x] Documentation Maintenance Workflow: Move/collapse pattern for keeping docs clean
- [x] Error Handling Documentation Pattern: Comprehensive guide for documenting error handling across all core docs

## 2025Q4: 🛡️ Error Handling & UX Polish

- [x] OAuth Error Detection System: Created lib/github-errors.ts with 5 error type classifications
- [x] Organization Access Restrictions: User-friendly messaging when orgs block OAuth app access
- [x] Auto-Redirect to Authorization: Opens GitHub OAuth settings automatically when restrictions detected
- [x] Enhanced API Error Responses: Structured error details with actionable instructions in fix-doc/fix-best-practice
- [x] Frontend Error Handling: Toast notifications with console guidance in useRepoActions hook
- [x] OAuth User Documentation: Created GITHUB_OAUTH_ORG_ACCESS.md and OAUTH_ORG_FIX_SUMMARY.md guides
- [x] Template Path Debugging: Enhanced logging for troubleshooting template resolution
- [x] Best Practices Fix Buttons: 4 automated fixes (Dependabot, Env Template, Docker, Netlify Badge)
- [x] Community Standards Accuracy: Fixed count to 10 (added CODEOWNERS, Copilot Instructions, FUNDING.yml)
- [x] FUNDING.yml Community Standard: 10th standard with template and auto-fix support
- [x] Features Display Order: Reversed to show newest features first
- [x] Doc Health Calculation: Removed LICENSE, CONTRIBUTING, ROUTES from scoring (focus on core docs)
- [x] Doc Health Tooltips: Comprehensive breakdown showing individual document states
- [x] Doc Counter Badge: Removed redundant 5/5 badge (health states now in tooltip)
- [x] Duplicate Metrics Fix: Implemented DELETE before INSERT to prevent accumulation
- [x] Refresh Button: Added force refetch in detail panel with animated RefreshCw icon
- [x] Windows Line Endings Bug: Fixed parsers to handle CRLF with split(/\r?\n/)
- [x] GraphQL Rate Limit Safety: Added null check for optional GraphQL rate limit data
- [x] TypeScript Build Fixes: Session type extension, array mutation fix, centralized repo detection

## 2025Q4: 🎨 Detail Panel Overhaul

- [x] Three-Row Layout Architecture: Reorganized detail panels into logical groupings (Project/Quality/Standards)
- [x] Synchronized Expand/Collapse: Row 1 (Features/Roadmap/Tasks), Row 2 (Documentation/Best Practices/Testing), Row 3 (Standards/Metrics/Issues)
- [x] Gradient Backgrounds: Applied unique color-coded gradients to all sections (purple AI, orange Features, blue Tasks/Testing, green Standards/Metrics, cyan Repo Stats, amber Documentation, red Issues)
- [x] Sidebar Consolidation: Moved AI Summary and Repository Stats to left sidebar with always-visible refresh button
- [x] Enhanced Testing Display: Inline coverage progress bar in section header with 3-component health check (framework/CI exists/CI passing)
- [x] Improved Health Shields: Added tooltips showing detailed breakdowns for Community Standards, Best Practices, Testing, Coverage, and Documentation
- [x] Type & Language Icons: Split into logical columns - type icon with repo name, language label at end of description
- [x] Refresh Button Repositioning: Moved to Repository Stats header for always-visible access without scrolling
- [x] Collapsible Section Cards: Default expanded state for project sections (Row 1), collapsed for quality/standards (Rows 2-3)
- [x] Subsection Support in Tasks: Added subsection column to database schema with parser support for organized task groupings
- [x] Show More/Less Controls: Added granular controls to show all quarters/subsections or completed items on demand
- [x] AI Summary Section: Extracted into dedicated component with generate button and dismissible state management
- [x] Bold Text Parsing: Created markdown-utils for **bold** syntax rendering in roadmap/task titles
- [x] Visual Hierarchy Improvements: Enhanced spacing, borders, shadows, and hover states for better visual flow

## 2026Q1: 🤖 Autonomous Agents & Conversational UI

- [ ] **Agent Task Queue:** API endpoint for autonomous AI agents to submit tasks
- [ ] **Workflow Visualization:** Screen showing branching/execution paths for complex actions
- [ ] **Unified PR & Task Manager:** Central dashboard for all PRs and TASKS.md entries
- [ ] **Roadmap Simulation:** AI-powered schedule impact analysis
- [ ] **Conversational Interface Foundation:** Natural language, chat-driven interface

## 2026Q2: 🎨 UX Enhancements & Preview Features

- [ ] Doc Fix Preview Modal: Modal window before PR creation with template preview and pick-and-choose options
  - [ ] Template preview - Show what will be added before creating PR
  - [ ] Selective fixes - Allow users to choose which docs to fix in batch operations
  - [ ] Confirmation step - "Do you really want to fix all?" with explicit opt-in per document
  - [ ] Live template rendering - Preview markdown rendering in modal before committing

## 2026Q2: 🔐 Production Deployment & Security Enhancements

- [ ] GitHub OAuth Production Fix: Resolve callback URL and token handling issues
- [ ] Rate Limiting Optimization: Smart caching and batching to reduce API pressure
  - [ ] Content-hash based caching - Skip unchanged files using doc_status.content_hash
  - [ ] ETag support - Use GitHub ETag headers to avoid redundant fetches
  - [ ] Batch delays - Add configurable delays between repo syncs
  - [ ] Rate limit UI - Display current rate limit status with warnings
  - [ ] Exponential backoff - Retry with backoff when rate limited
- [ ] Security in Health Score: Add vulnerability metrics to calculation
- [ ] Security Detail: Track 6 GitHub security configuration settings
  - [ ] Security policy - Define vulnerability reporting process
  - [ ] Security advisories - View/disclose security advisories
  - [ ] Private vulnerability reporting - Allow private reports
  - [ ] Dependabot alerts - Dependency vulnerability counter/link
  - [ ] Code scanning alerts - Automatic vulnerability detection
  - [ ] Secret scanning alerts - Secret detection in commits

## 2026Q3: 🏗️ Advanced Analytics Features

- [ ] Velocity Tracking: Expand PR/commit analytics with trends
- [ ] Technical Debt Scoring: Dependency Age Score
- [ ] Agent APIs: AI-driven actions like "Suggest Roadmap" and "Propose Code Review Assignment"
- [ ] Extensibility: Plugin System for Custom Parsers
- [ ] Real-time: Webhook Integration for Real-time Updates
- [ ] Team Collaboration Features (Comments, Assignments)
- [ ] Enterprise SSO Integration
- [ ] Mobile App (React Native)
- [ ] Custom AI Model Fine-tuning
- [ ] Foundation: Dark/Light Mode Toggle

---

### 🎯 From Diagnosis to Action

The evolution of Overseer moves the tool out of the diagnostic camp and into the prescriptive and active camp.

The core efficiency is the **lightweight architecture**: by relying on **GitHub Repositories** (code, markdown docs) as the source of truth, Overseer avoids the manual overhead of traditional project trackers.

The ultimate goal is to evolve the dashboard into a **Conversational Interface** where users can delegate complex, multi-step governance tasks through natural language, such as:

- _"Overseer, run a full hygiene check on the core payment service, fix any stale documentation, and assign the highest priority vulnerability fix to Alice."_
- _"What is the impact on Q3's deadline if we delay the Mobile App feature by one month?"_

This transition establishes Overseer as the central **Workflow Orchestrator** and **Intelligence Layer** for engineering health.

<!--
AGENT INSTRUCTIONS:
1. Keep this roadmap up-to-date with high-level milestones.
2. Mark items as completed [x] when features are shipped.
3. Add new quarters as time progresses.
-->
