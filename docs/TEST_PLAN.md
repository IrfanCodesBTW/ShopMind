# ShopMind — Test Plan

## 1. Test Strategy Overview

ShopMind is a voice-first transaction management platform for small merchants. The testing strategy prioritizes **AI accuracy**, **latency**, and **reliability** given the system's dependence on external AI providers and real-time voice processing.

### Strategy Principles

- **Shift-left testing**: Unit and integration tests run on every commit
- **AI-specific validation**: Dedicated test corpus for multilingual NLU accuracy
- **Provider resilience**: Simulate failures across the entire fallback chain
- **Performance budgets**: Hard latency gates in CI/CD pipeline
- **Security by default**: RLS policy validation on every schema migration

### Scope

| In Scope | Out of Scope |
|----------|--------------|
| Voice recording & playback | Third-party provider internal bugs |
| STT transcription pipeline | Hardware-specific audio issues |
| AI parsing & intent extraction | Network infrastructure testing |
| Transaction CRUD operations | Load testing beyond 1,000 concurrent users |
| Dashboard rendering & queries | Browser versions older than 2 years |
| Auth & authorization (RLS) | Native mobile app testing (Phase 4+) |
| Fallback chain logic | WhatsApp integration (Phase 4+) |

---

## 2. Testing Levels

### 2.1 Unit Tests

**Objective**: Validate individual functions and modules in isolation.

| Component | What to Test | Examples |
|-----------|--------------|----------|
| AI Parsers | Intent extraction, slot filling, confidence scoring | `parseTransaction("biscuit 2 packet 20 rupees")` → correct intent + slots |
| Normalization Logic | Telugu/Hindi number words, unit conversions, price normalization | `"రెండు" → 2`, `"packetlu" → "packets"` |
| Rate Limiter | Token bucket algorithm, quota enforcement, reset logic | Burst requests, quota exhaustion, cooldown |
| Business Logic | Transaction validation, total calculation, credit rules | Edge cases: zero quantity, negative amounts, duplicate detection |
| Utilities | Date formatting, currency helpers, string sanitization | Locale-specific formats, XSS prevention |

**Coverage Target**: ≥85% line coverage for core business logic, ≥90% for parsers.

---

### 2.2 Integration Tests

**Objective**: Verify correct interaction between system components.

| Integration Point | What to Test |
|-------------------|--------------|
| API Endpoints | Request validation, response format, error codes, rate limit headers |
| Supabase Operations | CRUD operations, RLS enforcement, real-time subscriptions, migrations |
| Provider Fallback Chain | Groq Whisper → fallback STT, Gemini Flash → Groq Llama → local parser |
| Auth Flow | Sign-up, sign-in, token refresh, session expiry, role-based access |
| File Upload | Audio blob upload, size limits, format validation |

**Test Database**: Isolated Supabase project for integration tests with seeded data.

---

### 2.3 End-to-End Tests

**Objective**: Validate complete user journeys from voice input to dashboard state.

| Flow | Steps | Success Criteria |
|------|-------|------------------|
| Voice → Transaction | Record audio → STT → Parse → Confirm → Save | Transaction appears in dashboard within 10s |
| Transaction Editing | Select transaction → Edit fields → Save | Updated values reflected immediately |
| Dashboard Refresh | Add transaction → Navigate to dashboard | New data visible within 2s |
| Credit Management | Record credit sale → View ledger → Mark paid | Ledger balance updates correctly |
| Merchant Onboarding | Sign up → Set profile → Record first transaction | Complete flow under 3 minutes |

**Simulated Audio**: Pre-recorded `.webm` files in Telugu, Hindi, English, and code-mixed variants.

---

### 2.4 Performance Tests

**Objective**: Ensure the system meets latency and throughput targets.

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Transaction completion (voice → saved) | < 10 seconds | E2E timer from record-stop to confirmation |
| Dashboard refresh | < 2 seconds | Time from navigation to data rendered |
| STT response time | < 3 seconds | API call duration (Groq Whisper) |
| Parser response time | < 2 seconds | API call duration (Gemini Flash) |
| Fallback chain total | < 15 seconds | Full chain with primary failure |
| API response (p95) | < 500ms | Load test percentile measurement |
| Initial page load (LCP) | < 2.5 seconds | Lighthouse CI |

