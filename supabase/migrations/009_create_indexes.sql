-- ==========================================================================
-- M009: Create indexes on all tables
-- Source: DATABASE_SCHEMA.md §Indexes
-- ==========================================================================

-- Transactions: frequent queries by merchant and time
CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_merchant_status ON transactions(merchant_id, status);

-- Customers: lookup by merchant and phone
CREATE INDEX idx_customers_merchant_id ON customers(merchant_id);
CREATE INDEX idx_customers_merchant_phone ON customers(merchant_id, phone);

-- Inventory: lookup by merchant and low-stock queries
CREATE INDEX idx_inventory_merchant_id ON inventory(merchant_id);
CREATE INDEX idx_inventory_low_stock ON inventory(merchant_id, quantity, reorder_level);

-- Credit Ledger: queries by customer and merchant
CREATE INDEX idx_credit_ledger_merchant_id ON credit_ledger(merchant_id);
CREATE INDEX idx_credit_ledger_customer_id ON credit_ledger(customer_id);
CREATE INDEX idx_credit_ledger_created_at ON credit_ledger(created_at DESC);

-- Audit Logs: queries by merchant, entity, and time
CREATE INDEX idx_audit_logs_merchant_id ON audit_logs(merchant_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- API Usage: analytics queries by provider and time
CREATE INDEX idx_api_usage_provider ON api_usage(provider);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);
CREATE INDEX idx_api_usage_provider_success ON api_usage(provider, success);
