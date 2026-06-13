-- AlterTable
ALTER TABLE "compliance_check_batches" ADD COLUMN     "aiSuggestedCompliances" JSONB;

-- AlterTable
ALTER TABLE "compliance_results" ADD COLUMN     "isMandatory" BOOLEAN;
