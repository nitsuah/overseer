# 🗺️ Overseer Product Roadmap

**Last Updated:** 2026-03-27 | PMO audit — live site https://ghoverseer.netlify.app (frontend loaded), 71.51% coverage (above target)

## Status Legend

- ✅ Done
- 🔄 In Progress
- 📋 Planned
- 🔭 Exploratory

---

## 2025 Q4: Foundation & UX ✅ — Complete

All shipped and validated.

- ✅ **Guided Tour System** — Interactive 16-step onboarding with spotlight, auto-advance (3s), row expansion for wizard UX
- ✅ **PR Preview Modal** — File selection, diff view (Myers LCS algorithm), inline edit/generate toggle
- ✅ **AI Template Enrichment** — Context-aware doc generation using repo metadata, Gemini 2.0 backbone
- ✅ **OAuth Error Handling** — Comprehensive error detection (5 types) with auto-redirect and user-friendly messaging
- ✅ **Repository Intelligence** — Health scoring (0-100 with component breakdown), 4-state doc tracking (Missing/Dormant/Malformed/Healthy), activity monitoring
- ✅ **Auto-Fix System** — One-click PR creation for 8 doc types + 4 best practices + 10 community standards; batch operations
- ✅ **AI Prompt Chain** — Multi-stage RAG for repo-specific best practice generation (repo type detection, context inference, failover)
- ✅ **Test Coverage** — 71.51% achieved (exceeded 70% target); 162 test cases across 16 suites; 5 E2E Playwright tests; all paths converging

---

## 2026 Q1: 🤖 Autonomous Agents & Conversational UI 🔄 — In Planning

Foundation for multi-agent orchestration.

- 📋 **Agent Task Queue API** — `/api/agent/tasks` endpoint for autonomous AI agents to submit doc generation and fix tasks; webhook signature validation
- 📋 **Workflow Visualization** — UI screen showing branching/execution paths for multi-step actions (e.g., template → edit → PR)
- 📋 **Unified PR & Task Manager** — Central dashboard for GitHub PRs + TASKS.md entries (pull both sources into single view)
- 📋 **Roadmap Simulation** — AI-powered schedule impact analysis (e.g., "if Mobile App delays 1 month, Q3 shifts how?")
- 📋 **Conversational Interface Foundation** — Natural language, chat-driven input routing to handlers (docs fix, vuln assignment, repo hygiene checks)
- 📋 **AI Doc Improvement Modal** — "Improve" buttons on existing docs (ROADMAP, TASKS, FEATURES, METRICS) with baseline → enhanced → accept/reject flow

---

## 2026 Q2: 🔐 Security Enhancements & Analytics 📋 — Planned

Security hardening + advanced metrics.

**Rate Limiting Optimization:**
- Content-hash based caching — skip unchanged files using `doc_status.content_hash`
- ETag support — GitHub ETag headers to avoid redundant fetches
- Batch delays — configurable delays between repo syncs (already implemented, `SYNC_DELAY_MS=2000`)
- Rate limit UI — status indicator with warnings (already implemented)
- Exponential backoff — retry with backoff when hitting limits (already implemented)

**Security in Health Score:**
- Add vulnerability metrics to 0-100 calculation (Dependabot count, severity levels)
- Track 6 GitHub security settings (SECURITY.md, advisories, private reporting, Dependabot, code scanning, secret scanning)

**Gemini Model Evolution:**
- Auto-detection of deprecated models (test on each request, discover alternatives if broken)
- Runtime model caching (15min TTL) for switching mid-session
- Self-healing failover across Gemini + GPT-4 + Claude

---

## 2026 Q3: 🏗️ Advanced Analytics Features 🔭 — Exploratory

Intelligence layer expansion.

- **Velocity Tracking** — PR/commit trends over time; burn-down charts
- **Technical Debt Scoring** — Dependency age, library maturity, dependency tree depth
- **Agent APIs** — AI-driven multi-step actions ("Suggest Roadmap for Q2", "Propose Code Review Assignment", "Flag Security Gaps")
- **Extensibility: Plugin System** — Custom parsers, custom metrics, custom AI providers
- **Real-time: Webhook Integration** — Real-time updates on repo events (commits, PRs, issues)
- **Team Collaboration** — Comments, assignments, approval workflows
- **Enterprise SSO** — Single sign-on (SAML, OIDC) for enterprise deployment
- **Mobile App** — React Native app for mobile repository oversight
- **Custom AI Model Fine-tuning** — Overseer-specific fine-tuned Gemini/GPT models
- **Dark/Light Mode Toggle** — UI theme preferences (localStorage persistence)

**Exploratory Metrics:**
- **Token Density Metric** — LOC per logical unit (function/method/class) with AI-assisted parsing
- **Zombie Branch Detection** — Stale branches past merge date (90+day threshold)
- **Maintenance Mode Detection** — Auto-flag repos with zero activity past threshold
- **Comment-to-Code Ratio** — Documentation density (comment lines / total lines) per file and aggregate

---

## Architecture North Star

**Philosophy:** GitHub repos (code + markdown) as source of truth. Zero manual overhead. Lightweight. Serverless.

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind 4 (frontend) | Netlify Functions + Neon Postgres (backend) | NextAuth v5 + GitHub OAuth (auth) | Octokit + Gemini + OpenAI/Anthropic (integrations)

**End State (2027+):** Conversational interface orchestrating multi-step governance workflows:

- _"Run hygiene check on payment service, fix stale docs, assign highest priority vuln to Alice"_
- _"Impact on Q3 if Mobile App delays one month?"_
- _"Generate Q2 roadmap based on velocity and debt scores"_

Overseer = **Workflow Orchestrator + Intelligence Layer for Engineering Health** (humans + AI agents)

<!--
AGENT INSTRUCTIONS:
1. Keep this roadmap up-to-date with high-level milestones.
2. Mark items as completed [x] when features are shipped.
3. Add new quarters as time progresses.
4. Evidence source: live site, METRICS.md, FEATURES.md
-->