**Load Profiles**:
- Baseline: 50 concurrent merchants
- Peak: 200 concurrent merchants
- Stress: 500 concurrent merchants (identify breaking point)

---

### 2.5 Security Tests

**Objective**: Validate authentication, authorization, and data protection.

| Area | Tests |
|------|-------|
| Authentication | JWT validation, token expiry, refresh token rotation, brute-force protection |
| Row-Level Security (RLS) | Merchant A cannot access Merchant B's data; verify all tables have policies |
| API Key Exposure | No keys in client bundle; verify environment variable usage; scan build output |
| Input Validation | SQL injection attempts, XSS payloads, oversized inputs |
| CORS | Only allowed origins; no wildcard in production |
| Rate Limiting | API abuse prevention; per-merchant quotas enforced |
| Audio Data | Files stored with merchant-scoped paths; no public bucket access |

**Tools**: OWASP ZAP (automated scan), manual penetration testing (pre-pilot).

---

### 2.6 Accessibility Tests

**Objective**: Ensure usability for all users, including those with disabilities.

| Criteria | Standard | Test Method |
|----------|----------|-------------|
| Screen reader compatibility | WCAG 2.1 AA | VoiceOver / TalkBack manual testing |
| Touch targets | Minimum 44×44px | Automated CSS audit |
| Color contrast | ≥4.5:1 (text), ≥3:1 (large text) | axe-core / Lighthouse |
| Focus management | Visible focus ring, logical tab order | Manual keyboard navigation |
| Motion sensitivity | `prefers-reduced-motion` respected | Media query verification |
| Language support | `lang` attribute set correctly for multilingual content | HTML validator |
| Error announcements | Form errors announced to assistive tech | aria-live region testing |

---

## 3. Test Environments

| Environment | Purpose | Data | AI Providers |
|-------------|---------|------|--------------|
| **Local** | Developer testing, unit/integration tests | Seed data, mocked providers | Mocked (recorded responses) |
| **Staging** | QA, E2E tests, performance tests | Anonymized production-like data | Real providers (separate keys, lower quotas) |
| **Production** | Smoke tests, monitoring, canary checks | Real merchant data | Production keys with full quotas |

### Environment Parity

- Staging mirrors production Supabase schema via migrations
- Feature flags control rollout between environments
- AI provider configs are environment-specific (no shared keys)

---

## 4. AI/ML Specific Testing

### 4.1 Intent Classification Accuracy

**Target**: ≥80% accuracy across all supported languages.

| Intent | Example Utterances | Min Accuracy |
|--------|-------------------|--------------|
| `sale` | "biscuit 2 packet 20 rupees", "అమ్మకం పారెల్ 5 కిలో" | 85% |
| `credit_sale` | "Raju udhar me 500 ka saman", "అప్పు రాము 200" | 80% |
| `payment_received` | "Raju ne 300 diya", "రాము 500 కట్టాడు" | 80% |
| `stock_update` | "rice 50kg aaya", "బియ్యం 50 కేజీ వచ్చింది" | 75% |
| `query` | "Raju ka kitna baaki hai", "రాము ఎంత బాకీ" | 80% |

### 4.2 Slot Extraction Accuracy

**Target**: ≥70% exact-match accuracy for all slots.

| Slot | Examples | Min Accuracy |
|------|----------|--------------|
| `item_name` | "biscuit", "పారెల్", "chawal" | 75% |
| `quantity` | "2 packet", "5 కిలో", "ek dozen" | 70% |
| `amount` | "20 rupees", "500", "రెండు వందలు" | 75% |
| `customer_name` | "Raju", "రాము", "Sharma ji" | 70% |

### 4.3 Multilingual Test Corpus

Maintained in `tests/fixtures/ai-corpus/`:

