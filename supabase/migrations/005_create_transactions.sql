-- ==========================================================================
-- M005: Create transactions table
-- Source: DATABASE_SCHEMA.md §transactions
-- FK → merchants; optional FK → customers
-- ==========================================================================

CREATE TABLE transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    intent text NOT NULL,
    item text,
    quantity numeric(10,2),
    unit text,
    amount numeric(12,2) NOT NULL,
    customer_name text,
    payment_mode text,
    due_status text DEFAULT 'none',
    confidence_score numeric(3,2),
    raw_transcript text,
    provider_used text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
);
