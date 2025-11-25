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

## Q1 2025: Baseline Metrics & UI Polish ✨

- [x] Baseline Indicator Integration: Last Commit Date, Open PR/Issue Counts
- [x] Dashboard Polish: Stats column (Stars, Forks, Branches)
- [x] Code Coverage Visualization: Progress bars in table and detail panel
- [x] Reorganized Detail Panel: 2-column layout with card-based design
- [x] AI Summary Display: Prominent display in expandable rows
- [x] UX/Flow: Sync Status Clarity (Timestamp) and Type Column Tag Refinement
- [x] LICENSE.md Tracking: Added as tracked document type
- [x] Detail Panel 2.0: Features Section with parsed FEATURES.md
- [x] Meta-Features: Best Practices (10 checks) & Community Standards (7 checks) Detection
- [x] Basic Health Metrics: Testing framework, CI/CD, Linting, Pre-commit hooks
- [x] Compliance Checks: Gitignore, PR/Issue Templates, Environment Templates
- [x] Health Score 2.0: Comprehensive weighted calculation (Doc 30%, Testing 20%, Best Practices 20%, Community 15%, Activity 15%)
- [x] Document Health States: Missing, Dormant, Malformed, Healthy
- [x] Repo Type Selector: Added to custom repo form
- [ ] Foundation: Dark/Light Mode Toggle
- [ ] Foundation: Full E2E Tests and Pre-commit Hooks
- [ ] README Freshness: Calculate and display days since last update

## Q2 2025: Advanced Agents & Velocity Tracking 🧠
- [ ] Velocity Tracking: Average PR Merge Time (Cycle Time), Open PR/Issue Ratio, Commit Cadence
- [ ] Advanced Health Metrics Integration: Vulnerability Alerts Count, Failing CI/CD Build Ratio
- [ ] Technical Debt Scoring: Dependency Age Score and Lines of Code (LoC) Metrics
- [ ] Agent APIs: AI-driven actions like "Suggest Roadmap" and "Propose Code Review Assignment"
- [ ] Extensibility: Plugin System for Custom Parsers
- [ ] Real-time: Webhook Integration for Real-time Updates

## Q3 2025: Scale & Enterprise 🏗️

- [ ] Team Collaboration Features (Comments, Assignments)
- [ ] Enterprise SSO Integration
- [ ] Mobile App (React Native)
- [ ] Custom AI Model Fine-tuning

## Q4 2025: Autonomous Agents & Conversational UI 🤖
* [ ] **Agent Task Queue:** API endpoint for autonomous AI agents to submit tasks
* [ ] **Workflow Visualization:** Screen showing branching/execution paths for complex actions
* [ ] **Unified PR & Task Manager:** Central dashboard for all PRs and TASKS.md entries
* [ ] **Roadmap Simulation:** AI-powered schedule impact analysis
* [ ] **Conversational Interface Foundation:** Natural language, chat-driven interface

---

### 🎯 Long-Term Vision Summary: From Diagnosis to Action

The evolution of Overseer moves the tool out of the diagnostic camp and into the prescriptive and active camp.

The core efficiency is the **lightweight architecture**: by relying on **GitHub Repositories** (code, markdown docs) as the source of truth, Overseer avoids the manual overhead of traditional project trackers.

The ultimate goal is to evolve the dashboard into a **Conversational Interface** where users can delegate complex, multi-step governance tasks through natural language, such as:

* *"Overseer, run a full hygiene check on the core payment service, fix any stale documentation, and assign the highest priority vulnerability fix to Alice."*
* *"What is the impact on Q3's deadline if we delay the Mobile App feature by one month?"*

This transition establishes Overseer as the central **Workflow Orchestrator** and **Intelligence Layer** for engineering health.

<!--
AGENT INSTRUCTIONS:
1. Keep this roadmap up-to-date with high-level milestones.
2. Mark items as completed [x] when features are shipped.
3. Add new quarters as time progresses.
-->
