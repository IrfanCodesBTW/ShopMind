# ShopMind — Implementation Plan

**Central Execution Roadmap**

| Field | Value |
|-------|-------|
| Document Version | 1.0 |
| Status | Active |
| Last Updated | 2026-07-06 |
| Owner | Engineering Lead / Product Manager |
| Related PRD Version | 3.0 (Free-Tier AI Architecture Edition) |
| Planning Horizon | 20 weeks (4 phases) |

> **Purpose**: This document is the single source of truth for *executing* ShopMind. It synthesizes and cross-references all project documentation into an actionable plan. Where the source documents describe *what* and *why*, this plan describes *when*, *in what order*, *by whom*, and *how we know it's done*.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase-Based Execution Timeline](#2-phase-based-execution-timeline)
3. [Workstream Breakdown](#3-workstream-breakdown)
4. [Cross-Document Dependency Matrix](#4-cross-document-dependency-matrix)
5. [Integration Sequencing](#5-integration-sequencing)
6. [Quality Gates and Review Checkpoints](#6-quality-gates-and-review-checkpoints)
7. [Resource Allocation and Estimation](#7-resource-allocation-and-estimation)
8. [Communication and Escalation Protocols](#8-communication-and-escalation-protocols)
9. [Appendix: Document Version Tracking](#9-appendix-document-version-tracking)

---

## Source Document Map

This plan is derived from and cross-references the following documents. Read this map first to understand where each concern is authoritatively defined.

| Document | Authoritative For | Primary Consumers in This Plan |
|----------|-------------------|-------------------------------|
| `README.md` | Project overview, environment setup, repo structure | All workstreams (onboarding) |
| `PRD.md` | Product requirements, feature scope, acceptance criteria, success metrics | Quality Gates, Phase deliverables |
| `ARCHITECTURE.md` | System design, component relationships, tech stack, deployment | Backend, DevOps, Integration Sequencing |
| `DATABASE_SCHEMA.md` | Data models, tables, RLS policies, migrations | Database workstream, Migration sequencing |
| `API_SPEC.md` | Endpoint contracts, request/response formats, error codes | API workstream, Contract-first development |
| `AI_ARCHITECTURE.md` | Parsing pipeline, provider abstraction, fallback chain, quotas | AI/ML workstream, Model deployment |
| `USER_FLOWS.md` | Frontend interactions, state transitions, error flows, personas | Frontend workstream, E2E tests |
| `DESIGN_SYSTEM.md` | UI components, colors, typography, accessibility | Frontend workstream, component build order |
| `SECURITY.md` | Threat model, controls, compliance, data handling | Security workstream, Quality Gates |
| `TEST_PLAN.md` | Test strategy, coverage thresholds, AI accuracy targets | QA workstream, Quality Gates |
| `ROADMAP.md` | Timeline, phases, milestones, resources, risks | Phase timeline, Resource allocation |

---

## 1. Executive Summary

### 1.1 Project Goals

ShopMind is a **multilingual, voice-first business operations assistant** for small merchants (kirana stores, rural retailers, pharmacy counters, distributors). Merchants speak a business update in Telugu, Hindi, English, or code-mixed speech; the system transcribes it, extracts a structured transaction, asks for confirmation, and reflects it on a live dashboard. (Source: `PRD.md` §1, `README.md`.)

The defining engineering constraint is a **$0 operating budget** on cloud AI free tiers, achieved through a resilient dual-provider (Gemini + Groq) fallback chain that terminates in a deterministic local parser and manual entry — so no single provider outage or quota exhaustion can break the core record → confirm → save loop. (Source: `PRD.md` §2.1, §3.1; `AI_ARCHITECTURE.md`.)

### 1.2 Success Criteria

These criteria gate release and are traced directly to `PRD.md` §9 and `ROADMAP.md` exit criteria:

| Success Criterion | Target | Source | Verified At |
|-------------------|--------|--------|-------------|
| Transaction completion (record → dashboard) | < 10 s | PRD §9.1 | Phase 1 exit, Phase 3 (p95) |
| Intent classification accuracy | ≥ 80% | PRD §9.1 | Phase 3 (real data) |
| Slot extraction accuracy | ≥ 70% | PRD §9.1 | Phase 3 (real data) |
| Confirmation abandonment | < 10% | PRD §9.1 | Phase 3 |
| Dashboard refresh latency | < 2 s | PRD §9.1 | Phase 1 exit |
| Manual-entry escalation rate | < 5% of daily tx | PRD §9.2 | Phase 3 |
| Paid-tier billing incidents | 0 (hard) | PRD §9.2 | All phases |
| Silent-failure incidents | 0 (hard) | PRD §9.2 | All phases |
| Unit test coverage (core modules) | ≥ 80% | ROADMAP Ph1, TEST_PLAN | Phase 1 exit |
| Merchant retention (4 weeks) | ≥ 70% | ROADMAP Ph3 | Phase 3 |
| System uptime (pilot) | ≥ 99.5% | ROADMAP Ph3 | Phase 3 |

### 1.3 How This Plan Ties Documentation Together

Each of the 11 source documents answers a different question. This plan makes their **interdependencies executable**:

- The **PRD** defines scope → mapped to phase deliverables (§2) and quality gates (§6).
- The **Architecture** and **AI Architecture** define components → sequenced for build in §5.
- The **Database Schema** and **API Spec** form the contract foundation → contract-first sequencing in §5.
- **User Flows** and **Design System** define the frontend → component build order in §3/§5.
- **Security** and **Test Plan** define non-negotiable gates → §6.
- The **Roadmap** provides the calendar → §2 and §7.

The **Cross-Document Dependency Matrix** (§4) is the heart of this plan: it makes explicit how a change in one document ripples into others, so no update is made in isolation.

---

## 2. Phase-Based Execution Timeline

Phases align 1:1 with `ROADMAP.md`. The roadmap defines 4 product phases across 20 weeks; this plan overlays six *engineering execution tracks* (Foundation, Core Platform, AI Integration, Frontend Polish, Security Hardening, Launch Preparation) that run within and across those phases.

```
Week:  1    2    3    4 | 5    6    7    8 | 9   10   11   12 | 13 ... 20
       ├─ PHASE 1: MVP ─┤├ PHASE 2: PILOT ─┤├ PHASE 3: LAUNCH ┤├ PHASE 4: SCALE
Track:
Foundation      ████
Core Platform   ████████████
AI Integration     ████████████████
Frontend Polish       ██████████████████
Security Hardening         ████████████████████
Launch Preparation                   ██████████████
```

### Phase 1 — MVP / Foundation + Core Platform (Weeks 1–4)

**Objective** (ROADMAP): Prove the core voice-to-transaction pipeline works end-to-end for a single merchant.

| Deliverable | Acceptance Criteria | Source Docs | Priority |
|-------------|--------------------|-------------|----------|
| Project scaffolding & repo setup | `README.md` setup steps reproduce a running dev env from clean clone | README, ARCHITECTURE | P0 |
| Supabase schema + RLS | All Phase-1 tables created; RLS blocks cross-tenant reads (verified test) | DATABASE_SCHEMA §RLS | P0 |
| Auth flow | Signup/login/session per `API_SPEC` /auth/*; JWT in httpOnly cookie | API_SPEC, SECURITY §Auth | P0 |
| Voice recording UI | WebM/Opus capture <30s, playback review before submit | USER_FLOWS Flow 1, ARCHITECTURE | P0 |
| Groq Whisper STT | Audio → transcript in Telugu/Hindi/English | AI_ARCHITECTURE Stage 1 | P0 |
| Gemini 2.5 Flash parser | Transcript → structured JSON + confidence per slot schema | AI_ARCHITECTURE Stage 3 | P0 |
| Groq Llama fallback | Auto-fallback within 5s of primary failure | AI_ARCHITECTURE Stage 4, PRD §7.2 | P0 |
| Confirmation flow | Parsed result shown; edit/confirm before any DB write | USER_FLOWS Flow 3, PRD §4.3 | P0 |
| Basic dashboard | Today's tx, daily total, recent activity; refresh <2s | USER_FLOWS Flow 6, PRD §9.1 | P1 |
| Merchant profile setup | Store name, phone, language, category | USER_FLOWS Flow 2 | P1 |

**Dependencies**: None upstream (first phase). Core Platform depends on Foundation (scaffolding + schema) completing in Week 1.

**Exit Criteria** (ROADMAP Phase 1): Voice→transaction in 3 languages; fallback <5s; completion <10s; unit coverage ≥80%; single merchant records 50+ tx.

**Risk Mitigations & Rollback**:
- *Whisper accuracy on code-mixed speech unknown* (PRD Open Q7) → dedicate a Week-2 accuracy spike; keep manual entry always available as rollback.
- *Gemini free-tier terms* (PRD Open Q1) → route through server proxy so field redaction can be inserted without client changes.
- **Rollback**: Feature-flag the AI pipeline; if unstable, the app degrades to manual-entry-only mode (still a functional product).

### Phase 2 — Pilot Ready / AI Integration + Frontend Polish (Weeks 5–8)

**Objective** (ROADMAP): Harden for multi-merchant use with operational controls.

| Deliverable | Acceptance Criteria | Source Docs | Priority |
|-------------|--------------------|-------------|----------|
| Local rules parser | Deterministic parser handles ≥60% common patterns, no API call | AI_ARCHITECTURE Stage 6, PRD §3.3 | P0 |
| Rate limiting & quota mgmt | Token-bucket per provider/model; throttles before 429 | AI_ARCHITECTURE §Quota, PRD §5 | P0 |
| Admin monitoring dashboard | Per-provider usage vs quota, fallback count, escalation count | PRD §5.2, §6, API_SPEC /admin/* | P0 |
| Credit/ledger management | Udhar tracking; balances mathematically verified (100%) | DATABASE_SCHEMA credit_ledger, USER_FLOWS Flow 4 | P1 |
| Inventory tracking | Stock-in, low-stock alerts, item catalog | DATABASE_SCHEMA inventory, USER_FLOWS Flow 5 | P1 |
| Usage alerting | Alerts at 50/75/90% of last-known daily quota | PRD §6 | P1 |
| Multilingual UI | Full localization Telugu/Hindi/English | DESIGN_SYSTEM, USER_FLOWS | P1 |

**Dependencies**: Requires Phase 1 pipeline + schema. Rate limiting depends on `api_usage` table (DATABASE_SCHEMA). Admin dashboard depends on usage persistence.

**Exit Criteria** (ROADMAP Phase 2): 50 concurrent merchants; rate limiting enforced; local parser ≥60%; real-time admin monitoring; credit 100% accurate; UI in 3 languages.

**Risk Mitigations & Rollback**:
- *Quota exhaustion mid-pilot* → hard request ceilings below provider limits (PRD §6); pre-emptive routing to fallback at safety margin.
- **Rollback**: Local rules parser + manual entry guarantee the loop survives full cloud outage (PRD §7.2). Credit/inventory are additive — can be feature-flagged off without breaking core tx flow.

### Phase 3 — Pilot Launch / Security Hardening + Launch Prep (Weeks 9–12)

**Objective** (ROADMAP): Launch with 50–100 real merchants and validate product-market fit.

| Deliverable | Acceptance Criteria | Source Docs | Priority |
|-------------|--------------------|-------------|----------|
| 50–100 merchant pilot onboarding | Merchants onboarded; field support in place | ROADMAP Ph3 | P0 |
| Performance optimization | p95 completion <10s; dashboard <2s | PRD §9.1, TEST_PLAN Perf | P0 |
| Error handling hardening | Every failure point shows user-friendly message; 0 silent failures | PRD §7.3, §9.2 | P0 |
| Security audit pass | All SECURITY controls verified; RLS penetration tested | SECURITY, TEST_PLAN Security | P0 |
| User feedback collection | In-app feedback + analytics | ROADMAP Ph3 | P1 |
| Accuracy improvements | Intent ≥80%, slots ≥70% on real data | PRD §9.1, AI_ARCHITECTURE §Monitoring | P1 |

**Dependencies**: Requires all Phase 2 operational controls. Security hardening depends on complete auth + RLS + API surface.

**Exit Criteria** (ROADMAP Phase 3): ≥50 DAU; p95 <10s; intent ≥80%; uptime ≥99.5%; NPS ≥30; no P0 unresolved >4h; retention ≥70%.

**Risk Mitigations & Rollback**:
- *Low real-data accuracy* → A/B prompt variations (AI_ARCHITECTURE); merchant feedback loop; manual entry safety net.
- **Rollback**: Staged rollout by cohort; ability to roll back to prior deploy on Vercel; feature flags per merchant cohort.

### Phase 4 — Post-Pilot / Scale (Weeks 13–20+)

**Objective** (ROADMAP): Expand capabilities and prepare for scale. All items here are **explicitly Non-Goals for the MVP** per `PRD.md` §2.2 and enter scope only post-pilot.

| Deliverable | Acceptance Criteria | Source Docs | Priority |
|-------------|--------------------|-------------|----------|
| WhatsApp integration | Voice notes processed at in-app accuracy | ROADMAP Ph4, PRD §2.2 | P1 |
| Offline sync engine | Zero data loss during connectivity gaps | ROADMAP Ph4, USER_FLOWS error flows | P1 |
| OCR bill scanning | Supplier/items/amounts ≥70% accuracy | ROADMAP Ph4 | P1 |
| AI-generated insights | Actionable per merchant feedback | ROADMAP Ph4 | P2 |
| Smart reorder suggestions | Predictive reorder from sales patterns | ROADMAP Ph4 | P2 |
| Multi-store management | Seamless context switch, data isolation | ROADMAP Ph4 | P2 |

**Dependencies**: Requires a validated, stable pilot (Phase 3 exit met). Offline sync depends on idempotent write guarantees (PRD §7.4).

**Rollback**: All Phase 4 features are additive behind flags; none may regress the core loop.

---

## 3. Workstream Breakdown

Priority levels: **P0** = critical path, blocks release; **P1** = high value, in-phase; **P2** = valuable, deferrable; **P3** = nice-to-have.

### 3.1 Backend Infrastructure

| Task | Priority | Skills | Assignee | Source Sections |
|------|----------|--------|----------|-----------------|
| Next.js App Router scaffolding + TypeScript config | P0 | Next.js, TS | Full-stack Dev 1 | ARCHITECTURE §Tech Stack |
| Server-side API route structure (proxy pattern) | P0 | Next.js, Node | Full-stack Dev 1 | ARCHITECTURE §Backend/API |
| Environment variable & secrets management | P0 | DevOps | DevOps | SECURITY §API keys, ARCHITECTURE |
| Fallback pipeline orchestrator (chain-of-responsibility) | P0 | TS, systems | AI/ML Eng | ARCHITECTURE §AI Pipeline, AI_ARCHITECTURE |
| Idempotent write layer (dedup on retry) | P0 | Backend | Full-stack Dev 1 | PRD §7.4, DATABASE_SCHEMA |
| Serverless deployment config (Vercel) | P1 | DevOps | DevOps | ARCHITECTURE §Deployment |

### 3.2 Database & Data Layer

| Task | Priority | Skills | Assignee | Source Sections |
|------|----------|--------|----------|-----------------|
| Create `merchants` table + auth linkage | P0 | SQL, Supabase | Full-stack Dev 2 | DATABASE_SCHEMA §merchants |
| Create `transactions` table + indexes | P0 | SQL | Full-stack Dev 2 | DATABASE_SCHEMA §transactions |
| RLS policies (all tenant-scoped tables) | P0 | SQL, security | Full-stack Dev 2 | DATABASE_SCHEMA §RLS, SECURITY |
| Create `customers` + `credit_ledger` tables | P1 | SQL | Full-stack Dev 2 | DATABASE_SCHEMA §credit_ledger |
| Create `inventory` table + low-stock logic | P1 | SQL | Full-stack Dev 2 | DATABASE_SCHEMA §inventory |
| Create `audit_logs` table | P1 | SQL | Full-stack Dev 2 | DATABASE_SCHEMA §audit_logs, SECURITY |
| Create `api_usage` table (quota tracking) | P0 | SQL | Full-stack Dev 2 | DATABASE_SCHEMA §api_usage, PRD §5 |
| Realtime subscription setup | P1 | Supabase | Full-stack Dev 2 | ARCHITECTURE §Realtime |
| Migration versioning & rollback scripts | P0 | SQL, DevOps | DevOps | §5 Migration Sequencing |

### 3.3 API Development

| Task | Priority | Skills | Assignee | Source Sections |
|------|----------|--------|----------|-----------------|
| Auth endpoints (signup/login/logout/me) | P0 | Next.js, Auth | Full-stack Dev 1 | API_SPEC §Auth |
| `POST /transactions/voice` (multipart audio) | P0 | Next.js, streams | Full-stack Dev 1 | API_SPEC §Transactions, USER_FLOWS Flow 1 |
| `POST /transactions/confirm` | P0 | Next.js | Full-stack Dev 1 | API_SPEC, PRD §4.3 |
| Transaction list/detail/update endpoints | P1 | Next.js | Full-stack Dev 1 | API_SPEC §Transactions |
| Customer + credit-history endpoints | P1 | Next.js | Full-stack Dev 1 | API_SPEC §Customers |
| Inventory endpoints (+ low-stock) | P1 | Next.js | Full-stack Dev 1 | API_SPEC §Inventory |
| Dashboard summary endpoints | P1 | Next.js | Full-stack Dev 1 | API_SPEC §Dashboard |
| Admin usage-stats & provider-health endpoints | P0 | Next.js | Full-stack Dev 1 | API_SPEC §Admin, PRD §5.2 |
| Standardized error responses & codes | P0 | Next.js | Full-stack Dev 1 | API_SPEC §Errors, PRD §7.3 |

### 3.4 AI/ML Pipeline

| Task | Priority | Skills | Assignee | Source Sections |
|------|----------|--------|----------|-----------------|
| `TransactionParser` interface definition | P0 | TS, architecture | AI/ML Eng | AI_ARCHITECTURE §Abstraction, PRD §3.4 |
| Groq Whisper STT integration | P0 | API integration | AI/ML Eng | AI_ARCHITECTURE Stage 1 |
| Transcript normalization (units/numerals/currency) | P0 | NLP | AI/ML Eng | AI_ARCHITECTURE Stage 2 |
| Gemini 2.5 Flash parser + JSON schema | P0 | Prompt eng | AI/ML Eng | AI_ARCHITECTURE Stage 3, API_SPEC |
| Groq Llama 3.3 70B fallback parser | P0 | Prompt eng | AI/ML Eng | AI_ARCHITECTURE Stage 4 |
| Groq Llama 3.1 8B secondary fallback | P1 | Prompt eng | AI/ML Eng | AI_ARCHITECTURE Stage 5 |
| Local rules parser (regex/dictionary) | P0 | NLP, regex | AI/ML Eng | AI_ARCHITECTURE Stage 6, PRD §10 Q3 |
| Confidence scoring & thresholds | P0 | ML | AI/ML Eng | AI_ARCHITECTURE §Confidence |
| Per-provider token-bucket rate limiter | P0 | Systems | AI/ML Eng | PRD §5.2, AI_ARCHITECTURE §Quota |
| Optional Ollama local fallback (config-gated) | P2 | LLM ops | AI/ML Eng | AI_ARCHITECTURE Stage 7, PRD §10 Q4 |
| Accuracy monitoring & feedback loop | P1 | ML ops | AI/ML Eng | AI_ARCHITECTURE §Monitoring |

### 3.5 Frontend Application

| Task | Priority | Skills | Assignee | Source Sections |
|------|----------|--------|----------|-----------------|
| Design system tokens (colors/type/spacing) | P0 | CSS, Tailwind | Product Designer + Dev | DESIGN_SYSTEM |
| Core component library (buttons, cards, dialogs) | P0 | React, a11y | Full-stack Dev 2 | DESIGN_SYSTEM §Components |
| Voice recording button (prominent, accessible) | P0 | React, Web Audio | Full-stack Dev 2 | DESIGN_SYSTEM, USER_FLOWS Flow 1 |
| Confirmation/correction dialog | P0 | React | Full-stack Dev 2 | USER_FLOWS Flow 3 |
| Onboarding flow | P1 | React | Full-stack Dev 2 | USER_FLOWS Flow 2 |
| Dashboard widgets | P1 | React | Full-stack Dev 2 | USER_FLOWS Flow 6 |
| Credit management screens | P1 | React | Full-stack Dev 2 | USER_FLOWS Flow 4 |
| Inventory screens | P1 | React | Full-stack Dev 2 | USER_FLOWS Flow 5 |
| Manual entry fallback form | P0 | React, a11y | Full-stack Dev 2 | USER_FLOWS Flow 7, PRD §7.2 |
| i18n / multilingual support | P1 | i18n | Full-stack Dev 2 | DESIGN_SYSTEM, ROADMAP Ph2 |
| Error/degradation UI states | P0 | React | Full-stack Dev 2 | USER_FLOWS error flows, PRD §7.3 |
| Accessibility (WCAG 2.1 AA, 48px targets) | P0 | a11y | Full-stack Dev 2 | DESIGN_SYSTEM §Accessibility |

### 3.6 Security & Compliance

| Task | Priority | Skills | Assignee | Source Sections |
|------|----------|--------|----------|-----------------|
| RLS policy design & verification | P0 | Security, SQL | Full-stack Dev 2 | SECURITY §Authz, DATABASE_SCHEMA |
| JWT auth hardening (httpOnly cookies) | P0 | Security | Full-stack Dev 1 | SECURITY §Auth, ARCHITECTURE |
| Server-side secrets isolation | P0 | Security | DevOps | SECURITY §Third-party API |
| Audio retention policy (delete-by-default) | P0 | Compliance | AI/ML Eng | SECURITY §8.1, PRD §8.1 |
| PII minimization / Gemini redaction eval | P0 | Compliance | AI/ML Eng | SECURITY §8.2, PRD §10 Q1 |
| Consent/onboarding disclosure copy | P0 | Product | PM + Designer | PRD §4.1 Notes, SECURITY §8.2 |
| Prompt injection defenses | P1 | Security | AI/ML Eng | SECURITY §Threat model |
| Threat model review & pentest | P0 | Security | External/QA | SECURITY, TEST_PLAN Security |

### 3.7 Quality Assurance

| Task | Priority | Skills | Assignee | Source Sections |
|------|----------|--------|----------|-----------------|
| Unit test harness (Vitest) | P0 | Testing | QA Eng | TEST_PLAN §Unit |
| Parser unit tests (all providers) | P0 | Testing | QA Eng | TEST_PLAN, AI_ARCHITECTURE |
| API integration tests (Supertest) | P0 | Testing | QA Eng | TEST_PLAN §Integration, API_SPEC |
| Fallback chain simulation tests | P0 | Testing | QA Eng | TEST_PLAN, PRD §7.2 |
| E2E tests (Playwright) | P1 | Testing | QA Eng | TEST_PLAN §E2E, USER_FLOWS |
| Multilingual AI accuracy corpus | P0 | ML testing | QA Eng | TEST_PLAN §AI, PRD §9 |
| Performance/latency tests (k6) | P1 | Perf | QA Eng | TEST_PLAN §Perf, PRD §9.1 |
| Accessibility tests (axe-core) | P1 | a11y | QA Eng | TEST_PLAN, DESIGN_SYSTEM |
| Security tests (RLS, key exposure) | P0 | Security testing | QA Eng | TEST_PLAN §Security, SECURITY |

### 3.8 DevOps & Deployment

| Task | Priority | Skills | Assignee | Source Sections |
|------|----------|--------|----------|-----------------|
| CI pipeline (lint, test, typecheck) | P0 | CI/CD | DevOps | TEST_PLAN, README |
| Vercel deployment + preview envs | P0 | DevOps | DevOps | ARCHITECTURE §Deployment |
| Supabase env provisioning (dev/staging/prod) | P0 | DevOps | DevOps | ARCHITECTURE §Environment |
| Migration automation in CD | P0 | DevOps, SQL | DevOps | §5 Migration Sequencing |
| Monitoring & alerting (Sentry, dashboards) | P1 | Observability | DevOps | PRD §5.2, §6 |
| Quota re-pull runbook automation | P1 | DevOps | DevOps | PRD §3.1, §5.2 |
| Rollback procedures per environment | P0 | DevOps | DevOps | §2 rollback notes |

---

## 4. Cross-Document Dependency Matrix

This matrix makes explicit how a change originating in one document forces coordinated updates in others. **Rule: no source document is edited in isolation — trace the row before merging.**

| If this changes… | …then update these | Impact & Rationale |
|------------------|-------------------|--------------------|
| `DATABASE_SCHEMA.md` (table/column) | `API_SPEC.md`, AI slot schema in `AI_ARCHITECTURE.md`, `TEST_PLAN.md`, migration scripts | Column changes alter API request/response contracts, the parser's output JSON schema, and test fixtures. Requires a migration. |
| `API_SPEC.md` (endpoint/contract) | Frontend calls (`USER_FLOWS.md`), `TEST_PLAN.md` (integration), `ARCHITECTURE.md` if new component | Contract changes break clients and integration tests; frontend state transitions may change. |
| `AI_ARCHITECTURE.md` (parser/slot schema/prompt) | `API_SPEC.md` (response shape), `USER_FLOWS.md` (confirmation fields), `TEST_PLAN.md` (accuracy corpus), `DATABASE_SCHEMA.md` (`transactions` fields, `confidence_score`) | New slots or intents propagate to stored data, API responses, confirmation UI, and accuracy tests. |
| `AI_ARCHITECTURE.md` (fallback chain order) | `PRD.md` §7.2 ladder, `ARCHITECTURE.md` diagram, `TEST_PLAN.md` (fallback sim), rate-limiter config | Reordering providers changes escalation ladder, quota isolation, and simulation tests. |
| `USER_FLOWS.md` (flow/state) | `DESIGN_SYSTEM.md` (components), `API_SPEC.md` (data needed), `TEST_PLAN.md` (E2E) | New states need components and possibly new endpoints; E2E paths change. |
| `DESIGN_SYSTEM.md` (tokens/components) | Frontend components, `USER_FLOWS.md` (visuals), accessibility tests in `TEST_PLAN.md` | Token/component changes cascade to every screen and a11y assertions. |
| `SECURITY.md` (control/policy) | `DATABASE_SCHEMA.md` (RLS), `API_SPEC.md` (auth), `AI_ARCHITECTURE.md` (PII routing), `TEST_PLAN.md` (security tests) | Policy changes (e.g., redaction, retention) alter data flow, RLS, and required tests. Gates release. |
| `PRD.md` (scope/requirement) | ROADMAP phase, all downstream design docs, this plan §2/§3 | Scope change re-plans phases, deliverables, and acceptance criteria. |
| `ROADMAP.md` (timeline/milestone) | This plan §2 dates, §7 resourcing | Date shifts re-baseline the execution timeline and resource allocation. |
| Rate/quota limits (Gemini/Groq live pages) | Rate-limiter config, `PRD.md` §5 references, monitoring thresholds | Per PRD §3.1 limits are config, not constants — re-pull before each deploy; update thresholds and `api_usage` alerting. |
| `README.md` (setup/structure) | Onboarding for all workstreams, CI config | Setup drift breaks new-contributor onboarding and CI reproducibility. |

### 4.1 Change-Propagation Checklist (attach to every doc-change PR)

```markdown
- [ ] Identified originating document and section
- [ ] Traced dependency matrix row(s) above
- [ ] Updated all downstream documents
- [ ] Updated migration scripts (if schema)
- [ ] Updated tests (unit/integration/E2E/accuracy)
- [ ] Bumped versions in §9 Document Version Tracking
- [ ] Flagged any SECURITY / PRD acceptance impact to relevant gate owner
```

---

## 5. Integration Sequencing

Components must be built and integrated in dependency order. The guiding principle is **contract-first**: define interfaces (DB schema, API spec, parser interface) before implementations, so workstreams can proceed in parallel against stable contracts.

### 5.1 Overall Build Order

```
1. Contracts        → DB schema + API spec + TransactionParser interface  (Week 1)
2. Data Layer       → Migrations, RLS, seed data                          (Week 1)
3. Auth             → Auth endpoints + session + RLS integration          (Week 1–2)
4. STT + Pipeline   → Whisper → normalization → Gemini → fallbacks        (Week 2–3)
5. API Surface      → Voice/confirm/list endpoints against contract       (Week 2–3)
6. Frontend Core    → Design tokens → components → flows                  (Week 2–4)
7. Dashboard + RT   → Realtime subscriptions + dashboard                  (Week 4)
8. Ops Controls     → Rate limiting, quota, admin dashboard               (Week 5–6)
9. Domain Features  → Credit/ledger, inventory                            (Week 7)
10. Hardening       → Security audit, perf, error handling                (Week 9–11)
```

### 5.2 Contract-First Development (from `API_SPEC.md`)

1. Freeze `API_SPEC.md` endpoint contracts for Phase-1 endpoints **before** implementation begins.
2. Generate/agree on TypeScript request/response types from the spec — shared between frontend and API.
3. Frontend develops against **mocked** endpoints (MSW) matching the spec while the backend implements them in parallel.
4. Integration tests (Supertest) assert conformance to the spec's contracts and error codes.
5. Any contract change follows the §4 matrix (API_SPEC → frontend + tests).

### 5.3 Database Migration Sequencing (from `DATABASE_SCHEMA.md`)

Migrations must run in FK-dependency order. Each migration is versioned and reversible.

```
M001  merchants                 (root tenant table; no FK deps)
M002  merchants RLS policies
M003  customers                 (FK → merchants)
M004  inventory                 (FK → merchants)
M005  transactions              (FK → merchants; optional FK → customers)
M006  credit_ledger             (FK → merchants, customers, transactions)
M007  audit_logs                (FK → merchants)
M008  api_usage                 (admin-scoped)
M009  indexes (all tables)
M010  RLS policies (remaining tables)
```

- **Rule**: never deploy application code that reads a table before its migration is applied.
- **Rollback**: each migration Mxxx ships with a paired `down` script; CD verifies down-migrations in staging.

### 5.4 AI Model Training & Deployment Pipeline (from `AI_ARCHITECTURE.md`)

ShopMind uses hosted/prompted models (no custom training in MVP); "deployment" = prompt + integration + validation stages.

```
Stage A  Define slot schema + intent taxonomy (contract)
Stage B  Integrate Groq Whisper (STT) — validate on code-mixed corpus (PRD Q7)
Stage C  Author + version Gemini extraction prompt; JSON-mode schema lock
Stage D  Author Groq Llama fallback prompt (same schema)
Stage E  Build local rules parser to schema (curated vocabulary — PRD Q3)
Stage F  Wire fallback chain via TransactionParser interface
Stage G  Calibrate confidence thresholds against accuracy corpus
Stage H  (Optional) Config-gate Ollama tier (PRD Q4)
Stage I  Deploy behind rate limiter; monitor accuracy + fallback rate
```

- Prompt versions are tracked artifacts; a prompt change triggers a re-run of the accuracy corpus (§4 → TEST_PLAN).

### 5.5 Frontend Component Implementation Order (from `DESIGN_SYSTEM.md` + `USER_FLOWS.md`)

```
1. Design tokens          (colors, typography, spacing) — foundation
2. Primitives             (Button, Input, Card, Dialog, Toast)
3. Voice Recording Button (Flow 1 entry point — highest priority component)
4. Confirmation Dialog    (Flow 3 — gates every DB write)
5. Manual Entry Form      (Flow 7 — fallback safety net)
6. Onboarding screens     (Flow 2)
7. Dashboard widgets      (Flow 6)
8. Credit screens         (Flow 4)
9. Inventory screens      (Flow 5)
10. Error/degradation states (all error flows)
11. i18n wrapping         (applied across all above)
```

Components 3–5 are on the critical path because they realize the core record → confirm → save loop.

---

## 6. Quality Gates and Review Checkpoints

Gates are **mandatory**. A phase cannot exit until its gate passes. Each gate has an owner and cites the source of truth.

### Gate G1 — MVP Exit (end of Phase 1)

| Check | Threshold | Source | Owner |
|-------|-----------|--------|-------|
| Core loop functional in 3 languages | Pass/Fail | PRD §1, ROADMAP Ph1 | Eng Lead |
| Transaction completion (happy path) | < 10 s | PRD §9.1 | QA |
| Dashboard refresh | < 2 s | PRD §9.1 | QA |
| Fallback activation | < 5 s | ROADMAP Ph1 | QA |
| Unit test coverage (core) | ≥ 80% | TEST_PLAN, ROADMAP | QA |
| RLS cross-tenant isolation | 0 leaks | SECURITY, TEST_PLAN | Security |
| No paid-tier billing linkage | Verified 0 | PRD §6 | DevOps |

### Gate G2 — Pilot Ready (end of Phase 2)

| Check | Threshold | Source | Owner |
|-------|-----------|--------|-------|
| Concurrent merchants | 50, no degradation | ROADMAP Ph2 | QA |
| Rate limiting enforced | No quota breach | PRD §5 | AI/ML Eng |
| Local parser coverage | ≥ 60% common patterns | ROADMAP Ph2 | AI/ML Eng |
| Credit calculations | 100% accurate | ROADMAP Ph2 | QA |
| Fallback resilience (2/3 providers down) | System functional | ROADMAP Ph2, PRD §7 | QA |
| Admin monitoring live | Real-time per-provider | PRD §5.2 | Eng Lead |
| Localization | Telugu/Hindi/English complete | DESIGN_SYSTEM, ROADMAP | Designer |

### Gate G3 — Pilot Launch Readiness (Phase 3 entry) & Exit

**Entry (security & readiness):**

| Check | Threshold | Source | Owner |
|-------|-----------|--------|-------|
| Security audit / pentest | No high/critical open | SECURITY, TEST_PLAN | Security |
| Threat model reviewed | Signed off | SECURITY | Security |
| Consent/disclosure copy live | Present in onboarding | PRD §8.2, SECURITY | PM |
| Error handling (all failure points) | 0 silent failures | PRD §7.3, §9.2 | QA |

**Exit (product-market validation):**

| Check | Threshold | Source | Owner |
|-------|-----------|--------|-------|
| Daily active merchants | ≥ 50 | ROADMAP Ph3 | PM |
| Intent accuracy (real data) | ≥ 80% | PRD §9.1 | AI/ML Eng |
| Slot accuracy (real data) | ≥ 70% | PRD §9.1 | AI/ML Eng |
| p95 completion | < 10 s | PRD §9.1 | QA |
| Uptime | ≥ 99.5% | ROADMAP Ph3 | DevOps |
| Manual-entry escalation | < 5% | PRD §9.2 | AI/ML Eng |
| Retention (4 wk) / NPS | ≥ 70% / ≥ 30 | ROADMAP Ph3 | PM |

### Gate G4 — Scale Readiness (Phase 4)

| Check | Threshold | Source | Owner |
|-------|-----------|--------|-------|
| New features behind flags | No core regression | This plan §2 | Eng Lead |
| Offline sync data loss | Zero | ROADMAP Ph4, PRD §7.4 | QA |
| Architecture supports 10k+ merchants | Validated | ROADMAP Ph4 | Eng Lead |

### 6.1 Continuous (Every PR) Gate

```markdown
- [ ] Lint + typecheck pass
- [ ] Affected unit/integration tests pass
- [ ] No secrets committed (SECURITY §Third-party API)
- [ ] §4 change-propagation checklist completed if any .md changed
- [ ] Accessibility check on any UI change (DESIGN_SYSTEM)
```

---

## 7. Resource Allocation and Estimation

### 7.1 Team (from `ROADMAP.md`)

| Role | Count | Primary Workstreams |
|------|-------|--------------------|
| Full-stack Developer | 2 | Backend, API, Database, Frontend |
| AI/ML Engineer | 1 | AI/ML Pipeline, quota, accuracy |
| Product Designer | 1 | Design System, UX, merchant research |
| QA Engineer | 1 | Quality Assurance, accuracy corpus |
| DevOps/Platform | 0.5 | DevOps & Deployment, monitoring |
| Product Manager | 1 | Roadmap, pilot, escalations |

### 7.2 Effort Estimates (story points; 1 SP ≈ 0.5 person-day)

Estimates include a **20% contingency buffer** on P0 items and **15%** on P1.

| Workstream | Phase 1 | Phase 2 | Phase 3 | Total SP |
|------------|---------|---------|---------|----------|
| Backend Infrastructure | 21 | 8 | 5 | 34 |
| Database & Data Layer | 13 | 8 | 3 | 24 |
| API Development | 21 | 8 | 5 | 34 |
| AI/ML Pipeline | 26 | 18 | 13 | 57 |
| Frontend Application | 21 | 21 | 8 | 50 |
| Security & Compliance | 8 | 8 | 21 | 37 |
| Quality Assurance | 13 | 13 | 18 | 44 |
| DevOps & Deployment | 8 | 8 | 5 | 21 |
| **Phase Totals** | **131** | **92** | **78** | **301** |

> Estimates are planning approximations for capacity balancing, not commitments. Re-baseline at each phase gate with actual velocity.

### 7.3 Resource Constraints

- **AI/ML Engineer is a single resource** across a 57-SP workstream — the highest concentration risk. Front-load interface/prompt work so full-stack devs can integrate against stable contracts.
- **DevOps at 0.5 FTE** — automate early (CI, migrations, quota re-pull) to avoid becoming a bottleneck during pilot.
- **AI API rate limits** are the primary runtime bottleneck (ARCHITECTURE §Scalability) — mitigated by quota management and local parser.

### 7.4 Parallelization Opportunities

| Parallel Track A | Parallel Track B | Enabled By |
|------------------|------------------|------------|
| Frontend against mocked API (MSW) | Backend implementing API | Contract-first (§5.2) |
| AI pipeline development | Database + RLS build | Independent until integration |
| Design tokens + components | Auth + schema | No shared dependency |
| Accuracy corpus building (QA) | Parser implementation (AI/ML) | Corpus is spec-driven |

---

## 8. Communication and Escalation Protocols

### 8.1 Cadence

| Ceremony | Frequency | Participants | Purpose |
|----------|-----------|--------------|---------|
| Daily standup | Daily | All engineers | Blockers, progress |
| Phase gate review | End of each phase | Full team + stakeholders | Gate sign-off (§6) |
| Doc-change review | On demand | Doc owner + affected leads | Approve cross-doc updates (§4) |
| Quota/limits re-pull | Before each deploy + weekly | DevOps + AI/ML | PRD §3.1/§5.2 standing task |
| Pilot ops sync | Daily (Phase 3) | Eng Lead, QA, PM | Incident triage |

### 8.2 Blocker & Escalation Path

```
IC hits blocker
   → raise in standup / team channel (same day)
      → unresolved 24h → Engineering Lead
         → cross-team or scope impact → Product Manager
            → budget/vendor/timeline risk → Stakeholders
```

- **P0 bug SLA (pilot)**: no P0 unresolved > 4 hours (ROADMAP Ph3). Page on-call immediately.
- **Billing incident** (any paid-tier charge risk): immediate stop-ship, escalate to PM + DevOps — this is a hard-zero requirement (PRD §9.2).

### 8.3 Scope Change Protocol

1. Proposed change logged against `PRD.md` with rationale.
2. PM assesses phase/roadmap impact; Eng Lead assesses effort (§7).
3. If accepted: update `PRD.md` → propagate via §4 matrix → re-baseline §2/§7 → bump versions in §9.
4. Scope creep is a named risk (ROADMAP): default is to **cut P2 before extending timeline**.

### 8.4 Version Control for Documentation

- All `.md` docs live in `docs/` under Git; changes via PR only.
- PR touching any `.md` **must** complete the §4.1 change-propagation checklist.
- Doc PRs require review from the affected document owner(s).
- On merge, update the §9 version table (version bump + review date + clear pending flags).
- Semantic versioning for docs: **MAJOR** = scope/contract change, **MINOR** = additive section, **PATCH** = wording/fix.

---

## 9. Appendix: Document Version Tracking

Living table. Update on every merged change to a source document. "Pending Update" flags known downstream work triggered by a recent change (per §4).

| Document | Version | Last Reviewed | Owner | Pending Update |
|----------|---------|---------------|-------|----------------|
| `README.md` | 1.0 | 2026-07-06 | Eng Lead | — |
| `PRD.md` | 3.0 | 2026-07-06 | Product Manager | Resolve Open Questions §10 (Q1 redaction, Q3 parser scope) before Phase 2 |
| `ARCHITECTURE.md` | 1.0 | 2026-07-06 | Eng Lead | — |
| `DATABASE_SCHEMA.md` | 1.0 | 2026-07-06 | Full-stack Dev 2 | Confirm `api_usage` fields cover all quota metrics (PRD §5) |
| `API_SPEC.md` | 1.0 | 2026-07-06 | Full-stack Dev 1 | Freeze Phase-1 contracts before Week 2 |
| `AI_ARCHITECTURE.md` | 1.0 | 2026-07-06 | AI/ML Engineer | Validate Whisper on code-mixed corpus (PRD Q7); confirm slot schema lock |
| `USER_FLOWS.md` | 1.0 | 2026-07-06 | Product Designer | Align error flows with final PRD §7 messaging |
| `DESIGN_SYSTEM.md` | 1.0 | 2026-07-06 | Product Designer | — |
| `SECURITY.md` | 1.0 | 2026-07-06 | Security Owner | Decide Gemini PII redaction/routing (PRD Q1) before Phase 3 gate |
| `TEST_PLAN.md` | 1.0 | 2026-07-06 | QA Engineer | Build multilingual accuracy corpus (ties AI_ARCHITECTURE) |
| `ROADMAP.md` | 1.0 | 2026-07-06 | Product Manager | Re-baseline dates at each phase gate |
| `IMPLEMENTATION_PLAN.md` | 1.0 | 2026-07-06 | Eng Lead + PM | Re-baseline estimates (§7) after Phase 1 velocity known |

### 9.1 Open Questions Tracking (from `PRD.md` §10)

These open questions block specific gates and must be resolved on schedule:

| # | Question | Blocks | Target Resolution |
|---|----------|--------|-------------------|
| Q1 | Gemini free-tier data-use / PII redaction | G3 (Security) | Before Phase 3 |
| Q2 | Request queueing (fallback step 5) | — (optional) | Post-pilot decision |
| Q3 | Local rules parser minimum coverage | G2 | Before Phase 2 |
| Q4 | Ollama fallback activation | — (config-gated) | Documented, dormant |
| Q5 | Quota monitoring cadence | Ops runbook | Before Phase 1 deploy |
| Q6 | Dedicated GCP project / Groq org | Quota isolation | Before Phase 1 deploy |
| Q7 | Whisper accuracy on Telugu/code-mixed | G1 | Phase 1 Week 2 spike |
| Q8 | Admin dashboard build vs 3rd-party | G2 | Before Phase 2 |

---

*End of Implementation Plan. This document is living — maintain it alongside the source documents it references.*
