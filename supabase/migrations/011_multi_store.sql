-- ==========================================================================
-- M011: Multi-Store Support Foundation
-- Source: PRD §2.2, ROADMAP Phase 4
-- Prepares the schema to allow a merchant to manage multiple stores.
-- ==========================================================================

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name text NOT NULL,
    address text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores_select_own" ON stores
    FOR SELECT USING (merchant_id = auth.uid());

CREATE POLICY "stores_insert_own" ON stores
    FOR INSERT WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "stores_update_own" ON stores
    FOR UPDATE USING (merchant_id = auth.uid());

CREATE POLICY "stores_delete_own" ON stores
    FOR DELETE USING (merchant_id = auth.uid());

-- Trigger for updated_at on stores
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add store_id to existing tables as optional FKs for gradual migration
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id) ON DELETE SET NULL;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id) ON DELETE SET NULL;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id) ON DELETE SET NULL;
ALTER TABLE credit_ledger ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id) ON DELETE SET NULL;

-- Create indexes for performance on store queries
CREATE INDEX IF NOT EXISTS idx_transactions_store ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_store ON inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_store ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_store ON credit_ledger(store_id);
