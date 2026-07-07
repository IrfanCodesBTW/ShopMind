# User Flows — ShopMind

## Overview

ShopMind is a voice-first transaction management app for Indian small business merchants (kirana stores, general stores, service providers). The primary interaction model is:

1. Merchant speaks a transaction in natural language
2. AI parses the voice into structured data
3. Merchant confirms or corrects
4. Transaction is saved and reflected in dashboard

This document maps all primary flows, error states, and edge cases.

---

## Primary Flows

### Flow 1: Voice Transaction Recording

The core flow — merchant records a transaction by speaking.

```mermaid
flowchart TD
    A[Merchant taps mic button] --> B[Recording starts<br/>Visual indicator active]
    B --> C{Silence detected<br/>OR merchant taps stop}
    C --> D[Audio sent to API]
    D --> E[Groq Whisper STT]
    E --> F[Transcript displayed<br/>in real-time]
    F --> G[Normalization]
    G --> H[AI Parser Chain]
    H --> I{Confidence level?}
    
    I -->|≥ 0.85| J[Auto-filled confirmation card<br/>shown for 3s]
    I -->|0.70 – 0.84| K[Confirmation card<br/>requires tap to accept]
    I -->|0.50 – 0.69| L[Editable form<br/>pre-filled with parsed data]
    I -->|< 0.50| M[Manual entry form<br/>with transcript shown]
    
    J --> N{Merchant intervenes?}
    N -->|no action in 3s| O[Transaction saved]
    N -->|taps edit| P[Editable form opens]
    
    K --> Q{Merchant action}
    Q -->|confirms| O
    Q -->|edits| P
    Q -->|cancels| R[Transaction discarded]
    
    L --> S{Merchant action}
    S -->|saves| O
    S -->|cancels| R
    
    M --> T{Merchant action}
    T -->|fills and saves| O
    T -->|cancels| R
    
    P --> O
    O --> U[Success animation<br/>Dashboard updated]
```

---

### Flow 2: User Registration & Onboarding

```mermaid
flowchart TD
    A[App opened first time] --> B[Language selection<br/>Hindi / English / Regional]
    B --> C[Phone number entry]
    C --> D[OTP verification]
    D --> E[Business profile setup]
    E --> F{Business type}
    F --> G[Kirana / General Store]
    F --> H[Restaurant / Food]
    F --> I[Service Provider]
    F --> J[Other]
    
    G --> K[Common items suggestion<br/>pre-populated]
    H --> K
    I --> K
    J --> K
    
    K --> L[Add regular customers<br/>optional]
    L --> M[Microphone permission request]
    M --> N{Permission granted?}
    N -->|yes| O[Voice test<br/>Say a sample transaction]
    N -->|no| P[Text-only mode explained]
    
    O --> Q[Parsing demo shown]
    Q --> R[Onboarding complete<br/>Dashboard shown]
    P --> R
```

---

### Flow 3: Transaction Confirmation & Correction

```mermaid
flowchart TD
    A[Parsed transaction shown] --> B{Review parsed fields}
    
    B --> C[Intent correct?]
    C -->|no| D[Tap intent chip<br/>Select from dropdown]
    
    B --> E[Amount correct?]
    E -->|no| F[Tap amount field<br/>Edit with numpad]
    
    B --> G[Item correct?]
    G -->|no| H[Tap item field<br/>Type or select from history]
    
    B --> I[Customer correct?]
    I -->|no| J[Tap customer field<br/>Search or add new]
    
    D --> K[Updated transaction preview]
    F --> K
    H --> K
    J --> K
    
    K --> L{All correct?}
    L -->|yes| M[Tap confirm]
    L -->|no| B
    
    M --> N[Transaction saved]
    N --> O[Correction logged<br/>for model improvement]
```

---

### Flow 4: Credit Management

```mermaid
flowchart TD
    subgraph GiveCredit["Give Credit"]
        A1[Merchant says:<br/>'Sharma ji ko 500 udhar diya'] --> B1[Parsed as credit_given]
        B1 --> C1[Confirmation card:<br/>Customer: Sharma ji<br/>Amount: ₹500<br/>Status: Due]
        C1 --> D1[Confirmed & saved]
        D1 --> E1[Customer credit balance updated]
    end
    
    subgraph ReceivePayment["Receive Payment"]
        A2[Merchant says:<br/>'Sharma ji ne 300 diye'] --> B2[Parsed as credit_received]
        B2 --> C2[System shows:<br/>Sharma ji owes ₹500<br/>Payment: ₹300<br/>Remaining: ₹200]
        C2 --> D2[Confirmed & saved]
        D2 --> E2[Credit balance reduced]
    end
    
    subgraph CreditView["Credit Dashboard"]
        F[Tap Credits tab] --> G[List of all customers with dues]
        G --> H[Tap customer name]
        H --> I[Full credit history<br/>with timeline]
        I --> J[Option: Send reminder<br/>via WhatsApp/SMS]
    end
```

