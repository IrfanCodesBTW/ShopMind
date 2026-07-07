-- ==========================================================================
-- M006: Create credit_ledger table
-- Source: DATABASE_SCHEMA.md §credit_ledger
-- FK → merchants, customers, transactions
-- ==========================================================================

CREATE TABLE credit_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
    amount numeric(12,2) NOT NULL,
    type text NOT NULL CHECK (type IN ('credit', 'debit')),
    balance_after numeric(12,2) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
