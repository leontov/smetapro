# Roadmap & Milestones

## Phase 0 — Discovery & Alignment (Week 0-2)
- Conduct stakeholder interviews, validate personas (contractors, cost engineers).
- Audit existing estimating workflows to capture critical pain points.
- Define success metrics (time to create estimate, accuracy of AI updates, offline adoption rate).
- Deliverables: finalized requirements brief, prioritized backlog, risk register.

## Phase 1 — Experience & Architecture Foundations (Week 3-6)
- Finalize UX information architecture and interactive prototypes in Figma.
- Establish design tokens, Storybook library, and accessibility checklist.
- Scaffold Vite + React SPA with PWA manifest, service worker skeleton, and CI pipeline.
- Implement state management scaffolding (Zustand + React Query) and IndexedDB storage adapters.
- Deliverables: clickable prototype, technical architecture document, working shell with offline caching of static assets.

## Phase 2 — Core Estimate Management (Week 7-12)
- Implement CRUD for projects and estimate items with hierarchical editing UI.
- Add versioning system with snapshot creation and diff viewer.
- Integrate export engine for PDF (serverless function stub) and shareable links.
- Implement command palette and quick actions for mobile workflows.
- Deliverables: functional offline-first estimate editor, automated tests covering core flows.

## Phase 3 — AI Agent MVP (Week 13-18)
- Integrate GenKit SDK with mock + live Gemini environments.
- Deliver agent configuration UI with template library and contextual onboarding.
- Build FlowEngine with support for prompt + tool + transform steps.
- Enable baseline agents: `MarketPriceUpdate`, `EstimateHealthCheck`.
- Deliverables: AI agents runnable from estimates, session logs visible, token usage tracked.

## Phase 4 — Sync & Collaboration (Week 19-24)
- Implement background sync engine with conflict resolution UI.
- Provide optional cloud backend (Supabase/Nest) for multi-device access.
- Introduce user accounts, roles, and shared estimates.
- Harden security: encryption at rest, secure key vault, audit logs.
- Deliverables: sync dashboard, multi-user alpha, security audit report.

## Phase 5 — Advanced Insights & Reporting (Week 25-30)
- Expand reporting suite with comparison dashboards, trending charts, cost breakdown.
- Support XLSX exports and integration hooks for accounting systems (CSV bridge).
- Enhance agent capabilities (scenario simulation, risk analysis).
- Deliverables: analytics module, extended agent library, partner integration APIs.

## Phase 6 — Stabilization & Launch Prep (Week 31-36)
- Performance tuning (bundle splitting, virtualization for large estimates).
- Comprehensive QA: unit, integration, E2E (Playwright iPhone 15), accessibility audits.
- Offline endurance testing (airplane mode cycles, data corruption scenarios).
- Prepare documentation, onboarding tutorials, marketing site.
- Deliverables: release candidate build, go-to-market kit, post-launch monitoring plan.

## Definition of Done per Phase
- **Functional completeness**: all stories accepted by product owner with demo evidence.
- **Quality gates**: 90% unit test coverage for critical modules, zero severity-1 bugs open.
- **Performance**: Lighthouse PWA score ≥ 90, Time-to-Interactive < 3s on iPhone 15.
- **Documentation**: updated runbooks, architecture diagrams, changelog entries.

## Risks & Mitigations
- **iOS PWA limitations** → design manual sync prompts, test on multiple OS versions, maintain fallback actions.
- **Gemini API quota** → implement caching, batching, and cost monitoring dashboards.
- **Data privacy** → encrypt local data, allow user-controlled purge, legal review before multi-tenant release.
- **Scope creep** → maintain prioritized backlog with quarterly roadmap review.

## Dependencies
- GenKit SDK availability and stable API keys.
- Decision on backend platform (self-hosted vs managed service).
- Supplier data access agreements.
- Internal security review schedule.

## Monitoring & Success Metrics
- Daily active projects (estimates edited per day).
- Agent adoption rate (percentage of estimates updated via AI flows).
- Sync success rate and average conflict resolution time.
- Net Promoter Score from pilot cohort.
