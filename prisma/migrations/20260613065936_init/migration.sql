-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'USER',
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "businessName" VARCHAR(255) NOT NULL,
    "ownerName" VARCHAR(255) NOT NULL,
    "constitution" VARCHAR(100) NOT NULL,
    "sector" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "taluka" VARCHAR(100),
    "yearEstablished" INTEGER NOT NULL,
    "productionStart" VARCHAR(50),
    "annualTurnoverRange" VARCHAR(100) NOT NULL,
    "investmentPlantMachinery" VARCHAR(100) NOT NULL,
    "msmeCategory" VARCHAR(50),
    "totalEmployees" INTEGER NOT NULL,
    "maleEmployees" INTEGER NOT NULL,
    "femaleEmployees" INTEGER NOT NULL,
    "gstStatus" VARCHAR(50) NOT NULL,
    "udyamNumber" VARCHAR(100),
    "gstin" VARCHAR(20),
    "existingRegistrations" JSONB NOT NULL DEFAULT '[]',
    "pendingNotices" BOOLEAN NOT NULL DEFAULT false,
    "ownerGender" VARCHAR(50) NOT NULL,
    "ownerAgeGroup" VARCHAR(20) NOT NULL,
    "socialCategory" VARCHAR(50) NOT NULL,
    "education" VARCHAR(100) NOT NULL,
    "womenLed" VARCHAR(20) NOT NULL,
    "bplCard" BOOLEAN NOT NULL DEFAULT false,
    "knownSchemes" TEXT,
    "documentsOnFile" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startups" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "startupName" VARCHAR(255) NOT NULL,
    "ownerName" VARCHAR(255) NOT NULL,
    "constitution" VARCHAR(100) NOT NULL,
    "sector" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "taluka" VARCHAR(100),
    "city" VARCHAR(100) NOT NULL,
    "yearEstablished" INTEGER NOT NULL,
    "productionStart" VARCHAR(50),
    "startupStage" VARCHAR(50) NOT NULL,
    "startupDescription" TEXT NOT NULL,
    "annualTurnoverRange" VARCHAR(100) NOT NULL,
    "investmentPlantMachinery" VARCHAR(100) NOT NULL,
    "msmeCategory" VARCHAR(50),
    "investmentRaised" VARCHAR(100) NOT NULL,
    "investmentType" VARCHAR(100) NOT NULL,
    "totalEmployees" INTEGER NOT NULL,
    "maleEmployees" INTEGER NOT NULL,
    "femaleEmployees" INTEGER NOT NULL,
    "coFounders" INTEGER NOT NULL DEFAULT 0,
    "gstStatus" VARCHAR(50) NOT NULL,
    "udyamNumber" VARCHAR(100),
    "gstin" VARCHAR(20),
    "dpiitNumber" VARCHAR(100),
    "investors" TEXT,
    "existingRegistrations" JSONB NOT NULL DEFAULT '[]',
    "pendingNotices" BOOLEAN NOT NULL DEFAULT false,
    "ownerGender" VARCHAR(50) NOT NULL,
    "ownerAgeGroup" VARCHAR(20) NOT NULL,
    "socialCategory" VARCHAR(50) NOT NULL,
    "education" VARCHAR(100) NOT NULL,
    "womenLed" VARCHAR(20) NOT NULL,
    "bplCard" BOOLEAN NOT NULL DEFAULT false,
    "knownSchemes" TEXT,
    "documentsOnFile" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "startups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schemes" (
    "id" UUID NOT NULL,
    "schemeName" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "details" TEXT,
    "benefits" TEXT,
    "eligibility" TEXT,
    "application" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "level" VARCHAR(100) NOT NULL,
    "schemeCategory" JSONB NOT NULL DEFAULT '{}',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "targetCategory" VARCHAR(50),
    "applicableStates" JSONB NOT NULL DEFAULT '[]',
    "applicationLink" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheme_matches" (
    "id" UUID NOT NULL,
    "businessId" UUID,
    "startupId" UUID,
    "schemeId" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "matchScore" DECIMAL(5,2),
    "confidenceScore" DECIMAL(5,2),
    "metCriteria" JSONB NOT NULL DEFAULT '[]',
    "unmetCriteria" JSONB NOT NULL DEFAULT '[]',
    "gapBridgeSteps" JSONB NOT NULL DEFAULT '[]',
    "remediationCost" VARCHAR(100),
    "remediationEffort" VARCHAR(50),
    "unlocksOtherSchemes" JSONB NOT NULL DEFAULT '[]',
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "scheme_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_requirements" (
    "id" UUID NOT NULL,
    "complianceId" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "applicableTo" JSONB NOT NULL DEFAULT '{}',
    "tiers" JSONB NOT NULL DEFAULT '{}',
    "penalty" TEXT,
    "applicationPortal" TEXT,
    "recentChanges" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_check_batches" (
    "id" UUID NOT NULL,
    "businessId" UUID,
    "startupId" UUID,
    "overallScore" INTEGER NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_check_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_results" (
    "id" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "complianceRequirementId" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "currentTier" VARCHAR(100),
    "requiredTier" VARCHAR(100),
    "penalty" TEXT,
    "fixSteps" JSONB NOT NULL DEFAULT '[]',
    "missingActions" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "businessId" UUID,
    "startupId" UUID,
    "schemeId" UUID,
    "documentType" VARCHAR(50) NOT NULL,
    "content" JSONB NOT NULL,
    "filledContent" JSONB,
    "pdfPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "businessId" UUID,
    "startupId" UUID,
    "schemeId" UUID NOT NULL,
    "portalName" VARCHAR(255),
    "applicationStatus" VARCHAR(50) NOT NULL,
    "formDataSnapshot" JSONB NOT NULL DEFAULT '{}',
    "generatedPdfPath" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_updates" (
    "id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "severity" VARCHAR(50) NOT NULL,
    "summary" TEXT NOT NULL,
    "actionRequired" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "affectsComplianceIds" JSONB NOT NULL DEFAULT '[]',
    "affectsSchemeIds" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regulatory_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_funding_records" (
    "id" UUID NOT NULL,
    "startupName" VARCHAR(500) NOT NULL,
    "sector" VARCHAR(200),
    "state" VARCHAR(100),
    "fundingRound" VARCHAR(100),
    "amount" DECIMAL(20,2),
    "amountCurrency" VARCHAR(10),
    "investors" JSONB NOT NULL DEFAULT '[]',
    "fundingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "startup_funding_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_userId_key" ON "businesses"("userId");

-- CreateIndex
CREATE INDEX "businesses_sector_state_idx" ON "businesses"("sector", "state");

-- CreateIndex
CREATE INDEX "businesses_msmeCategory_idx" ON "businesses"("msmeCategory");

-- CreateIndex
CREATE INDEX "businesses_deletedAt_idx" ON "businesses"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "startups_userId_key" ON "startups"("userId");

-- CreateIndex
CREATE INDEX "startups_sector_state_idx" ON "startups"("sector", "state");

-- CreateIndex
CREATE INDEX "startups_startupStage_idx" ON "startups"("startupStage");

-- CreateIndex
CREATE INDEX "startups_deletedAt_idx" ON "startups"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "schemes_slug_key" ON "schemes"("slug");

-- CreateIndex
CREATE INDEX "schemes_level_isActive_idx" ON "schemes"("level", "isActive");

-- CreateIndex
CREATE INDEX "schemes_targetCategory_idx" ON "schemes"("targetCategory");

-- CreateIndex
CREATE INDEX "scheme_matches_businessId_matchedAt_idx" ON "scheme_matches"("businessId", "matchedAt" DESC);

-- CreateIndex
CREATE INDEX "scheme_matches_startupId_matchedAt_idx" ON "scheme_matches"("startupId", "matchedAt" DESC);

-- CreateIndex
CREATE INDEX "scheme_matches_schemeId_idx" ON "scheme_matches"("schemeId");

-- CreateIndex
CREATE INDEX "scheme_matches_status_idx" ON "scheme_matches"("status");

-- CreateIndex
CREATE INDEX "scheme_matches_deletedAt_idx" ON "scheme_matches"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_requirements_complianceId_key" ON "compliance_requirements"("complianceId");

-- CreateIndex
CREATE INDEX "compliance_requirements_complianceId_idx" ON "compliance_requirements"("complianceId");

-- CreateIndex
CREATE INDEX "compliance_check_batches_businessId_checkedAt_idx" ON "compliance_check_batches"("businessId", "checkedAt" DESC);

-- CreateIndex
CREATE INDEX "compliance_check_batches_startupId_checkedAt_idx" ON "compliance_check_batches"("startupId", "checkedAt" DESC);

-- CreateIndex
CREATE INDEX "compliance_results_status_idx" ON "compliance_results"("status");

-- CreateIndex
CREATE INDEX "compliance_results_complianceRequirementId_idx" ON "compliance_results"("complianceRequirementId");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_results_batchId_complianceRequirementId_key" ON "compliance_results"("batchId", "complianceRequirementId");

-- CreateIndex
CREATE INDEX "generated_documents_userId_idx" ON "generated_documents"("userId");

-- CreateIndex
CREATE INDEX "generated_documents_businessId_idx" ON "generated_documents"("businessId");

-- CreateIndex
CREATE INDEX "generated_documents_startupId_idx" ON "generated_documents"("startupId");

-- CreateIndex
CREATE INDEX "generated_documents_documentType_idx" ON "generated_documents"("documentType");

-- CreateIndex
CREATE INDEX "generated_documents_deletedAt_idx" ON "generated_documents"("deletedAt");

-- CreateIndex
CREATE INDEX "applications_businessId_idx" ON "applications"("businessId");

-- CreateIndex
CREATE INDEX "applications_startupId_idx" ON "applications"("startupId");

-- CreateIndex
CREATE INDEX "applications_schemeId_idx" ON "applications"("schemeId");

-- CreateIndex
CREATE INDEX "applications_applicationStatus_idx" ON "applications"("applicationStatus");

-- CreateIndex
CREATE INDEX "regulatory_updates_effectiveDate_idx" ON "regulatory_updates"("effectiveDate");

-- CreateIndex
CREATE INDEX "regulatory_updates_severity_idx" ON "regulatory_updates"("severity");

-- CreateIndex
CREATE INDEX "startup_funding_records_sector_state_idx" ON "startup_funding_records"("sector", "state");

-- CreateIndex
CREATE INDEX "startup_funding_records_fundingDate_idx" ON "startup_funding_records"("fundingDate");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startups" ADD CONSTRAINT "startups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheme_matches" ADD CONSTRAINT "scheme_matches_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheme_matches" ADD CONSTRAINT "scheme_matches_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheme_matches" ADD CONSTRAINT "scheme_matches_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "schemes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_check_batches" ADD CONSTRAINT "compliance_check_batches_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_check_batches" ADD CONSTRAINT "compliance_check_batches_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_results" ADD CONSTRAINT "compliance_results_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "compliance_check_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_results" ADD CONSTRAINT "compliance_results_complianceRequirementId_fkey" FOREIGN KEY ("complianceRequirementId") REFERENCES "compliance_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "schemes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "schemes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