```
tests/fixtures/ai-corpus/
├── telugu/           # 100+ utterances
├── hindi/            # 100+ utterances
├── english/          # 50+ utterances
├── code-mixed/       # 80+ utterances (Te+En, Hi+En, Te+Hi)
├── noisy/            # Background noise, low quality audio
└── expected/         # Ground truth labels (JSON)
```

**Corpus management**:
- Versioned in git with the project
- Updated monthly from real merchant recordings (anonymized)
- Each utterance has: audio file, transcript, expected intent, expected slots

### 4.4 Fallback Chain Verification

```
Primary Path:    Groq Whisper → Gemini 2.5 Flash → Transaction
Fallback 1:      Groq Whisper → Groq Llama → Transaction
Fallback 2:      Groq Whisper → Local Rules Parser → Transaction
STT Fallback:    (Future) Alternative STT → Parser chain
```

**Test Scenarios**:

| Scenario | Simulation Method | Expected Behavior |
|----------|-------------------|-------------------|
| Gemini Flash timeout | Mock 30s delay | Switch to Groq Llama within 5s |
| Gemini Flash 429 (rate limit) | Return 429 response | Switch to Groq Llama immediately |
| Gemini Flash 500 error | Return 500 response | Switch to Groq Llama, log error |
| Groq Llama also fails | Both providers return errors | Fall to local rules parser |
| All parsers fail | All return errors | Show "manual entry" prompt to user |
| Groq Whisper timeout | Mock 30s delay | Show retry option, log for monitoring |
| Low confidence score | Parser returns confidence < 0.5 | Request user confirmation with suggestions |

### 4.5 Provider Failure Simulation

**Implementation**: HTTP interceptor middleware in test environment.

```typescript
// Example: Chaos testing configuration
const chaosConfig = {
  'gemini-flash': { failureRate: 0.3, latencyMs: 5000 },
  'groq-llama': { failureRate: 0.1, latencyMs: 2000 },
  'groq-whisper': { failureRate: 0.05, latencyMs: 3000 },
};
```

- Run chaos tests nightly in staging
- Track fallback activation frequency
- Alert if fallback rate exceeds 20% in production

---

## 5. Test Data Management

### Strategy

| Data Type | Approach |
|-----------|----------|
| Unit test data | Inline fixtures, factory functions |
| Integration test data | Seed scripts, reset between suites |
| E2E test data | Dedicated test merchant accounts, cleanup after run |
| AI corpus | Git-versioned audio + expected output files |
| Performance test data | Generated datasets (1,000+ transactions per merchant) |

### Data Principles

- No real merchant data in test environments
- Seed scripts are idempotent (safe to re-run)
- Test isolation: each test suite gets fresh state
- Audio fixtures stored in Git LFS (large file storage)

---

## 6. Tools and Frameworks

| Purpose | Tool | Rationale |
|---------|------|-----------|
| Unit & Integration Tests | **Vitest** | Fast, ESM-native, compatible with Vite ecosystem |
| Component Tests | **Vitest + Testing Library** | DOM testing without browser overhead |
| E2E Tests | **Playwright** | Cross-browser, mobile emulation, audio API mocking |
| API Tests | **Supertest** | HTTP assertion library, integrates with Vitest |
| Performance | **Lighthouse CI** + **k6** | Client metrics + server load testing |
| Security | **OWASP ZAP** + **eslint-plugin-security** | Automated scanning + static analysis |
| Accessibility | **axe-core** + **Playwright** | Automated a11y assertions in E2E |
| AI Accuracy | **Custom evaluation harness** | Corpus-based accuracy measurement |
| Coverage | **v8 (via Vitest)** | Native V8 coverage, accurate for TypeScript |
| CI/CD | **GitHub Actions** | Automated pipeline, parallelized test jobs |
| Mocking | **MSW (Mock Service Worker)** | API mocking for provider simulation |

---

## 7. Test Schedule and Milestones

