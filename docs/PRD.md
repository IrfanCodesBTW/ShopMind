**ShopMind**
**Product Requirements Document**

*Version 3.0 — Free-Tier AI Architecture Edition*
*Supersedes v1.0 (Hackathon MVP) and v2.0 (Enhanced Draft)*
*Scope of this revision: AI/inference architecture only. Product surface is unchanged from v1.0/v2.0.*

---

# 1. Overview

## 1.1 Product Summary

ShopMind is a multilingual, voice-first business operations assistant for shop owners — kirana stores, rural retailers, pharmacy counters, and small distributors — who currently track sales, expenses, customer credit, and stock through memory, paper notes, or informal chat messages. Users speak a natural-language business update; the system transcribes it, extracts a structured transaction (intent, item, quantity, amount, customer, payment mode), asks the user to confirm or correct it, and reflects the result on a live operations dashboard.

## 1.2 What Changed in This Version

The product scope, feature set, and user experience defined in v1.0 are **unchanged**. This revision replaces the loosely-specified "OpenAI / Groq / Gemini" stack from the earlier draft with a fully specified, dual-provider architecture built entirely on **Google Gemini** and **Groq**, designed to operate indefinitely within the free tiers of both platforms, with an optional local-model fallback for full independence from either cloud provider.

## 1.3 Users and Problem Statement (carried forward from v1.0)

- **Primary users:** kirana store owners, petty shop operators, rural retailers, pharmacy counters, small wholesale distributors.
- **Secondary users:** store assistants, family members maintaining records, field sales reps, accountants reviewing merchant data.
- **Language profile:** Telugu, Hindi, English, and code-mixed speech; low comfort typing long entries.
- **Core problems solved:** mentally-tracked or paper-based sales/expenses lead to errors and lost history; customer credit is hard to track consistently; typing is slow and intimidating for multilingual, low-literacy users; stock updates lag, causing poor reorder decisions; conventional bookkeeping apps assume structured data entry that doesn't match conversational, interrupt-driven shop workflows.

---

# 2. Goals and Non-Goals

## 2.1 Goals

- Deliver the full v1.0 MVP feature set (voice capture, intent/slot extraction, confirmation flow, ledger, customer credit, inventory updates, live dashboard, authentication, merchant profiles) on a **$0 operating budget**.
- Never let a single AI provider outage or quota exhaustion break the core loop of record → confirm → save.
- Guarantee the user always receives explicit feedback — success, correction needed, or graceful degradation — and never a silent failure or a lost transaction.
- Keep the AI layer swappable: Gemini, Groq, and (optionally) local Ollama models should implement the same internal interface so providers can be added, removed, or reordered via configuration, not code changes.
- Support a hackathon demo (10–20 users) and an early pilot (50–100 merchants, 100–500 voice transactions/day) without exceeding free-tier resources.

## 2.2 Non-Goals for This MVP

The following remain on the roadmap but are explicitly **out of scope** for this release:

- WhatsApp integration
- OCR bill scanning
- AI-generated sales insights / smart reorder suggestions
- A general-purpose AI chat assistant
- A dedicated offline sync engine
- GST and formal accounting/tax reports
- Multi-store management
- Full accounting compliance, payroll, procurement, or bank reconciliation

---

# 3. Technical Architecture

## 3.1 Design Principle: Free-Tier-Native, Not Free-Tier-Constrained

The architecture is designed from the ground up to live inside published free-tier limits rather than treating them as an afterthought. Two consequences follow directly:

1. **No task depends on a single provider.** Every AI-dependent step has a defined fallback chain that terminates in a deterministic, non-AI path (a local rules parser and, ultimately, manual entry) so the app never fully blocks on an external quota.
2. **Quota numbers are treated as configuration, not constants.** Gemini and Groq both revise free-tier RPM/TPM/RPD limits periodically (Gemini's own published limits changed materially in December 2025, and Groq's limits vary by model and are subject to change). This PRD intentionally does **not** hardcode current numbers into the design. Before each deployment, engineering must pull current limits from:
   - Gemini: `https://aistudio.google.com/rate-limit` (per-project, per-model, live)
   - Groq: `https://console.groq.com/settings/limits` (per-organization, per-model, live)

## 3.2 End-to-End Pipeline

