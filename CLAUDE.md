# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Taskr API — a REST API for a task management service (users, projects, tasks, comments, tags). Node.js · Express 5 · SQLite via `better-sqlite3` · Jest + supertest.

## Commands

```bash
npm install
npm run db:seed     # create schema + seed sample data (5 users, 3 projects, 20 tasks, 15 comments, 8 tags)
npm run db:reset     # delete taskr.db and reseed
npm start            # run the server (port 3000, or $PORT)
npm run dev          # run with --watch (Node 18+)
npm test             # run the full Jest suite
npm run test:watch   # watch mode
```

Run a single test file: `npx jest tests/tasks.test.js`
Run a single test by name: `npx jest -t "test name"`

Note the `jest.testMatch` config in `package.json` explicitly lists `tests/userTest.js` and `tests/test-projects.js` in addition to the standard `**/tests/*.test.js` glob — those two files don't follow the `*.test.js` naming convention but are still part of the suite.

New test files should follow the `<resource>.test.js` naming convention (e.g. `tags.test.js`). The current inconsistent naming in `tests/` (`userTest.js`, `test-projects.js`) is a known problem that will be standardized in a future cleanup — don't copy that naming for new files.

Tests run against an in-memory SQLite database (`DB.js` uses `:memory:` when `NODE_ENV=test`), so no setup is needed beyond `npm install`.

## Architecture

**Request flow:** `index.js` (app setup, two inline routes, error handler) → `routes.js` (all resource routes) → either direct `db.prepare(...)` calls or a controller/helper module → `DB.js` (the single `better-sqlite3` connection).

**This codebase is intentionally inconsistent** — it's a practice/training repo with real architectural debt baked in on purpose (see the TODO comments throughout), and that debt is slated to be addressed in a future refactor (repository layer, shared validation middleware, splitting `routes.js` per resource, etc. — see the TODOs at the top of `routes.js`). Until that refactor happens:

- Understand these patterns as known, tracked debt — not as the intended long-term design.
- Don't reinforce them. When adding new routes or logic, don't copy the inline-`db.prepare`-in-route-handler style or duplicate inline validation just to "match the existing style" — prefer going through `UserController`-style separation, or flag the inconsistency instead of extending it.
- Don't casually "clean up" one of these patterns as a drive-by inside an unrelated change either — a real refactor here is a deliberate, scoped task, not incidental to some other fix.

Know these facts before making changes:

- **No service/repository layer.** Most routes in `routes.js` query the database inline with `db.prepare(...)`. The **Users** resource is the exception — it delegates to `UserController.js`. Don't assume other resources follow the same pattern; check the specific route.
- **Circular dependency between `routes.js` and `projectHelpers.js`.** `projectHelpers.js:formatProjectSummary` does a lazy `require('./routes')` inside the function body specifically to avoid a load-time circular import (`routes.js` requires `DB`/`UserController`/etc., and `projectHelpers` requires back into `routes` for `getTasksForProject`). If you touch either file, preserve the lazy require or the app will fail to boot.
- **`misc/oldRoutes.js` and `misc/temp.js` are dead code** kept for reference/rollback — not wired into `index.js` or `routes.js`. Don't extend them; don't assume they run.
- **`misc/constants.js`** also holds two helper functions (`formatError`, `paginate`) that arguably belong in `utils.js` — this is called out in a comment in that file, not a bug to silently "fix" as a drive-by.
- **Auth is a placeholder.** `auth.js`'s `authenticate` middleware checks a static `x-api-key` header against `API_KEY`/`dev-key` — not real JWT/session auth. Only `DELETE /users/:id` and `DELETE /projects/:id` are gated by it; other mutating routes are unauthenticated.
- **Email is stubbed.** `sendEmail.js` just logs and resolves — `UserController.createUser` calls it synchronously in the request path, so account creation is coupled to a "notification" concern that would normally be async/queued.
- **Validation is inline per-route**, not centralized middleware — expect to see the same `isNonEmptyString`/`validateEmail` (from `utils.js`) checks repeated across handlers rather than a shared validator.

## Data model

SQLite tables (see `db/seed.js` for the schema): `users`, `projects` (owner_id → users), `tasks` (project_id → projects, assignee_id → users, status is `active`/`completed`/`archived`, enforced by both a CHECK constraint and `VALID_TASK_STATUSES` in `misc/constants.js`), `comments` (task_id, user_id), `tags`, `task_tags` (join table).

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

- **Never add new route logic to `routes.js`.** It is already too large. Any new routes belong in a dedicated route file for that resource.
- **Never add new utility functions to `utils.js`** without first checking whether they belong in a more specific module instead.
- **Never import from `misc/oldRoutes.js` or `misc/temp.js`.** That code is dead and scheduled for removal.
