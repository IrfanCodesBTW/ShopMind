-- ==========================================================================
-- M004: Create inventory table
-- Source: DATABASE_SCHEMA.md §inventory
-- FK → merchants
-- ==========================================================================

CREATE TABLE inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    item_name text NOT NULL,
    quantity numeric(10,2) NOT NULL DEFAULT 0,
    unit text NOT NULL,
    reorder_level numeric(10,2) NOT NULL DEFAULT 0,
    last_updated timestamptz NOT NULL DEFAULT now(),
    UNIQUE(merchant_id, item_name)
);