```
Merchant speaks
      │
      ▼
Voice Recording (browser capture, <30s clips)
      │
      ▼
Groq Whisper (whisper-large-v3) — Speech-to-Text
      │
      ▼
Transcript Normalization (units, numerals, currency, entities)
      │
      ▼
Gemini 2.5 Flash — Primary Parser
(intent classification, slot extraction, JSON generation,
 language normalization/translation)
      │
      ├── Success ──────────────────────────────► JSON + confidence
      │
      └── Failure / quota exhausted
                │
                ▼
        Groq Llama 3.3 70B Versatile — Fallback Parser
                │
                ├── Success ─────────────────────► JSON + confidence
                │
                └── Failure / quota exhausted
                          │
                          ▼
                  Local Rules Parser (deterministic,
                  regex/dictionary-based, no external call)
                          │
                          ▼
                  (Optional, config-gated)
                  Local Ollama Model — Qwen 3 / DeepSeek R1 7B / Llama 3
                          │
                          ▼
                User Confirmation Screen (always shown)
                          │
                          ▼
                Business Logic Engine (idempotent writes)
                          │
                          ▼
                Supabase (Postgres, RLS, Auth, Realtime)
                          │
                          ▼
                Live Operations Dashboard
```

## 3.3 Division of Labor

| Concern | Primary | Rationale |
|---|---|---|
| Speech-to-text | **Groq** (`whisper-large-v3`) | Groq's LPU inference is materially faster than typical hosted STT, which matters for the "speak → see result" demo feel and for keeping end-to-end latency low. |
| Complex parsing (intent, slots, JSON, normalization, translation) | **Gemini** (`2.5 Flash`) | Gemini's larger context window and stronger structured-output/JSON-mode support make it the better fit for multilingual slot extraction and normalization logic. |
| Fast low-latency fallback parsing | **Groq** (`llama-3.3-70b-versatile`, with `llama-3.1-8b-instant` as a lighter/faster second option) | If Gemini is rate-limited or down, Groq's speed advantage minimizes the user-visible delay of falling back. |
| Last-resort parsing | **Local rules parser** (deterministic pattern/dictionary matching for common merchant phrases) | Requires no network call and cannot be rate-limited; covers the highest-frequency transaction patterns even when both cloud providers are unavailable. |
| Optional offline parsing | **Local Ollama models** (Qwen 3, DeepSeek R1 7B, Llama 3) | Not required for MVP; included as a documented, config-gated extension point so a fully offline mode is a configuration change, not a rewrite. |

No single AI provider is a single point of failure for any user-facing step.

## 3.4 Provider Abstraction Interface

All parsing providers (Gemini, Groq, local rules, local Ollama) implement a single internal interface, e.g.:

```typescript
interface TransactionParser {
  parse(transcript: string, context: MerchantContext): Promise<ParsedTransaction>;
}
```

Switching providers, reordering the fallback chain, or adding a new provider (cloud or local) is a configuration change (provider order + credentials), not an application code change. This directly supports the Non-Functional Requirement from v1.0 that "the architecture should allow plugging in alternate speech or LLM providers without major UI changes."

---

# 4. API Integration Specifications

## 4.1 Gemini

| Aspect | Detail |
|---|---|
| Model | Gemini 2.5 Flash |
| Role | Primary parser |
| Used for | Intent classification, slot extraction, structured JSON generation, multilingual normalization, translation |
| Interface | Gemini API via Google AI Studio key (no billing account attached, to stay on free tier — see §6) |
| Output mode | Structured/JSON output mode with a fixed schema for `{intent, item, quantity, unit, amount, customer, payment_mode, due_status, confidence}` |
| Failure conditions handled | HTTP 429 (RPM/TPM/RPD exceeded), timeout, malformed/non-schema-conforming response, safety-filter block |

**Notes for engineering:**
- Treat the Gemini free tier's data-handling terms as a design constraint, not just a legal footnote: Google's free-tier terms currently permit using free-tier API inputs/outputs to improve their models (this does not apply to paid tiers). Because ShopMind's transcripts may contain customer names, phone-adjacent identifiers, and financial data, this should be explicitly called out to the merchant in consent/onboarding copy, and is flagged as an open question in §10 regarding whether any field-level redaction is needed before sending text to Gemini's free tier.
- Do not hardcode RPM/TPM/RPD values in code comments or documentation; read them from `https://aistudio.google.com/rate-limit` at deployment time and store them in configuration (see §5).

## 4.2 Groq

| Aspect | Detail |
|---|---|
| Models | `whisper-large-v3` (STT), `llama-3.3-70b-versatile` (fallback parser), `llama-3.1-8b-instant` (fast/low-latency secondary fallback) |
| Role | Speech-to-text (primary, all requests) + fallback parsing (secondary, only on Gemini failure) |
| Interface | Groq API (OpenAI-compatible endpoint), no billing account attached |
| Failure conditions handled | HTTP 429 (RPM/TPM/RPD exceeded per model), timeout, empty/low-confidence transcript |

