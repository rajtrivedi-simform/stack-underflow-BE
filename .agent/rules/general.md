---
trigger: always_on
---

# VyaparSetu — Backend Instructions

## Stack

NestJS 10 · TypeScript (strict) · Prisma · PostgreSQL · ioredis · OpenAI SDK · Winston · Zod

---

## Agent behaviour

- **Be concise.** Prefer code over explanation. Only explain when logic is non-trivial.
- **Stay scoped.** Analyse only the current file, directly imported files, and files explicitly referenced in the prompt. Do not scan the repository broadly.
- **Search only when needed.** Use specific queries (class names, method names, exact identifiers). Do not search broadly for "auth logic" or "database layer".
- **Surgical edits.** Modify only what the task requires. Do not rewrite unrelated modules, alter existing controller routes, or change service signatures unless required.
- **Follow existing patterns.** Match the module structure, DI pattern, and error handling approach already in the codebase.
- **No guessing.** Ask for clarification rather than making broad assumptions about missing context.
- **No fluff.** No placeholder comments, no unused variables, no dead code, no over-engineering.

---

## Project structure

```
src/
├── common/
│   ├── exceptions/         # Custom domain exceptions
│   ├── filters/            # Global HTTP exception filter
│   ├── interceptors/       # Logging interceptor
│   └── pipes/              # ZodValidationPipe
├── config/                 # NestJS ConfigModule setup
├── logger/                 # WinstonLoggerService
├── prisma/                 # PrismaService (global module)
├── cache/                  # CacheService wrapping ioredis (global module)
└── modules/
    ├── business/
    │   ├── business.module.ts
    │   ├── business.controller.ts
    │   ├── business.service.ts
    │   ├── business.controller.spec.ts
    │   ├── business.service.spec.ts
    │   ├── schemas/             # Zod schemas for this module
    │   └── types/               # TypeScript types for this module
    ├── matching/
    ├── compliance/
    ├── llm/
    ├── pdf/
    └── form-mapping/
```

Every module follows the same layout. Do not deviate.

---

## TypeScript

- `strict: true` is enforced — no exceptions.
- Never use `any`. Use `unknown` and narrow, or define a precise type.
- Every method must declare its return type explicitly, including `async` methods.
- All Prisma query results must be typed using generated Prisma types — never cast to `any`.
- Use `z.infer<typeof schema>` to derive types from Zod schemas — do not duplicate definitions.

```typescript
// Correct
async matchProfile(dto: MatchProfileDto): Promise<MatchResultDto> { ... }

// Wrong — missing return type
async matchProfile(dto: MatchProfileDto) { ... }
```

---

## Validation

- Use **Zod exclusively** for validation. Do not use `class-validator` or `class-transformer`.
- Define schemas in `src/modules/<name>/schemas/`. Export the schema and its inferred type together.
- Apply `ZodValidationPipe` globally or per-controller using the `@UsePipes()` decorator.
- Validate all external payloads: HTTP request bodies, OpenAI responses, Prisma results that include dynamic `Json` fields.
- Strip unknown fields from validated input using `.strict()` or `.strip()` as appropriate.

```typescript
// src/modules/business/schemas/create-business.schema.ts
export const createBusinessSchema = z.object({
  businessName: z.string().min(1).max(200),
  sector: SectorEnum,
  annualTurnover: z.number().positive(),
  district: z.string().min(1),
  taluka: z.string().min(1),
});

export type CreateBusinessDto = z.infer<typeof createBusinessSchema>;
```

---

## NestJS module pattern

Each module must follow this pattern exactly:

```typescript
// business.module.ts
@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
```

- Controllers handle HTTP — no business logic, no Prisma calls.
- Services handle business logic — injected via constructor DI.
- Global providers (PrismaService, CacheService, WinstonLoggerService) are available everywhere without re-importing.

---

## Error handling

- Throw NestJS built-in HTTP exceptions from services: `NotFoundException`, `BadRequestException`, `ConflictException`, `InternalServerErrorException`.
- For domain-specific errors, extend `HttpException` in `src/common/exceptions/`.
- The global `HttpExceptionFilter` in `src/common/filters/` handles all unhandled exceptions — do not duplicate error formatting in controllers.
- Never expose raw stack traces or Prisma error details in HTTP responses.
- Log every caught error with Winston before rethrowing or responding.

```typescript
async findBusiness(id: string): Promise<Business> {
  const business = await this.prisma.business.findUnique({ where: { id } });
  if (!business) {
    throw new NotFoundException(`Business ${id} not found`);
  }
  return business;
}
```

