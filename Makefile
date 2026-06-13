.PHONY: install dev build start debug \
        lint format \
        test test-watch test-cov \
        db-generate db-migrate db-deploy db-xor db-seed db-reset db-studio \
        docker-up docker-down docker-rebuild docker-prod-up docker-prod-down docker-logs \
        clean help

# ── Dev ─────────────────────────────────────────────────────────────────────────

install:          ## Install dependencies
	npm ci

dev:              ## Start hot-reload dev server (port 3000)
	npm run start:dev

build:            ## Compile TypeScript to dist/
	npm run build

start:            ## Run compiled production binary
	npm run start

debug:            ## Start with debugger attached (port 9229)
	npm run start:debug

# ── Code quality ────────────────────────────────────────────────────────────────

lint:             ## Lint and auto-fix with ESLint
	npm run lint

format:           ## Format source files with Prettier
	npm run format

# ── Tests ───────────────────────────────────────────────────────────────────────

test:             ## Run all unit tests
	npm run test

test-watch:       ## Run tests in watch mode
	npm run test:watch

test-cov:         ## Run tests with coverage report
	npm run test:cov

# ── Database / Prisma ────────────────────────────────────────────────────────────

db-generate:      ## Regenerate Prisma client after schema changes
	npx prisma generate

db-migrate:       ## Create and apply a new migration (dev only)
	npx prisma migrate dev

db-deploy:        ## Apply pending migrations (CI / production)
	npx prisma migrate deploy

db-xor:           ## Apply raw XOR CHECK constraints (run once after first migrate deploy)
	psql "$(DIRECT_URL)" -f prisma/migrations/001_xor_constraints.sql

db-seed:          ## Seed schemes + startup funding from CSVs in prisma/data/
	npm run prisma:seed

db-reset:         ## Drop and recreate DB then re-seed (dev only — destructive!)
	npx prisma migrate reset --force && npm run prisma:seed

db-studio:        ## Open Prisma Studio GUI
	npx prisma studio

# ── Docker ──────────────────────────────────────────────────────────────────────

docker-up:        ## Start dev stack (app + redis) in the foreground
	docker-compose up

docker-down:      ## Stop and remove dev containers
	docker-compose down

docker-rebuild:   ## Rebuild images from scratch and restart (use after npm install / package.json changes)
	docker-compose down -v
	docker-compose up --build

docker-prod-up:   ## Start production stack (detached)
	docker-compose -f docker-compose.prod.yml up -d

docker-prod-down: ## Stop production stack
	docker-compose -f docker-compose.prod.yml down

docker-logs:      ## Tail app container logs
	docker-compose logs -f app

# ── Misc ────────────────────────────────────────────────────────────────────────

clean:            ## Remove build artefacts and logs
	rm -rf dist logs coverage

help:             ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