---

### Flow 5: Inventory Check & Update

```mermaid
flowchart TD
    subgraph StockUpdate["Stock Update"]
        A1[Merchant says:<br/>'50 packet chips aaye'] --> B1[Parsed as stock_update]
        B1 --> C1[Confirmation:<br/>Item: Chips<br/>Quantity: +50 packets]
        C1 --> D1[Inventory updated]
    end
    
    subgraph StockCheck["Stock Check"]
        A2[Merchant says:<br/>'Kitna atta bacha hai'] --> B2[Parsed as stock_check]
        B2 --> C2[System responds:<br/>Atta: 25 kg remaining<br/>Last updated: 2 days ago]
    end
    
    subgraph LowStock["Low Stock Alert"]
        E[System detects stock below threshold] --> F[Push notification:<br/>'Atta running low - 5 kg left']
        F --> G{Merchant action}
        G -->|tap| H[Reorder suggestion shown]
        G -->|dismiss| I[Reminder in 24h]
    end
```

---

### Flow 6: Dashboard Viewing

```mermaid
flowchart TD
    A[Open app / Home screen] --> B[Today's Summary Card]
    
    B --> C[Total Sales: ₹X]
    B --> D[Total Expenses: ₹Y]
    B --> E[Credit Given: ₹Z]
    B --> F[Net Profit: ₹W]
    
    A --> G[Recent Transactions List]
    G --> H[Tap any transaction]
    H --> I[Transaction detail view]
    I --> J{Actions}
    J --> K[Edit]
    J --> L[Delete]
    J --> M[Duplicate]
    
    A --> N[Quick Filters]
    N --> O[By date range]
    N --> P[By transaction type]
    N --> Q[By customer]
    N --> R[By item]
    
    A --> S[Insights Tab]
    S --> T[Weekly/Monthly trends]
    S --> U[Top selling items]
    S --> V[Top credit customers]
    S --> W[Expense breakdown]
```

---

### Flow 7: Manual Entry Fallback

```mermaid
flowchart TD
    A{Entry trigger} --> B[Tap + button]
    A --> C[AI parse failed]
    A --> D[Prefer typing]
    
    B --> E[Transaction type selector]
    C --> E
    D --> E
    
    E --> F[Select: Sale / Expense / Credit / Stock / Return]
    F --> G[Form displayed with fields:<br/>Item, Quantity, Unit, Amount,<br/>Customer, Payment Mode]
    
    G --> H[Auto-complete suggestions<br/>from history]
    H --> I[Fill required fields]
    I --> J{Validate}
    J -->|valid| K[Save transaction]
    J -->|missing required| L[Highlight missing fields]
    L --> I
    
    K --> M[Success + return to dashboard]
```

---

## Error Flows

### AI Parsing Failure

```mermaid
flowchart TD
    A[Voice input received] --> B[STT succeeds]
    B --> C[All parsers attempted]
    C --> D{Any confidence ≥ 0.50?}
    
    D -->|no| E[Show error state:<br/>'Could not understand']
    E --> F[Display raw transcript]
    F --> G{User options}
    G --> H[Try again with voice]
    G --> I[Manual entry with<br/>transcript visible]
    G --> J[Edit transcript text<br/>and re-parse]
    
    H --> K[New recording]
    I --> L[Manual form]
    J --> M[Re-submit to parser]
    
    D -->|yes but low| N[Show pre-filled form<br/>with low-confidence fields highlighted]
```

### Network Connectivity Loss

```mermaid
flowchart TD
    A[Network lost detected] --> B[Show offline indicator]
    B --> C{User records transaction}
    C --> D[Audio saved locally]
    D --> E[Local Rules Parser attempts parse]
    
    E -->|matched| F[Show parsed result<br/>with offline badge]
    E -->|no match + Ollama available| G[Ollama parses locally]
    E -->|no match + no Ollama| H[Queue for later<br/>Manual entry offered]
    
    F --> I[Save locally with<br/>pending sync status]
    G --> I
    H --> I
    
    I --> J{Network restored}
    J --> K[Sync queued transactions]
    K --> L[Re-parse with cloud AI<br/>for higher accuracy]
    L --> M{Better parse available?}
    M -->|yes + significant diff| N[Show update suggestion]
    M -->|no or minor| O[Keep local parse]
```