**Notes for engineering:**
- Groq's free tier does not use customer data for model training (unlike Gemini's free tier), which makes it the preferable path for any field the team later decides is too sensitive to send to Gemini.
- Groq's rate limits are tracked per model, per organization — using `llama-3.3-70b-versatile` and `llama-3.1-8b-instant` in the same fallback chain effectively gives two independent quota pools, not one.
- As with Gemini, do not hardcode limits; read current values from `https://console.groq.com/settings/limits`.

## 4.3 Per-Request Data Flow

1. Audio → Groq Whisper → transcript.
2. Transcript → Gemini 2.5 Flash → structured JSON + confidence.
3. If step 2 fails for any reason → Groq Llama 3.3 70B → structured JSON + confidence.
4. If step 3 fails → local rules parser → best-effort structured JSON (lower confidence, more fields flagged for manual review).
5. If local rules parser cannot classify the utterance at all (and the local Ollama fallback is not enabled) → manual entry screen, no auto-parse attempted.
6. Result always passes through the confirmation screen before any database write — never a bypass, regardless of which stage produced it.

---

# 5. Rate Limiting and Quota Management Strategy

## 5.1 Principle

Free-tier limits are enforced by the providers regardless of what the app does, so the app's job is to **stay well inside them proactively** rather than react to 429s after the fact.

## 5.2 Mechanisms

