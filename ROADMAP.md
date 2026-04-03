---
updated: 2026-04-03 (pmo/q2-2026-planning)
---

# Roadmap

## 2025 Q4 (Completed)

- [x] Ship the foundation and UX baseline.
- [x] Add PR preview, AI enrichment, repo intelligence, and auto-fix flows.
- [x] Reach and hold the test coverage target.

## 2026 Q1 (In Progress)

- [/] Deliver the Agent Task Queue API contract + validation stub for autonomous agent work.
  - Status: Partial delivery recorded 2026-03-27; auth and queue execution remain to be implemented.
  - Evidence: [docs/AGENT_TASK_QUEUE_API.md](docs/AGENT_TASK_QUEUE_API.md), [app/api/agent/tasks/route.ts](app/api/agent/tasks/route.ts)
- [ ] Add workflow visualization for multi-step execution paths.
- [ ] Add the conversational interface foundation.
- [ ] Add AI doc-improvement controls.
- [/] Keep Gemini failover and model evolution resilient.

## 2026 Q2 (Planned)

- [x] Refresh `docs/AUDIT.md` and keep the metrics evidence current.
- [ ] Track PMO planning branch status across all managed repos and surface branch/PR readiness in the dashboard.
- [ ] Add DEV-flow handoff support so PMO roadmap items can be promoted into implementation queues cleanly.
- [ ] Add security inputs to the health score.
- [ ] Expand the rate-limit, caching, and provider-reliability path where needed.

## 2026 Q3 (Exploratory)

- [ ] Add advanced analytics such as velocity and technical debt scoring.
- [ ] Expand agent APIs, plugin boundaries, and webhook-driven updates.
- [ ] Evaluate team collaboration, enterprise auth, and mobile follow-on work.
- [ ] Revisit exploratory metrics such as token density, zombie branches, maintenance mode, and comment-to-code ratio.

## Notes

- GitHub repositories and markdown remain the source of truth.
- Multi-step governance workflows are the long-term product direction.
- Detailed execution work stays in TASKS.md.