### Quota Exhaustion

```mermaid
flowchart TD
    A[API returns 429<br/>or daily limit reached] --> B{Which provider?}
    
    B -->|Gemini| C[Switch to Groq Llama 3.3 70B]
    B -->|Groq 70B| D[Switch to Groq 8B Instant]
    B -->|All cloud| E[Local Rules Parser only]
    
    C --> F[Continue with fallback<br/>Show subtle indicator]
    D --> F
    E --> G{Ollama available?}
    
    G -->|yes| H[Use Ollama]
    G -->|no| I[Show quota warning<br/>Offer manual entry]
    
    H --> F
    
    I --> J[Display:<br/>'AI quota reached for today'<br/>'Transactions can be entered manually'<br/>'AI will resume at midnight']
    
    F --> K[Track degraded performance]
    K --> L[Notify user if quality drops]
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| **Merchant speaks too fast** | Show "speak slower" hint if STT confidence is low |
| **Background noise** | Noise suppression via Web Audio API; retry prompt if transcript garbled |
| **Multiple transactions in one utterance** | Split detection; show each as separate confirmation card |
| **Ambiguous amount** | "sau" could be 100 or part of a name; use context + confirmation |
| **Unknown customer name** | Offer to add as new customer or select from similar names |
| **Duplicate transaction** | Detect if same transaction within 30s; ask "Did you mean to add another?" |
| **Currency confusion** | Default to INR; flag if amount seems unreasonable for item |
| **Mixed languages mid-sentence** | Normalizer handles code-switching; parser trained on Hinglish |
| **Very large amounts** | Confirm amounts > ₹10,000 with extra verification step |
| **Zero quantity or amount** | Reject and ask for clarification |
| **Item not in inventory** | Allow and suggest adding to inventory |
| **Partial utterance (cut off)** | Show what was captured; offer to re-record or complete manually |

---

## User Personas

### Persona 1: Ramesh — Kirana Store Owner

| Attribute | Detail |
|-----------|--------|
| **Age** | 45 |
| **Location** | Tier-2 city, Uttar Pradesh |
| **Language** | Hindi primarily, some English numbers |
| **Tech comfort** | Low — uses WhatsApp and YouTube |
| **Business** | General store, 50-100 transactions/day |
| **Pain points** | Forgets to note credit; paper registers messy; can't track profit |
| **Key need** | Voice-first, minimal typing, Hindi interface |
| **Device** | Budget Android phone (2GB RAM) |

### Persona 2: Priya — Salon Owner

| Attribute | Detail |
|-----------|--------|
| **Age** | 32 |
| **Location** | Metro city suburb |
| **Language** | Hinglish |
| **Tech comfort** | Medium — uses Instagram for business |
| **Business** | Beauty salon, 15-25 appointments/day |
| **Pain points** | Tracking service revenue vs. product sales; managing credit for regular clients |
| **Key need** | Quick entry between appointments; credit tracking per customer |
| **Device** | Mid-range Android |

### Persona 3: Arjun — Chai Stall Operator

| Attribute | Detail |
|-----------|--------|
| **Age** | 28 |
| **Location** | Tier-3 town |
| **Language** | Hindi with local dialect |
| **Tech comfort** | Low-medium |
| **Business** | Tea and snacks, 200+ micro-transactions/day |
| **Pain points** | Too many small transactions to track manually; needs batch entry |
| **Key need** | Ultra-fast recording (< 5s per transaction); daily summary |
| **Device** | Budget Android, sometimes poor connectivity |

### Persona 4: Deepa — Wholesale Supplier

| Attribute | Detail |
|-----------|--------|
| **Age** | 50 |
| **Location** | Mandi / wholesale market |
| **Language** | Hindi |
| **Tech comfort** | Very low — son helps with phone |
| **Business** | Wholesale grains, 20-30 large transactions/day |
| **Pain points** | Complex credit chains; large amounts; needs detailed records for tax |
| **Key need** | Accurate amounts for large transactions; credit management; exportable records |
| **Device** | Basic smartphone, prefers voice over typing |
