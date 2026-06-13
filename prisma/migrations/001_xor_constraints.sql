-- XOR constraints: exactly one of business_id / startup_id must be non-null.
-- Run this after `prisma migrate deploy` via: psql $DATABASE_URL -f prisma/migrations/001_xor_constraints.sql

ALTER TABLE scheme_matches
  ADD CONSTRAINT chk_scheme_match_entity_xor
  CHECK (
    (business_id IS NOT NULL AND startup_id IS NULL) OR
    (business_id IS NULL AND startup_id IS NOT NULL)
  );

ALTER TABLE compliance_check_batches
  ADD CONSTRAINT chk_compliance_batch_entity_xor
  CHECK (
    (business_id IS NOT NULL AND startup_id IS NULL) OR
    (business_id IS NULL AND startup_id IS NOT NULL)
  );

ALTER TABLE applications
  ADD CONSTRAINT chk_application_entity_xor
  CHECK (
    (business_id IS NOT NULL AND startup_id IS NULL) OR
    (business_id IS NULL AND startup_id IS NOT NULL)
  );

ALTER TABLE generated_documents
  ADD CONSTRAINT chk_document_entity_xor
  CHECK (
    (business_id IS NOT NULL AND startup_id IS NULL) OR
    (business_id IS NULL AND startup_id IS NOT NULL)
  );
