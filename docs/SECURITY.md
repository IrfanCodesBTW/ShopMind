# ShopMind Security Documentation

## Security Overview

ShopMind handles sensitive financial data and voice recordings for small business owners. Security is foundational, not an afterthought. Our security posture follows these principles:

### Core Principles

1. **Defense in Depth** — Multiple layers of security controls at every tier
2. **Least Privilege** — Users and services have minimum permissions required
3. **Zero Trust** — Verify every request regardless of origin
4. **Data Minimization** — Collect and retain only what is necessary
5. **Transparency** — Users understand what data is collected and how it's used

---

## Authentication & Authorization

### Supabase Auth with JWT

ShopMind uses Supabase Authentication as the identity provider.

**Authentication Flow:**
1. User signs up/in via phone number (OTP) or email
2. Supabase issues a signed JWT access token
3. Token is stored securely on client (httpOnly cookie or secure storage)
4. All API requests include the JWT in the Authorization header
5. Backend validates token signature and expiry on every request

**Token Configuration:**
- Access token expiry: 1 hour
- Refresh token expiry: 7 days
- Token refresh: Automatic via Supabase client SDK

### Row-Level Security (RLS) Policies

All database tables enforce RLS. No data is accessible without a valid policy match.

```sql
-- Example: Users can only read their own transactions
CREATE POLICY "Users read own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

-- Example: Users can only insert their own data
CREATE POLICY "Users insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Example: Users can only update their own records
CREATE POLICY "Users update own transactions"
ON transactions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Example: Users can only delete their own records
CREATE POLICY "Users delete own transactions"
ON transactions FOR DELETE
USING (auth.uid() = user_id);
```

**RLS Rules:**
- Every table has RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- Default deny — no access without explicit policy
- Policies reference `auth.uid()` for user scoping
- Service role key is never exposed to clients

### Role-Based Access

| Role | Permissions |
|------|-------------|
| `user` | CRUD own transactions, view own dashboard, manage own profile |
| `admin` | System monitoring, user support (no access to user financial data) |
| `service_role` | Backend operations only — never exposed to clients |

---

## Data Protection

### Encryption in Transit

- **HTTPS/TLS 1.3** enforced on all endpoints
- HSTS headers enabled with `max-age=31536000`
- API endpoints reject non-HTTPS requests
- WebSocket connections use WSS protocol

### Encryption at Rest

- **Supabase managed encryption** — AES-256 for database storage
- File storage (if used) encrypted at rest via Supabase Storage
- Backups are encrypted

### Audio Data Handling

Audio recordings are the most sensitive data in ShopMind.

**Default Policy: Process and Delete**

```
[User speaks] → [Audio captured] → [Sent to STT API] → [Text extracted] → [Audio DELETED]
```

- Audio is held in memory or temporary storage only during processing
- Once transcription is complete, audio is immediately deleted
- No audio is stored permanently unless the user explicitly opts in
- Transcription text is stored — audio is not

**Controls:**
- Audio never leaves the processing pipeline
- Temporary audio files are overwritten (not just unlinked)
- No audio is sent to analytics or logging systems
- Users can request deletion of all derived text data

### PII Handling and Minimization

| Data Type | Collected | Stored | Purpose |
|-----------|-----------|--------|---------|
| Phone number | Yes | Yes | Authentication |
| Name | Yes | Yes | Display, customer records |
| Email | Optional | If provided | Recovery, notifications |
| Voice audio | Yes | **No** (transient) | Speech-to-text only |
| Transaction text | Yes | Yes | Core functionality |
| Location | No | No | Not required |
| Device ID | No | No | Not required |

**Principles:**
- No data collected without clear purpose
- PII is never logged in application logs
- Customer/supplier names stored are user-provided business contacts (not end-users of ShopMind)

---

## Third-Party API Security

### API Key Management

- **All API keys stored in server-side environment variables only**
- Never bundled in client code, mobile app packages, or git repositories
- Keys are accessed via server-side Edge Functions or API routes
- `.env` files are in `.gitignore`

```
# Environment variable pattern
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...        # Public — safe for client
SUPABASE_SERVICE_ROLE_KEY=eyJ... # PRIVATE — server only
GROQ_API_KEY=gsk_...             # PRIVATE — server only
GEMINI_API_KEY=AI...             # PRIVATE — server only
```

### Gemini Free-Tier Data Usage Disclosure

> ⚠️ **Important Disclosure**
>
> Google's Gemini API free tier may use input/output data for model improvement. ShopMind discloses this to users:
> - Free-tier users are informed that text data (not audio) may be processed by Google
> - No financial amounts or customer names are sent in identifiable form where possible
> - Users on paid plans use the paid API tier which does **not** use data for training

**Mitigation:**
- Strip or anonymize PII before sending to Gemini where feasible
- Use Gemini only for intent classification and entity extraction
- Raw financial data is not sent to Gemini — only structured prompts

### Groq Data Handling

- Groq's API does **not** train on user data
- Groq processes audio for speech-to-text and discards it
- No data retention by Groq beyond the request lifecycle
- Groq's privacy policy reviewed and documented

---

## Threat Model

### 1. Injection Attacks

#### SQL Injection
- **Mitigation**: Supabase client uses parameterized queries exclusively
- **Mitigation**: RLS acts as second layer even if injection succeeds
- **Mitigation**: Input validation on all user-provided fields
- **Testing**: Automated SQL injection tests in CI pipeline

#### Prompt Injection
- **Mitigation**: User voice transcriptions are never directly concatenated into system prompts
- **Mitigation**: Structured prompt templates with clear delimiters
- **Mitigation**: Output validation — LLM responses are parsed and validated against expected schema
- **Mitigation**: Rate limiting on LLM API calls

