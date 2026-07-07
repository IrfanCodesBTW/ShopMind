-- ==========================================================================
-- M002: RLS policies for merchants table
-- Source: DATABASE_SCHEMA.md §RLS, SECURITY.md §Auth
-- ==========================================================================

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- Merchants can only read their own profile
CREATE POLICY "merchants_select_own" ON merchants
    FOR SELECT USING (id = auth.uid());

-- Merchants can only update their own profile
CREATE POLICY "merchants_update_own" ON merchants
    FOR UPDATE USING (id = auth.uid());

-- Allow insert during signup (auth.uid() matches the new row id)
CREATE POLICY "merchants_insert_own" ON merchants
    FOR INSERT WITH CHECK (id = auth.uid());
