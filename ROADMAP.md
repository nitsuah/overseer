# 🗺️ Overseer Product Roadmap

## 2025Q4: Foundation & UX (Completed) ✅

- [x] **Guided Tour System:** Interactive 16-step onboarding with spotlight, auto-advance, row expansion
- [x] **PR Preview Modal:** File selection, diff view, inline edit/generate toggle
- [x] **AI Template Enrichment:** Context-aware doc generation with Gemini 2.0
- [x] **OAuth Error Handling:** Auto-redirect, error parsing, user-friendly messaging
- [x] **Repository Intelligence:** Modify Health scoring, doc tracking, activity monitoring
- [x] **Auto-Fix System:** One-click PR creation for docs, best practices (9 types), community standards (10 types)
- [x] **AI Prompt Chain:** Multi-stage RAG for repo-specific best practice generation
- [x] **Test Coverage:** Achieved 60%+ coverage with comprehensive unit tests

## 2026Q1: 🤖 Autonomous Agents & Conversational UI

- [ ] **Agent Task Queue:** API endpoint for autonomous AI agents to submit tasks
- [ ] **Workflow Visualization:** Screen showing branching/execution paths for complex actions
- [ ] **Unified PR & Task Manager:** Central dashboard for all PRs and TASKS.md entries
- [ ] **Roadmap Simulation:** AI-powered schedule impact analysis of planned work
- [ ] **Conversational Interface Foundation:** Natural language, chat-driven interface
- [ ] **AI Doc Improvement:** Add "Improve" buttons to existing documentation with AI-powered enhancement modal (ROADMAP, TASKS, METRICS, FEATURES, README)

## 2026Q2: 🔐 Security Enhancements

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

### 🎯 Evolution: Diagnosis → Action

**Architecture:** Lightweight. GitHub repos (code + markdown) = source of truth. Zero manual overhead.

**End State:** Conversational interface for multi-step governance:

- _"Run hygiene check on payment service, fix stale docs, assign highest priority vuln to Alice"_
- _"Impact on Q3 if Mobile App delays one month?"_

Overseer = Workflow orchestrator + intelligence layer for engineering health.

<!--
AGENT INSTRUCTIONS:
1. Keep this roadmap up-to-date with high-level milestones.
2. Mark items as completed [x] when features are shipped.
3. Add new quarters as time progresses.
-->
