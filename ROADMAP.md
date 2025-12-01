# 🗺️ Overseer Product Roadmap

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
