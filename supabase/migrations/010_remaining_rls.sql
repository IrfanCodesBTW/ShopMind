-- ==========================================================================
-- M010: RLS policies for remaining tables
-- Source: DATABASE_SCHEMA.md §RLS, SECURITY.md §Auth
-- ==========================================================================

-- ── Transactions ───────────────────────────────────────────────────────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON transactions
    FOR SELECT USING (merchant_id = auth.uid());

CREATE POLICY "transactions_insert_own" ON transactions
    FOR INSERT WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "transactions_update_own" ON transactions
    FOR UPDATE USING (merchant_id = auth.uid());

-- ── Customers ──────────────────────────────────────────────────────────────
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select_own" ON customers
    FOR SELECT USING (merchant_id = auth.uid());

CREATE POLICY "customers_insert_own" ON customers
    FOR INSERT WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "customers_update_own" ON customers
    FOR UPDATE USING (merchant_id = auth.uid());

-- ── Inventory ──────────────────────────────────────────────────────────────
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_select_own" ON inventory
    FOR SELECT USING (merchant_id = auth.uid());

CREATE POLICY "inventory_insert_own" ON inventory
    FOR INSERT WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "inventory_update_own" ON inventory
    FOR UPDATE USING (merchant_id = auth.uid());

-- ── Credit Ledger ──────────────────────────────────────────────────────────
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_ledger_select_own" ON credit_ledger
    FOR SELECT USING (merchant_id = auth.uid());

CREATE POLICY "credit_ledger_insert_own" ON credit_ledger
    FOR INSERT WITH CHECK (merchant_id = auth.uid());

-- ── Audit Logs (read-only for merchants) ───────────────────────────────────
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_own" ON audit_logs
    FOR SELECT USING (merchant_id = auth.uid());

-- ── API Usage (admin-only via service_role) ────────────────────────────────
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Only accessible via service_role key (admin operations)
-- No user-facing policies needed
