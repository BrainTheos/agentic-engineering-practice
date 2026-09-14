# Testing standards — Taskr API

## File naming

- Test files follow the naming convention `<resource>.test.js`, all lowercase (e.g. `tags.test.js`, `projects.test.js`, `users.test.js`).
- `package.json`'s `jest.testMatch` is a single `**/tests/*.test.js` glob — every file in `tests/` follows this convention, so no special-casing is needed for new files.

## Tooling

- Tests use Jest and supertest, run against an in-memory SQLite database (`src/db/connection.js` switches to `:memory:` when `NODE_ENV=test`).
- Schema setup uses `createSchema` from `src/db/schema.js` — the same schema module the seed script uses — so tests never drift from the real DB schema.
- No external setup is required — no separate test database, no fixtures to seed by hand beyond what a test creates itself.
- The full suite must be runnable with `npm test` and nothing else.

## Coverage per endpoint

For each endpoint under test, cover:
- The happy path.
- At least two distinct error cases (e.g. invalid/missing input, referencing a resource that doesn't exist, a conflict such as a duplicate unique field, or an unauthorized request where relevant).

## Test descriptions

- Write `describe`/`it` (or `test`) descriptions in plain English describing what the endpoint does from a caller's perspective — not implementation detail.
- Good: `"returns 404 when the task does not exist"`.
- Avoid: `"calls db.prepare with the right SQL"` or other descriptions tied to internal implementation.
