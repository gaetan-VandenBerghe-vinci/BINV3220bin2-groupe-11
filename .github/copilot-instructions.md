# Project Guidelines

## Build, test, and lint

- Use Node.js `>=22.14.0` (Node 24 LTS is recommended). Install the locked dependencies with `npm ci`.
- From the repository root, run `npm run setup` once to create `backend/.env` and initialize the demo SQLite database.
- Start both applications with `npm run dev`: the API listens on `http://localhost:3000` and Vite serves the frontend on `http://localhost:5173`.
- Run the complete validation pipeline with `npm run check` (lint, TypeScript checks, tests, and builds).
- Run individual workspace checks with `npm run lint -w backend`, `npm run typecheck -w backend`, `npm run lint -w frontend`, or `npm run typecheck -w frontend`.
- Run all tests with `npm test` or `npm run test --workspaces`.
- Run one test file with `npm run test -w backend -- tests/companies.test.ts` or `npm run test -w frontend -- tests/CompaniesPage.test.tsx`. Add Vitest filters after `--`, for example `npm run test -w backend -- tests/auth.test.ts -t "rejects invalid tokens"`.
- Rebuild/reset development data with `npm run db:init` or `npm run db:reset`; stop the dev server before resetting the database.

See [README.md](../README.md) for setup and troubleshooting, [docs/architecture.md](../docs/architecture.md) for implemented flows, [backend/API.md](../backend/API.md) for the HTTP contract, and [docs/seed.md](../docs/seed.md) for stable demo data and identities.

## Architecture

- This is an npm-workspaces monorepo: `backend/` is a Node.js/Express API backed by `better-sqlite3`, and `frontend/` is a React/Vite single-page application.
- Backend requests flow through `controllers -> services -> repositories -> SQLite`. `app.ts` constructs and wires these layers plus authentication, authorization, and error middleware. Controllers validate HTTP input and format responses; services contain business rules and never receive Express `Request` or `Response`; repositories own SQL and return database objects; mappers convert database objects to domain/API models.
- Backend authentication is request-time: the token carries only `{ kind, id }`, while `authenticate` reloads the account, roles, and companies from SQLite. Use named rules in `services/permissions.ts` with `authorize` and enforce access in services as well as routes where visibility is filtered.
- Backend tests use the complete assembled app with an in-memory SQLite database (`tests/helpers/testApp.ts` and `testDatabase.ts`), rather than the development database.
- Frontend follows `pages -> hooks -> services/utils -> models`, with reusable presentational components below pages. `App.tsx` is the sole caller of `useAuth`; pass the session token and logout/unauthorized callback down to pages. API services validate JSON through the existing type guards, and a 401 returns the user to login.
- Vite proxies frontend `/api/...` requests to the backend and removes `/api`; backend routes themselves do not include that prefix.

## Conventions

- Keep backend relative imports with `.ts` extensions. TypeScript rewrites them to `.js` during the backend build; frontend imports also use explicit `.ts`/`.tsx` extensions.
- Add schema changes as a new ordered SQL file under `backend/src/db/migrations/` (for example `002_description.sql`). Never edit an already-applied migration.
- Keep database constraints and allowed status values in SQLite; keep authorization, visibility, and status-transition rules in services. Status codes are English in storage/API, while the frontend translates them to French labels.
- Send the session token directly as the `Authorization` header value; do not add a `Bearer` prefix. Use `HttpError(status, code, message)` for expected backend failures so `errorHandler` returns `{ "error": { "code", "message" } }`.
- Keep frontend API calls behind services, normalize query input there, validate response shapes with guards, and preserve abort handling in hooks for cancellable requests.
- Treat demo authentication as development-only. Do not weaken the production guard around `DEMO_AUTH_ENABLED`, and do not rely on frontend-only permission hiding.
- When adding or changing an API route, update `backend/API.md` and the corresponding `backend/http/*.http` request examples. Add tests for successful behavior and relevant HTTP error cases.
- Follow the repository pull request checklist in [.github/pull_request_template.md](./pull_request_template.md), including documentation and migration checks.
