# ShopMind — Project Roadmap

## Vision Statement

**ShopMind empowers small merchants to manage their business through voice in their native language.** By combining voice-first UX with AI-powered transaction parsing, ShopMind eliminates the literacy and technology barriers that prevent millions of kirana store owners from adopting digital bookkeeping. Our goal is to become the invisible backbone of small merchant operations — capturing every sale, tracking every credit, and surfacing insights that help merchants grow.

---

## Phase 1 — MVP (Weeks 1–4)

**Goal**: Prove the core voice-to-transaction pipeline works end-to-end for a single merchant.

### Deliverables

| Feature | Description | Priority |
|---------|-------------|----------|
| Core voice recording & playback | WebM/Opus recording via MediaRecorder API, playback review before submission | P0 |
| Groq Whisper STT integration | Audio → text transcription with Telugu, Hindi, English support | P0 |
| Gemini 2.5 Flash parser integration | Transcript → structured transaction (intent + slots) with confidence scoring | P0 |
| Basic fallback chain (Groq Llama) | Automatic fallback to Groq Llama 3 when Gemini Flash fails or times out | P0 |
| Transaction confirmation flow | Show parsed result → merchant confirms/edits → save | P0 |
| Supabase schema & auth | Database schema, RLS policies, email/phone auth, merchant profiles | P0 |
| Basic dashboard | Today's transactions, daily total, recent activity list | P1 |
| Merchant profile setup | Store name, phone, language preference, business category | P1 |

### Technical Milestones

- Week 1: Project scaffolding, Supabase schema, auth flow
- Week 2: Voice recording UI, Groq Whisper integration, basic STT pipeline
- Week 3: Gemini Flash parser, fallback to Groq Llama, confirmation flow
- Week 4: Dashboard, profile setup, integration testing, bug fixes

### Exit Criteria

- [ ] Voice → transaction works in Telugu, Hindi, and English
- [ ] Fallback chain activates within 5 seconds of primary failure
- [ ] Transaction completion < 10 seconds (happy path)
- [ ] Unit test coverage ≥ 80% for core modules
- [ ] Single merchant can record and view 50+ transactions

---

## Phase 2 — Pilot Ready (Weeks 5–8)

**Goal**: Harden the system for multi-merchant use with operational controls.

### Deliverables

| Feature | Description | Priority |
|---------|-------------|----------|
| Local rules parser | Regex/rule-based parser as final fallback (no API dependency) | P0 |
| Rate limiting & quota management | Per-merchant API quotas, token bucket rate limiting, graceful degradation | P0 |
| Admin monitoring dashboard | Provider health, API usage, error rates, merchant activity | P0 |
| Credit/ledger management | Track udhar (credit) sales, customer balances, payment received flow | P1 |
| Inventory tracking | Stock-in recording, low stock alerts, item catalog | P1 |
| Usage alerting | Notify merchants approaching quota limits, admin alerts for anomalies | P1 |
| Multilingual UI | Full UI localization: Telugu, Hindi, English (RTL-ready architecture) | P1 |

### Technical Milestones

- Week 5: Local rules parser, rate limiter implementation, quota system
- Week 6: Admin dashboard, monitoring, alerting infrastructure
- Week 7: Credit/ledger system, inventory tracking
- Week 8: Multilingual UI, E2E testing, performance optimization

### Exit Criteria

- [ ] System handles 50 concurrent merchants without degradation
- [ ] Rate limiting prevents any single merchant from exceeding quotas
- [ ] Local parser handles ≥60% of common transaction patterns
- [ ] Admin can monitor all merchants and provider health in real-time
- [ ] Credit calculations are mathematically verified (100% accuracy)
- [ ] UI available in Telugu, Hindi, and English

---

## Phase 3 — Pilot Launch (Weeks 9–12)

**Goal**: Launch with 50–100 real merchants and validate product-market fit.

### Deliverables

| Feature | Description | Priority |
|---------|-------------|----------|
| 50–100 merchant pilot | Onboard real kirana merchants in target geography | P0 |
| Performance optimization | Reduce latencies, optimize bundle size, improve TTI | P0 |
| Error handling hardening | Graceful degradation at every failure point, user-friendly error messages | P0 |
| User feedback collection | In-app feedback mechanism, usage analytics, satisfaction surveys | P1 |
| Accuracy improvements | Retrain/refine prompts based on real merchant voice data | P1 |

### Technical Milestones

- Week 9: Pilot merchant onboarding, field support setup, monitoring intensified
- Week 10: Performance profiling and optimization based on real usage patterns
- Week 11: Error handling improvements, edge case fixes from pilot feedback
- Week 12: Accuracy tuning, A/B test prompt variations, pilot metrics report

### Exit Criteria

- [ ] 50+ merchants actively using the system daily
- [ ] Transaction completion < 10s for 95% of transactions
- [ ] Intent accuracy ≥ 80% on real merchant voice data
- [ ] System uptime ≥ 99.5% during pilot period
- [ ] NPS score ≥ 30 from pilot merchants
- [ ] Zero P0 bugs unresolved for > 4 hours
- [ ] Merchant retention ≥ 70% (still active after 4 weeks)

---

## Phase 4 — Post-Pilot (Weeks 13+)

**Goal**: Expand capabilities and prepare for scale.

### Deliverables

| Feature | Description | Priority |
|---------|-------------|----------|
| WhatsApp integration | Record/send voice notes via WhatsApp → process as transactions | P1 |
| OCR bill scanning | Camera capture of supplier bills → auto-create stock-in entries | P1 |
| AI-generated insights | Daily/weekly business summaries, trend detection, anomaly alerts | P2 |
| Smart reorder suggestions | Predict stock needs based on sales patterns, suggest reorders | P2 |
| Multi-store management | Merchants with multiple locations manage all from one account | P2 |
| Offline sync engine | Queue transactions locally when offline, sync when connected | P1 |

