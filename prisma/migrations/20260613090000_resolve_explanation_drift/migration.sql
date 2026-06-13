-- AlterTable: add explanation column to scheme_matches (already applied via raw SQL)
ALTER TABLE "scheme_matches" ADD COLUMN IF NOT EXISTS "explanation" TEXT;
