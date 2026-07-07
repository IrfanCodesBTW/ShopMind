-- ==========================================================================
-- M003: Create customers table
-- Source: DATABASE_SCHEMA.md §customers
-- FK → merchants
-- ==========================================================================

CREATE TABLE customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text,
    total_credit numeric(12,2) NOT NULL DEFAULT 0,
    total_paid numeric(12,2) NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(merchant_id, phone)
);

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
