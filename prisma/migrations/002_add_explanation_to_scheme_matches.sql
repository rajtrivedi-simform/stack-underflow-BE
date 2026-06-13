-- Add per-scheme AI explanation to scheme_matches
ALTER TABLE scheme_matches ADD COLUMN IF NOT EXISTS explanation TEXT;