| Milestone | Timeline | Tests Required |
|-----------|----------|----------------|
| Phase 1 MVP | Weeks 1–4 | Unit tests (≥80% coverage), Integration tests for core APIs, Basic E2E for happy path |
| Phase 2 Pilot Ready | Weeks 5–8 | Full E2E suite, Performance baseline, Security audit, AI corpus (200+ utterances) |
| Phase 3 Pilot Launch | Weeks 9–12 | Load testing (200 users), Chaos testing, Accessibility audit, AI corpus (500+ utterances) |
| Phase 4 Post-Pilot | Weeks 13+ | Regression suite, Cross-platform E2E, Advanced performance profiling |

### CI/CD Integration

- **On every PR**: Unit tests, integration tests, lint, type-check
- **On merge to main**: Full E2E suite, performance budget check
- **Nightly**: AI accuracy evaluation, chaos testing, security scan
- **Weekly**: Full load test, accessibility audit

---

## 8. Acceptance Criteria

### Functional

- [ ] Voice recording produces valid audio blob (WebM/Opus)
- [ ] STT returns transcript within 3 seconds
- [ ] Parser extracts intent and slots with confidence score
- [ ] Transaction saved to Supabase with correct merchant association
- [ ] Dashboard displays transactions in real-time
- [ ] Fallback chain activates transparently on provider failure
- [ ] Credit/ledger calculations are mathematically correct
- [ ] Multilingual input processed correctly (Telugu, Hindi, English)

### Non-Functional

- [ ] Transaction completion < 10 seconds (p95)
- [ ] Dashboard refresh < 2 seconds (p95)
- [ ] System available 99.5% uptime (excluding provider outages)
- [ ] Zero critical security vulnerabilities
- [ ] WCAG 2.1 AA compliance
- [ ] Works on 4G connection (500kbps+ bandwidth)

---

## 9. Bug Severity Classification

| Severity | Definition | Response Time | Examples |
|----------|------------|---------------|----------|
| **P0 — Critical** | System unusable, data loss/corruption, security breach | Fix within 4 hours | Auth bypass, transactions lost, RLS failure |
| **P1 — High** | Major feature broken, no workaround | Fix within 24 hours | Voice recording fails, parser returns wrong intent consistently |
| **P2 — Medium** | Feature impaired, workaround exists | Fix within 1 week | Slow dashboard load, occasional fallback activation |
| **P3 — Low** | Minor issue, cosmetic, edge case | Fix in next sprint | UI alignment, rare language edge case, tooltip missing |
| **P4 — Trivial** | Enhancement, nice-to-have | Backlog | Slightly better wording, animation smoothness |

### Escalation Rules

- P0: Immediate Slack alert → on-call engineer → hotfix deploy
- P1: Daily standup discussion → assigned same day
- P2: Sprint planning → scheduled for current or next sprint
- P3/P4: Backlog grooming → prioritized against new features

---

## 10. Reporting and Metrics

### Key Metrics (Tracked Weekly)

| Metric | Target | Dashboard |
|--------|--------|-----------|
| Test pass rate | ≥98% | CI/CD pipeline |
| Code coverage (overall) | ≥80% | Vitest coverage report |
| AI intent accuracy | ≥80% | Custom evaluation dashboard |
| AI slot accuracy | ≥70% | Custom evaluation dashboard |
| E2E test reliability | ≥95% (no flaky tests) | Playwright report |
| Mean time to detect (MTTD) | < 1 hour | Monitoring alerts |
| Mean time to fix (MTTF) | < 24 hours (P1) | Issue tracker |
| Performance budget violations | 0 | Lighthouse CI |

### Reporting Cadence

- **Daily**: CI/CD results auto-posted to team channel
- **Weekly**: Test summary report (coverage trends, new failures, AI accuracy)
- **Per Sprint**: Quality metrics review, flaky test cleanup, corpus updates
- **Per Phase**: Full quality gate report before phase transition

### Flaky Test Policy

- Tests that fail intermittently are quarantined within 48 hours
- Quarantined tests must be fixed or deleted within 1 sprint
- No test may be skipped for more than 2 sprints without team review
