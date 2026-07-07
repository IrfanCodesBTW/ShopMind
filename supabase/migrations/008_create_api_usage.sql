-- ==========================================================================
-- M008: Create api_usage table
-- Source: DATABASE_SCHEMA.md §api_usage
-- Admin-scoped, no merchant FK
-- ==========================================================================

CREATE TABLE api_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider text NOT NULL,
    model text NOT NULL,
    tokens_used integer NOT NULL DEFAULT 0,
    request_type text NOT NULL,
    success boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