- **Per-provider, per-model token-bucket rate limiter** in the backend, configured from values pulled from each provider's live limits dashboard at deploy time (not hardcoded — see §3.1). The limiter throttles outbound calls before they leave the server, rather than relying solely on catching 429 responses.
- **Usage counters persisted per day** (aligned to each provider's reset schedule) so the app can pre-emptively route to the fallback chain once a configurable safety margin (e.g., a percentage of the last-known daily quota) is reached, rather than waiting for a hard rejection.
- **Per-model quota isolation:** since Groq tracks limits separately per model, `llama-3.3-70b-versatile` exhaustion does not need to affect `llama-3.1-8b-instant` availability, and the fallback chain should treat them as independent capacity pools.
- **Admin/observability visibility** (carried forward from v1.0 §3.8): the internal dashboard must show, per provider and per model, current usage against the last-pulled quota, count of fallback-chain activations, and count of manual-entry escalations — this is the team's early-warning system during the 50–100 merchant pilot.
- **Engineering runbook requirement:** before every deployment (and periodically during the pilot), re-check both providers' live limits pages and update the stored configuration values. This is a standing operational task, not a one-time setup step.

---

# 6. Cost Control Safeguards

The MVP and initial pilot must run at **$0 operational cost**, with no scenario in which the app can incur a charge.

- **No billing account linked** to either the Google Cloud project or the Groq organization used by the app. This is the primary technical guardrail: without a linked billing method, neither provider can silently upgrade the project to a paid tier or bill for overage.
- **No automatic tier upgrades.** The app must never programmatically attempt to attach billing or request a paid-tier increase; any such change is a deliberate, manual decision made outside the app.
- **Hard request ceilings in application config**, set conservatively below each provider's last-known daily quota, so the app throttles itself before the provider does.
- **Graceful degradation over spend.** When quotas are exhausted, the correct behavior is always to fall back down the chain (§4.3) or degrade to manual entry — never to silently switch to a paid endpoint or model as a workaround.
- **Usage alerting** at configurable thresholds (e.g., 50/75/90% of last-known daily quota) surfaced in the admin dashboard, giving the team advance warning before a demo or pilot day is disrupted.
- **Future paid-tier evaluation is explicitly deferred**: if usage outgrows the free tiers during pilot, that is a deliberate roadmap decision to be made with real usage data — not something the MVP architecture should pre-empt or auto-trigger.

---

# 7. Error Handling and Fallback Procedures

## 7.1 Principle

Silent failures are never acceptable. Every failure state must produce a visible, understandable outcome for the user, and no confirmed transaction may be lost.

## 7.2 Escalation Ladder

1. **Retry** the current provider with exponential backoff (handles transient errors and short-lived rate-limit windows).
2. **Switch provider** — move to the next link in the fallback chain (Gemini → Groq Llama 3.3 → Groq Llama 3.1 8B, as configured).
3. **Run the local rules parser** — deterministic, no external dependency, covers common phrasing even during a full cloud outage.
4. **Present the manual entry screen** — if no automated path produced an acceptable result, the user is guided to enter the transaction via structured fields instead of voice.
5. **Queue the request (optional, non-MVP-blocking)** — if network connectivity itself is the issue rather than provider quota, the raw audio/transcript may be queued for later reprocessing once connectivity or quota returns; this is a "nice to have" for the MVP and is called out as an open question in §10 regarding its priority.

## 7.3 User-Facing Messaging

Whenever the system falls back past automated parsing, the user must see a clear, non-technical message rather than a stalled UI or an unexplained blank state, for example:

> "AI services are temporarily busy. Please review and enter the transaction manually or try again shortly."

## 7.4 Data Integrity Guarantees (carried forward from v1.0 §4.2)

- No confirmed transaction may be silently dropped; the user always receives explicit success or failure feedback.
- Idempotent save logic prevents duplicate entries from retries at any stage of the fallback chain.
- Draft transactions remain recoverable if a confirmation flow is interrupted before save.

---

# 8. Security and Data Handling

## 8.1 Audio and Transcript Retention

- **Default behavior:** raw audio is processed for transcription and then deleted. It is not persisted.
- **Opt-in retention:** a merchant may explicitly enable audio retention (e.g., for dispute review); this is off by default.
- **What is stored:** transcript text, parsed JSON, confidence scores, and audit logs of corrections — never raw audio unless explicitly opted in.

## 8.2 Third-Party API Data Handling

- **Groq:** does not use free-tier API data for model training.
- **Gemini:** Google's free-tier terms currently permit using free-tier API inputs/outputs to improve their models (unlike the paid tier). Given that transcripts can include customer names and financial amounts, this should be:
  - disclosed to merchants during onboarding, and
  - tracked as an open decision (§10) on whether sensitive fields (e.g., customer name) should be minimized, tokenized, or preferentially routed through Groq before being sent to Gemini.

## 8.3 Platform Security (carried forward from v1.0/v2.0)

- HTTPS everywhere; all data in transit encrypted.
- Supabase Row-Level Security enabled; merchant data logically isolated by tenant.
- JWT-based authentication.
- Secrets (Gemini and Groq API keys) held only in server-side environment variables — never exposed client-side.
- Administrative access to logs, transcripts, and (if enabled) retained audio restricted to authorized roles only.
- No merchant data is ever shared across tenants.

---

# 9. Success Metrics

## 9.1 Product-Level (carried forward from v1.0/v2.0)

| Metric | MVP Target |
|---|---|
| Transaction completion (record → dashboard reflected) | < 10 seconds |
| Intent classification accuracy | ≥ 80% |
| Slot extraction accuracy | ≥ 70% |
| Confirmation abandonment | < 10% |
| Dashboard refresh latency | < 2 seconds |

## 9.2 Free-Tier Architecture Health (new for this version)

| Metric | Target |
|---|---|
| Requests served by primary provider (Gemini) without fallback | Tracked as a baseline, not a hard target — informs pilot capacity planning |
| Fallback-chain activation rate (Groq Llama fallback triggered) | Monitored; investigate if it trends upward within a pilot day |
| Manual-entry escalation rate (both cloud providers + local parser failed) | < 5% of daily transactions during pilot |
| Paid-tier billing incidents | 0 — hard requirement, not a target |
| Quota-exhaustion incidents with user-visible silent failure | 0 — hard requirement |

---

# 10. Open Questions

1. **Gemini free-tier data-use terms:** should the team accept Google's free-tier terms as-is (data may be used to improve models), or should sensitive fields (customer name, phone-adjacent identifiers) be minimized/tokenized before being sent to Gemini, or preferentially routed to Groq instead?
2. **Request queueing (fallback step 5):** is queuing failed requests for later reprocessing an MVP requirement, or deferred to a post-pilot iteration? The current design treats it as optional.
3. **Local rules parser scope:** what is the minimum viable phrase/intent coverage for the deterministic fallback parser before pilot launch, and who owns curating it (ties to the "curated sample merchant vocabulary" dependency from v1.0 §6.2)?
4. **Local Ollama fallback activation:** is the Ollama tier (Qwen 3 / DeepSeek R1 7B / Llama 3) enabled for the pilot, or documented-but-dormant until a specific trigger (e.g., sustained cloud outages) is defined?
5. **Quota monitoring cadence:** how often should engineering re-pull live limits from AI Studio and the Groq console during the pilot — before every deploy only, or on a recurring schedule (e.g., weekly) given both providers have changed free-tier terms before?
6. **Regional/account variance:** Gemini and Groq limits can vary by account standing and region; should the team provision a dedicated Google Cloud project and Groq organization solely for ShopMind to keep quota pools predictable and isolated from other personal/freelance projects?
7. **Whisper accuracy on Telugu/Hindi code-mixed speech:** has `whisper-large-v3` been validated specifically against the target code-mixed utterance patterns, or does this need a dedicated accuracy pass before pilot?
8. **Monitoring/alerting tooling:** does the admin dashboard (v1.0 §3.8) get built as a custom Supabase view, or is a lightweight third-party tool (e.g., a metrics dashboard) preferred for the usage-threshold alerts described in §6?
