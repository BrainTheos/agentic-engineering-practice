# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Taskr API — a REST API for a task management service (users, projects, tasks, comments, tags). Node.js · Express 5 · SQLite via `better-sqlite3` · Jest + supertest.

## Commands

```bash
npm install
npm run db:seed     # create schema + seed sample data (5 users, 3 projects, 20 tasks, 15 comments, 8 tags)
npm run db:reset     # delete taskr.db and reseed
npm start            # run the server (src/index.js, port 3000 or $PORT)
npm run dev          # run src/index.js with --watch (Node 18+)
npm test             # run the full Jest suite
npm run test:watch   # watch mode
```

Run a single test file: `npx jest tests/tasks.test.js`
Run a single test by name: `npx jest -t "test name"`

Test files follow the `<resource>.test.js` naming convention (e.g. `tags.test.js`, `users.test.js`, `projects.test.js`). `package.json`'s `jest.testMatch` is a single `**/tests/*.test.js` glob — no special-cased filenames.

Tests run against an in-memory SQLite database (`src/db/connection.js` uses `:memory:` when `NODE_ENV=test`), so no setup is needed beyond `npm install`.

## Architecture

**Request flow:** `src/index.js` (app setup, middleware, router mounting) → `src/routes/<resource>-routes.js` (parses the request, calls a service, shapes the response, forwards errors via `next(err)`) → `src/services/<resource>-service.js` (validation, business rules, throws `Error` objects with a `.status` property on failure) → `src/db/queries/<resource>-queries.js` (the only place with `db.prepare(...)` calls) → `src/db/connection.js` (the single `better-sqlite3` connection).

This layering is strict and intentional:

- **Routes never touch the database.** No `db.prepare(...)` in `src/routes/`.
- **Services never touch `req`/`res`.** They take plain arguments, return plain values, and throw `.status`-tagged `Error`s for the route to catch and pass to `next()`. `src/middleware/error-handler.js` is the one place that formats an error into an HTTP response.
- **Queries are pure data access.** Each `src/db/queries/<resource>-queries.js` file owns the SQL for its resource; no validation or business logic there.
- When adding new routes or logic, follow this chain — don't put `db.prepare` in a route handler or validation logic in a queries file, even to match a nearby example faster.

Know these facts before making changes:

- **Comments and task-tags are nested but independent resources.** `src/routes/comments-routes.js` (mounted at `/tasks/:id/comments`) and `src/routes/task-tags-routes.js` (mounted at `/tasks/:id/tags`) each use `express.Router({ mergeParams: true })` so they can read the parent task's `:id`. They are registered directly in `src/index.js`, same as every other route file.
- **Auth is a placeholder.** `src/middleware/authenticate.js` checks a static `x-api-key` header against `API_KEY`/`dev-key` — not real JWT/session auth. Only `DELETE /users/:id` and `DELETE /projects/:id` are gated by it; `DELETE /tasks/:id` and other mutating routes are unauthenticated. This inconsistency is known and preserved, not a bug to silently fix as a drive-by.
- **Email is stubbed.** `src/services/send-email.js` just logs and resolves — `users-service.js`'s `createUser` calls it synchronously in the request path, so account creation is coupled to a "notification" concern that would normally be async/queued.
- **Error handling uses `next(err)`.** Route handlers wrap their service call in `try/catch` and call `next(err)` on failure — they never call `res.status(...)` directly for an error case. `src/middleware/error-handler.js` is the single place that reads `err.status`/`err.message` and formats the response.

## Naming conventions

All files under `src/` use kebab-case, suffixed by layer:

| Layer | Pattern | Example |
|---|---|---|
| Routes | `<plural-resource>-routes.js` | `tasks-routes.js` |
| Services | `<plural-resource>-service.js` | `tasks-service.js` |
| Queries | `<plural-resource>-queries.js` | `tasks-queries.js` |
| Tests | `<plural-resource>.test.js` | `tasks.test.js` |
| Middleware | `<verb-noun>.js`, no resource stem | `error-handler.js`, `authenticate.js` |

See `.claude/context/api-conventions.md` for the full convention with code examples.

## Data model

SQLite tables (see `src/db/schema.js` for the DDL, shared by `src/db/seed.js` and the test suite): `users`, `projects` (owner_id → users), `tasks` (project_id → projects, assignee_id → users, status is `active`/`completed`/`archived`, enforced by both a CHECK constraint and `VALID_TASK_STATUSES` in `src/config.js`), `comments` (task_id, user_id), `tags`, `task_tags` (join table).

## Resources / base paths

| Resource | Base path |
|---|---|
| Users | `/users` |
| Projects | `/projects` |
| Tasks | `/tasks` |
| Comments | `/tasks/:id/comments` |
| Tags | `/tags` |

## Context files

- For any task involving API routes or endpoints, read `.claude/context/api-conventions.md`.
- For any task involving tests or test coverage, read `.claude/context/testing-standards.md`.

## Never do these things

- **Never put `db.prepare(...)` calls in a route or service file.** Database access belongs only in `src/db/queries/<resource>-queries.js`.
- **Never put validation or business logic in a route file.** Routes parse the request, call a service, shape the response, and forward errors via `next(err)` — nothing else.
- **Never add new utility functions to `src/utils/helpers.js`** without first checking whether they belong in a more specific module instead.
- **Never re-introduce a `misc/` directory or a monolithic `routes.js`.** Both were removed in the `src/` restructure; new code should extend the existing per-resource routes/services/queries files or add new ones following the same pattern.
