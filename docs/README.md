# ShopMind

**Multilingual, voice-first business operations assistant for shop owners.**

---

## Problem Statement

Small shop owners spend valuable time manually tracking sales, expenses, and inventory updates. Many lack technical literacy or time to use traditional bookkeeping software. Language barriers and literacy constraints make text-heavy interfaces inaccessible. ShopMind removes these barriers by letting owners simply *speak* their business updates in any language, automatically extracting structured transaction data with AI.

---

## Key Features

- **Voice-First Input** — Record business updates naturally via browser microphone
- **Multilingual Support** — Speak in any language; AI handles transcription and extraction
- **AI-Powered Parsing** — Gemini 2.5 Flash extracts structured transactions from speech
- **Graceful Fallback Chain** — Groq Llama 3.3 70B → Local Rules Parser → Manual Entry
- **User Confirmation** — Always confirms extracted data before saving
- **Real-Time Sync** — Supabase Realtime keeps data in sync across devices
- **Row-Level Security** — Each user's data is isolated and protected
- **Zero-Cost Design** — Runs entirely on free tiers (Supabase, Groq, Gemini)
- **Offline-Ready Architecture** — Local rules parser works without network

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Speech-to-Text | Groq Whisper API |
| Primary AI Parser | Gemini 2.5 Flash |
| Fallback AI Parser | Groq Llama 3.3 70B |
| Optional Local LLM | Ollama |
| Deployment | Vercel (frontend), Supabase (backend) |

---

## Architecture Overview

```
Browser Mic → Groq Whisper STT → Transcript Normalization
    → Gemini 2.5 Flash (primary)
    → Groq Llama 3.3 70B (fallback)
    → Local Rules Parser (fallback)
    → Manual Entry (final fallback)
    → User Confirmation → Supabase (PostgreSQL)
```

All AI parsers implement a unified `TransactionParser` interface, enabling seamless fallback without changing downstream logic.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system architecture.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier)
- Groq API key (free tier)
- Gemini API key (free tier)
- (Optional) Ollama installed locally

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ShopMind.git
cd ShopMind

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# GROQ_API_KEY=...
# GEMINI_API_KEY=...

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use ShopMind.

---

## Project Structure

```
ShopMind/
├── docs/                   # Project documentation
│   ├── README.md           # This file
│   └── ARCHITECTURE.md     # System architecture
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React UI components
│   ├── lib/                # Shared utilities and clients
│   ├── services/           # AI parsers, STT, business logic
│   │   ├── parsers/        # TransactionParser implementations
│   │   └── stt/            # Speech-to-text service
│   ├── types/              # TypeScript type definitions
│   └── hooks/              # Custom React hooks
├── supabase/               # Supabase migrations and config
├── public/                 # Static assets
├── .env.example            # Environment variable template
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Documentation

- [Architecture](./ARCHITECTURE.md) — System design, data flow, and component interactions
- [README](./README.md) — This file

---

## License

> TBD — License to be determined.

---

## Contributing

> Contribution guidelines coming soon. If you'd like to contribute, please open an issue to discuss your proposed changes before submitting a pull request.
