# VyaparSetu Backend

NestJS 10 + Neon DB (PostgreSQL) + Prisma ORM + Redis + OpenAI GPT-4o + Winston + Swagger.

## Key commands
- `npm run start:dev` — hot-reload dev server (port 3000)
- `npm run build` — compile to dist/
- `npm run test` — unit tests (Jest)
- `npm run test:cov` — coverage report
- `npx prisma migrate dev` — apply schema changes as a new migration
- `npx prisma generate` — regenerate Prisma client after schema changes
- `npm run prisma:seed` — seed schemes + startup funding from CSVs in prisma/data/
- `docker-compose up` — start app + postgres + redis

## Architecture
- Global modules (auto-available everywhere without importing): PrismaModule, RedisModule, LoggerModule, ConfigModule
- Feature modules live under src/ (businesses, startups, schemes, match, compliance, documents, pdf, applications, regulatory-updates, insights, cleanup, health)
- Auth is JWT-required globally via JwtAuthGuard; use @Public() to opt out
- @Public() routes: /api/v1/auth/*, /api/v1/schemes (GET), /api/v1/regulatory-updates (GET), /api/v1/insights/*, /health

## Registration & Login
- Register: POST /api/v1/auth/register — { email, phone (E.164 e.g. +919876543210), password }
- Login: POST /api/v1/auth/login — { identifier: email|phone, password }
- Tokens: { accessToken (15m), refreshToken (7d) }
- Refresh: POST /api/v1/auth/refresh — { refreshToken }

## Prisma conventions
- Schema: prisma/schema.prisma — always run `npx prisma generate` after any change
- Soft-delete: PrismaService registers a middleware that appends WHERE deletedAt IS NULL to all findMany/findFirst/findUnique calls automatically
- Models with dual nullable FKs (businessId/startupId) MUST use named @relation() — see existing models for pattern
- XOR constraint (exactly one of businessId/startupId must be non-null) is enforced by raw SQL in prisma/migrations/001_xor_constraints.sql

## API conventions
- Base path: /api/v1
- Swagger docs: GET /api/docs (dev only)
- All responses wrapped: { success: true, data: ..., meta: { requestId, timestamp, version } }
- All errors wrapped: { success: false, error: { code, message, details, requestId, timestamp } }
- Prisma P2002 → 409 CONFLICT, P2025 → 404 NOT_FOUND, everything else → 500

## Coding standards
- No comments unless the WHY is non-obvious (hidden constraint, workaround, invariant)
- DTOs use class-validator decorators; ValidationPipe is global (whitelist: true, transform: true)
- Services never let raw Prisma errors escape — GlobalExceptionFilter handles mapping
- Financial fields (annualTurnoverRange, investmentPlantMachinery) excluded from Winston request logs
- All AI calls go through AiService — never call OpenAI client directly from feature services

## Entity types
BUSINESS fields: businessName, ownerName, constitution, sector, state, district, taluka?, yearEstablished, productionStart?, annualTurnoverRange, investmentPlantMachinery, msmeCategory (auto), totalEmployees, maleEmployees, femaleEmployees, gstStatus, udyamNumber?, gstin?, existingRegistrations[], pendingNotices, ownerGender, ownerAgeGroup, socialCategory, education, womenLed, bplCard, knownSchemes?

STARTUP adds: city, startupStage, startupDescription, investmentRaised, investmentType, dpiitNumber?, investors?, coFounders
STARTUP removes: taluka is optional; no investmentInPlantMachinery as separate — uses same field name

## MSME category auto-computation
Computed from annualTurnoverRange + investmentPlantMachinery upper bounds in BusinessesService/StartupsService.
Use src/shared/utils/range-parser.ts (RangeParser) to get upper bound of range strings.
Micro: Inv ≤ 1Cr AND TO ≤ 5Cr | Small: ≤ 10Cr AND ≤ 50Cr | Medium: ≤ 50Cr AND ≤ 250Cr

## Cache strategy
- GET endpoints: @UseInterceptors(CacheInterceptor) + @CacheTTL(300) via @nestjs/cache-manager
- POST /match: manual Redis cache — key = match:<sha256(userId+entityType)>, TTL 3600s

## Document generation (POST /api/v1/documents/generate)
{ documentType: APPLICATION_LETTER|COMPLIANCE_ACTION_PLAN|PROFILE_REPORT, entityType: BUSINESS|STARTUP }
AI returns { sections: [{ title, content, requiredFields: string[] }] }
POST /api/v1/pdf/render takes filled content → binary PDF via pdfkit

## Datasets (gitignored — place in prisma/data/)
- updated_data.csv → schemes table (700+ rows, upsert on slug)
- startup_funding.csv → startup_funding_records (read-only analytics)
Seed scripts use DIRECT_URL (non-pooled Neon connection) to avoid mid-batch disconnects