### 2. Unauthorized Access
- **Mitigation**: JWT validation on every request
- **Mitigation**: RLS policies ensure data isolation
- **Mitigation**: Session invalidation on suspicious activity
- **Mitigation**: Account lockout after 5 failed OTP attempts
- **Mitigation**: No direct database access — all queries through Supabase client

### 3. Data Leakage
- **Mitigation**: No sensitive data in application logs
- **Mitigation**: Error messages are generic to users, detailed only in server logs
- **Mitigation**: No financial data in URLs or query parameters
- **Mitigation**: Response headers prevent caching of sensitive data
- **Mitigation**: Audio files never written to persistent storage

### 4. Rate Limit Abuse
- **Mitigation**: Rate limiting on all API endpoints
  - Auth endpoints: 5 requests/minute
  - Voice processing: 20 requests/minute
  - Data queries: 100 requests/minute
- **Mitigation**: Per-user rate limits (not just per-IP)
- **Mitigation**: Exponential backoff on failed requests
- **Mitigation**: CAPTCHA on sign-up after threshold

### 5. Session Hijacking
- **Mitigation**: Short-lived access tokens (1 hour)
- **Mitigation**: Refresh token rotation — used token is invalidated
- **Mitigation**: Secure/HttpOnly/SameSite cookie attributes
- **Mitigation**: Session binding to device fingerprint (optional, privacy-considered)
- **Mitigation**: Forced logout on password/phone change

---

## Compliance Considerations

### Data Privacy — User Consent for Audio

- **Explicit consent** obtained before first voice recording
- Consent screen explains:
  - What audio is used for (transcription only)
  - That audio is deleted after processing
  - Which third parties process the data
- Consent is revocable — users can switch to text-only mode
- Consent records are stored with timestamps

### Financial Data Handling

- ShopMind is a **bookkeeping tool**, not a financial institution
- No payment processing — records transactions, doesn't execute them
- Financial summaries are for user reference only — not legal records
- Users are advised to maintain official records separately
- Data export available in standard formats (CSV, PDF)

### Multi-Tenant Isolation

- **Database level**: RLS policies enforce tenant isolation
- **Application level**: User context derived from JWT — no tenant switching
- **API level**: All queries scoped to authenticated user
- **Storage level**: File paths include user ID prefix
- **No cross-tenant data access is possible without service_role key**

---

## Incident Response Plan

### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| P1 — Critical | Active data breach, system compromise | 15 minutes | Unauthorized data access detected |
| P2 — High | Service outage, vulnerability exploited | 1 hour | Auth system failure |
| P3 — Medium | Degraded service, potential vulnerability | 4 hours | Rate limit bypass |
| P4 — Low | Minor issue, no user impact | 24 hours | Failed pentest finding |

### Response Steps

1. **Detect** — Monitoring alerts, user reports, automated scanning
2. **Contain** — Isolate affected systems, revoke compromised credentials
3. **Assess** — Determine scope, affected users, data exposure
4. **Remediate** — Fix the vulnerability, patch systems
5. **Notify** — Inform affected users within 72 hours (if data exposed)
6. **Review** — Post-mortem, update procedures, improve detection

### Communication

- Internal team notified via designated channel immediately
- Affected users notified via in-app notification and email/SMS
- Public disclosure if >100 users affected or financial data exposed

---

## Security Checklist for Deployment

### Pre-Deployment

- [ ] All environment variables set (not hardcoded)
- [ ] `.env` files in `.gitignore`
- [ ] RLS enabled on ALL tables
- [ ] RLS policies tested with multiple user contexts
- [ ] No `service_role` key in client-accessible code
- [ ] HTTPS enforced (no HTTP fallback)
- [ ] CORS configured to allow only known origins
- [ ] Rate limiting configured on all endpoints
- [ ] Input validation on all user inputs
- [ ] Error messages don't expose internal details
- [ ] Audio deletion confirmed after processing
- [ ] JWT expiry and refresh configured correctly
- [ ] Dependencies audited for vulnerabilities (`npm audit`)
- [ ] No secrets in git history (`git-secrets` scan)

### Post-Deployment

- [ ] Verify RLS works in production (test as different users)
- [ ] Confirm HTTPS certificate is valid
- [ ] Test rate limiting under load
- [ ] Verify logs don't contain PII
- [ ] Test session expiry and refresh flows
- [ ] Run OWASP ZAP or similar scanner
- [ ] Verify backup encryption
- [ ] Test incident alerting pipeline

---

## Vulnerability Assessment Schedule

| Activity | Frequency | Tool/Method |
|----------|-----------|-------------|
| Dependency audit | Weekly (automated) | `npm audit`, Dependabot/Renovate |
| SAST (Static Analysis) | Every PR | ESLint security rules, Semgrep |
| RLS policy review | Monthly | Manual review + automated tests |
| Penetration testing | Quarterly | OWASP ZAP, manual testing |
| API security scan | Monthly | Postman security tests, rate limit validation |
| Secret scanning | Every commit | git-secrets, TruffleHog |
| Third-party API review | Quarterly | Review privacy policies, data handling changes |
| Incident response drill | Bi-annually | Tabletop exercise |
| Full security audit | Annually | External auditor |

### Responsible Disclosure

If you discover a security vulnerability in ShopMind, please report it responsibly:
- Email: security@shopmind.app (placeholder)
- Do not publicly disclose until a fix is available
- We aim to acknowledge reports within 48 hours
- We aim to resolve critical issues within 7 days
