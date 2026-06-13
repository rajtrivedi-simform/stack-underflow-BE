# Task Tracker

*This file maintains logs of completed tasks and current task progress to preserve context across sessions. Keep entries precise and token-friendly.*

## Current Tasks
- *(No current tasks)*

## Completed Tasks
- [x] Initialized context logging system (`task.md` creation and rules update).
- [x] Fixed `MODULE_NOT_FOUND` on startup by adding `prisma` to `tsconfig.build.json` exclude list so that NestJS compiles `main.ts` into the `dist/` root correctly.
- [x] Resolved Config validation error for `DIRECT_URL` by configuring the non-pooled PostgreSQL URL in `.env`.
- [x] Fixed `TypeError: compression_1.default is not a function` by changing the default import to a namespace import (`import * as compression from 'compression';`) in `src/main.ts`.
- [x] Generated `postman_collection.json` containing endpoints and sample DTO-based data.
- [x] Fixed OpenAI 429 TPM Rate Limit error by optimization of prompt sizes, state-filtering, token guards, and scheme caps.
- [x] Resolved OpenAI 400 parameter error by dynamically mapping `max_tokens` to `max_completion_tokens` for newer/reasoning models (gpt-5, o1, o3).
