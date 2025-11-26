# 🗺️ Overseer Product Roadmap

## Q4 2024: Stability & Core Integration (Completed) 🚀

- [x] Initial Project Setup (Next.js, Tailwind, Neon DB)
- [x] GitHub Authentication & Integration
- [x] Repository Dashboard (Health Scores, Filtering)
- [x] Documentation Standards & Templates
- [x] Automated Documentation Fixes (Single & Batch PRs)
- [x] AI-Powered Repository Summaries (Gemini)
- [x] Support for Custom/Public Repositories
- [x] Default Repositories Feature
- [x] Dynamic OAuth URL Support (Netlify)

## Q1 2025: Feature Audit & Data Integration (COMPLETED) ✅

- [x] Baseline Indicator Integration: Last Commit Date, Open PR/Issue Counts
- [x] Dashboard Polish: Stats column (Stars, Forks, Branches)
- [x] Code Coverage Visualization: Progress bars in table and detail panel
- [x] Reorganized Detail Panel: 2-column layout with card-based design
- [x] AI Summary Display: Prominent display in expandable rows
- [x] UX/Flow: Sync Status Clarity (Timestamp) and Type Column Tag Refinement
- [x] LICENSE.md Tracking: Added as tracked document type
- [x] Detail Panel 2.0: Features Section with parsed FEATURES.md
- [x] Meta-Features: Best Practices (10 checks) & Community Standards (8 checks) Detection
- [x] Basic Health Metrics: Testing framework, CI/CD, Linting, Pre-commit hooks, Docker
- [x] Compliance Checks: Gitignore, PR/Issue Templates, Environment Templates
- [x] Health Score 2.0: Comprehensive weighted calculation (Doc 30%, Testing 20%, Best Practices 20%, Community 15%, Activity 15%)
- [x] Document Health States: Missing, Dormant, Malformed, Healthy
- [x] Repo Type Selector: Added to custom repo form
- [x] Testing Section Enhancement: Framework detection, test file counting, improved display
- [x] Toast Notifications: Replaced alert() calls with non-intrusive toasts
- [x] Feature Audit: Comprehensive documentation vs implementation audit (November 2025)
- [x] Coverage Score Sync: Extract from METRICS.md and store in database
- [x] Health Score Breakdown Display: All 5 components visible with progress bars in UI
- [x] Self-reported Coverage Integration: Prominently displayed in Testing section
- [x] README Freshness Tracking: Days since last update with color-coded staleness
- [x] Documentation Accuracy: All docs updated to match implementation (100% accuracy)

## Q2 2025: UX Consistency & Quick Wins (IN PROGRESS) 🎨

- [x] Templates for Community Standards: CODE_OF_CONDUCT, SECURITY, Issue templates (November 2025)
- [x] Fix Buttons: Add automated fixes for best practices/community standards (November 2025)
- [x] Batch Fix All Standards: Single PR for all missing standards (November 2025)
- [x] Test File Prominence: Show test file count more prominently in Testing section (November 2025)
- [x] Health Component Tooltips: Add tooltips explaining each health score component (November 2025)
- [ ] GitHub OAuth Production Fix: Resolve callback URL and token handling issues
- [ ] Gemini API Integration Fix: Resolve model version compatibility
- [x] Health State Icons: Display in main table row for each doc type (November 2025)
- [x] Foundation: Full E2E Tests and Pre-commit Hooks (November 2025)
- [ ] Foundation: Dark/Light Mode Toggle
- [x] Template File Hashing: Detect stale/unchanged templates (November 2025)

## Q3 2025: Advanced Metrics & Integrations (COMPLETED) 🚀

- [x] CI/CD Build Status: Integrate GitHub Actions API for live build status
- [x] Test Case Counting: Parse test files for actual test case counts
- [x] Vulnerability Tracking: Integrate GitHub Security/Dependabot alerts API
- [x] Vulnerability Metrics: Display count and severity in dashboard
- [x] Lines of Code (LOC): Total LOC with language breakdown
- [x] LOC Display: Show LOC metrics in Repository Stats section
- [x] Test Cases Display: Show test case count in Testing section
- [x] CI/CD Status Display: Show passing/failing status with workflow name and last run in Best Practices section
- [x] Vulnerability Display: Show alert count with severity-based color coding in Repository Stats

## Q4 2025: Contributor Analytics & Enterprise Features (IN PROGRESS) 🏗️

- [x] Template Health Detection: Content hashing to detect unchanged/stale templates (November 2025)
- [x] Template Version Tracking: Track which template version docs are based on (November 2025)
- [x] Dormant State Detection: Mark docs matching templates as "dormant" (November 2025)
- [x] Malformed State Detection: Detect docs with template markers or too short (November 2025)
- [x] Contributor Analytics: Track contributor count and diversity (November 2025)
- [x] Commit Frequency Tracking: Calculate commits/week from last 12 weeks (November 2025)
- [x] Bus Factor Analysis: Contributor concentration risk (80/20 rule) (November 2025)
- [x] PR Merge Time Tracking: Average cycle time from creation to merge (November 2025)
- [x] Contributor Metrics Display: Show all contributor analytics in Repository Stats (November 2025)
- [ ] Security in Health Score: Add vulnerability metrics to calculation
- [ ] Velocity Tracking: Expand PR/commit analytics with trends
- [ ] Technical Debt Scoring: Dependency Age Score
- [ ] Agent APIs: AI-driven actions like "Suggest Roadmap" and "Propose Code Review Assignment"
- [ ] Extensibility: Plugin System for Custom Parsers
- [ ] Real-time: Webhook Integration for Real-time Updates
- [ ] Team Collaboration Features (Comments, Assignments)
- [ ] Enterprise SSO Integration
- [ ] Mobile App (React Native)
- [ ] Custom AI Model Fine-tuning

## Q1 2026: Autonomous Agents & Conversational UI 🤖

- [ ] **Agent Task Queue:** API endpoint for autonomous AI agents to submit tasks
- [ ] **Workflow Visualization:** Screen showing branching/execution paths for complex actions
- [ ] **Unified PR & Task Manager:** Central dashboard for all PRs and TASKS.md entries
- [ ] **Roadmap Simulation:** AI-powered schedule impact analysis
- [ ] **Conversational Interface Foundation:** Natural language, chat-driven interface

---

### 🎯 Long-Term Vision Summary: From Diagnosis to Action

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