---

## Logging (Winston)

- Inject `WinstonLoggerService` in every service. Never use `console.log` or `console.error`.
- Declare the logger as a class property with an explicit type.
- Log levels:
  - `error` — caught exceptions and failures
  - `warn` — degraded states (cache miss causing DB fallback, retry attempt)
  - `info` — key operations (profile matched, PDF generated, cache populated)
  - `debug` — detailed traces for development only
- Always include structured context: `{ method, id, durationMs }`. Never log PII (names, phone, PAN, Aadhaar).

```typescript
export class MatchingService {
  private readonly logger: WinstonLoggerService;

  constructor(logger: WinstonLoggerService) {
    this.logger = logger;
  }

  async matchProfile(dto: MatchProfileDto): Promise<MatchResultDto> {
    this.logger.info("MatchingService.matchProfile started", {
      sector: dto.sector,
    });
    try {
      // ...
    } catch (error: unknown) {
      this.logger.error("MatchingService.matchProfile failed", { error });
      throw new InternalServerErrorException("Matching failed");
    }
  }
}
```

---

## Prisma

- Import and use generated Prisma types directly — do not redefine model shapes manually.
- Use `prisma.$transaction()` for operations that must be atomic.
- Never call Prisma directly from a controller — always through a service.
- Handle `PrismaClientKnownRequestError` explicitly where record-not-found or unique constraint violations are expected.

```typescript
import { Prisma } from '@prisma/client';

async createBusiness(dto: CreateBusinessDto): Promise<Prisma.BusinessGetPayload<{}>> {
  try {
    return await this.prisma.business.create({ data: dto });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Business already exists');
    }
    throw error;
  }
}
```

---

## Cache (Redis)

- All Redis operations go through `CacheService` — never import `ioredis` directly in a module.
- Key naming convention: `<entity>:<identifier>` — e.g., `match:<sha256>`, `schemes:all`, `compliance:<sector>`.
- Always handle cache misses gracefully — fall through to the database.
- Log cache hits at `debug` level; log cache misses at `debug` level.

```typescript
async getSchemes(): Promise<Scheme[]> {
  const cached = await this.cache.get<Scheme[]>('schemes:all');
  if (cached) return cached;

  const schemes = await this.prisma.scheme.findMany({ where: { isActive: true } });
  await this.cache.set('schemes:all', schemes, 86400);
  return schemes;
}
```

---

## Testing

- Unit tests only. No e2e. No integration tests.
- One spec file per controller (`<name>.controller.spec.ts`) and one per service (`<name>.service.spec.ts`).
- Mock `PrismaService`, `CacheService`, `WinstonLoggerService`, and `LLMService` using `jest.fn()` — do not spin up real connections.
- Test: happy path, Zod validation rejection, service exception propagation, cache hit vs. miss branches.
- Do not test NestJS DI wiring. Test logic only.
- All test functions must have explicit return types.

```typescript
describe("BusinessService", (): void => {
  let service: BusinessService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async (): Promise<void> => {
    const module = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: PrismaService,
          useValue: { business: { findUnique: jest.fn() } },
        },
      ],
    }).compile();

    service = module.get(BusinessService);
    prisma = module.get(PrismaService);
  });

  it("throws NotFoundException when business does not exist", async (): Promise<void> => {
    prisma.business.findUnique.mockResolvedValue(null);
    await expect(service.findBusiness("nonexistent-id")).rejects.toThrow(
      NotFoundException,
    );
  });
});
```

---

## Comments

- Comment non-trivial business logic only: complex eligibility rules, multi-step LLM prompt construction, Redis key invalidation strategies.
- Do not comment obvious code. Naming should be self-documenting.
- Use JSDoc only for exported service methods with non-obvious side effects or parameters.
- No placeholder comments: no `// TODO`, `// implement later`, `// fix this`.

---

## What to avoid

- `any` type — anywhere
- `console.log` / `console.error` — use WinstonLoggerService
- `class-validator` / `class-transformer` — use Zod
- Direct Prisma calls in controllers
- Inline Zod schemas inside controllers or services — define in `schemas/`
- Exposing raw Prisma errors or stack traces in HTTP responses
- Cross-module Prisma queries — go through the owning module's service
- Rewriting entire modules when only a method needs to change
- Adding new global middleware or interceptors without checking what exists in `src/common/`

---

## Task Management & Context

- Maintain a `task.md` at the project root to log completed tasks and track current progress.
- Keep entries precise, concise, and token-friendly to preserve context across sessions.
- Update this file whenever meaningful progress is made or a task is finished.