### Technical Milestones

- Weeks 13–14: WhatsApp Business API integration, offline queue architecture
- Weeks 15–16: OCR pipeline (camera → text → structured data), sync engine
- Weeks 17–18: AI insights engine, smart reorder ML model
- Weeks 19–20: Multi-store architecture, data isolation, cross-store reporting

### Exit Criteria

- [ ] WhatsApp voice notes processed with same accuracy as in-app
- [ ] OCR extracts supplier, items, and amounts with ≥ 70% accuracy
- [ ] Offline mode queues transactions and syncs without data loss
- [ ] Insights surfaced are actionable (validated by merchant feedback)
- [ ] Multi-store merchants can switch contexts seamlessly

---

## Key Milestones

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| 1 | Project kickoff | Repo setup, schema designed, auth working |
| 2 | Voice pipeline live | Recording → STT → transcript displayed |
| 3 | Parser pipeline live | Transcript → parsed transaction → confirmation UI |
| 4 | **MVP complete** | End-to-end flow working, basic dashboard |
| 6 | Operational readiness | Rate limiting, monitoring, admin dashboard |
| 8 | **Pilot ready** | Multi-merchant, multilingual, credit system |
| 9 | Pilot begins | First merchants onboarded |
| 12 | **Pilot complete** | Metrics collected, accuracy validated |
| 14 | WhatsApp beta | Voice notes from WhatsApp processed |
| 16 | Offline mode | Transactions work without connectivity |
| 20 | **Scale ready** | Full feature set for growth phase |

---

## Resource Allocation

### Team Structure

| Role | Count | Responsibility |
|------|-------|----------------|
| Full-stack Developer | 2 | Frontend (React/Next.js), API, Supabase integration |
| AI/ML Engineer | 1 | Prompt engineering, parser optimization, accuracy tuning |
| Product Designer | 1 | UX research, UI design, merchant interviews |
| QA Engineer | 1 | Test automation, AI corpus management, performance testing |
| DevOps/Platform | 0.5 | CI/CD, monitoring, infrastructure |
| Product Manager | 1 | Roadmap, merchant relationships, pilot coordination |

### Infrastructure Costs (Monthly Estimates)

| Service | Phase 1–2 | Phase 3 | Phase 4 |
|---------|-----------|---------|---------|
| Supabase (Pro) | $25 | $25 | $75+ |
| Groq API | $20 | $100 | $300+ |
| Gemini API | $30 | $150 | $500+ |
| Vercel/Hosting | $20 | $20 | $50+ |
| Monitoring (Sentry, etc.) | $0 (free tier) | $30 | $50 |
| **Total** | **~$95/mo** | **~$325/mo** | **~$975+/mo** |

---

## Risk Factors and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AI provider rate limits/outages | High | High | Multi-provider fallback chain + local parser as ultimate fallback |
| Low accuracy for Telugu/code-mixed | Medium | High | Dedicated corpus building, prompt iteration, merchant feedback loop |
| Merchant adoption resistance | Medium | High | Voice-first UX (no typing), local language, field onboarding support |
| Audio quality issues (noisy shops) | High | Medium | Noise-robust STT, retry mechanism, manual entry fallback |
| API cost escalation | Medium | Medium | Aggressive caching, local parser for simple cases, quota management |
| Supabase vendor lock-in | Low | Medium | Standard PostgreSQL schema, abstraction layer for data access |
| Regulatory/privacy concerns | Low | High | Data encryption, minimal PII collection, consent flows, RLS isolation |
| Scope creep | Medium | Medium | Strict phase gates, MVP-first mindset, feature flags for experiments |
| Single point of failure (Groq Whisper) | Medium | High | Evaluate alternative STT providers, prepare integration adapters |
| Team bandwidth | Medium | Medium | Prioritize ruthlessly, cut P2 features before extending timelines |

---

## Success Criteria Per Phase

### Phase 1 — MVP

| Criteria | Target |
|----------|--------|
| Core flow functional | Voice → transaction works in 3 languages |
| Latency | < 10s transaction completion |
| Test coverage | ≥ 80% unit test coverage |
| Stability | No crashes in 1-hour continuous use session |

### Phase 2 — Pilot Ready

| Criteria | Target |
|----------|--------|
| Multi-merchant support | 50 concurrent merchants, no cross-data leaks |
| Operational visibility | Admin can identify and resolve issues within 15 minutes |
| Fallback resilience | System functional even with 2 of 3 providers down |
| Localization | Complete UI in Telugu, Hindi, English |

### Phase 3 — Pilot Launch

| Criteria | Target |
|----------|--------|
| Active merchants | ≥ 50 daily active users |
| Accuracy (real data) | Intent ≥ 80%, Slots ≥ 70% |
| Retention | ≥ 70% after 4 weeks |
| Uptime | ≥ 99.5% |
| NPS | ≥ 30 |
| Performance | < 10s p95 transaction completion |

### Phase 4 — Post-Pilot

| Criteria | Target |
|----------|--------|
| Feature adoption | ≥ 30% merchants use WhatsApp integration |
| Offline reliability | Zero data loss during connectivity gaps |
| Insights value | ≥ 50% merchants find insights actionable |
| Unit economics | Cost per merchant per month < ₹50 |
| Growth readiness | Architecture supports 10,000+ merchants |
