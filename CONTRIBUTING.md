# Contributing to Taskr API

## Setting up your development environment

Requirements: Node.js 18+ (for `npm run dev`'s `--watch` flag).

```bash
git clone <repo-url>
cd agentic-engineering-practice
npm install
npm run db:seed
```

`npm run db:seed` creates the SQLite schema and seeds sample data (5 users, 3 projects, 20 tasks, 15 comments, 8 tags) into `taskr.db` in the project root. No external database is required.

Start the server:

```bash
npm start        # plain run, port 3000 (or $PORT)
npm run dev       # same, with file-watching restart
```

Visit `http://localhost:3000/health` to confirm it's running.

If your local `taskr.db` gets into a bad state, reset it:

```bash
npm run db:reset
```

This deletes `taskr.db` and reseeds from scratch.

## Project structure

Before making changes, read [CLAUDE.md](CLAUDE.md) for the full architecture. In short, requests flow through a strict layering:

```
routes/<resource>-routes.js  → parses request, calls a service, shapes response
services/<resource>-service.js → validation, business rules, throws .status-tagged Errors
db/queries/<resource>-queries.js → the only place with db.prepare(...) calls
```

Routes never touch the database, services never touch `req`/`res`, and queries never contain validation logic. See `.claude/context/api-conventions.md` for a worked example when adding a new endpoint.

## Running the test suite

Tests run against an in-memory SQLite database, so there's no setup beyond `npm install`.

```bash
npm test              # run the full Jest suite
npm run test:watch     # watch mode
```

Run a single test file:

```bash
npx jest tests/tasks.test.js
```

Run a single test by name:

```bash
npx jest -t "test name"
```

### What a passing run looks like

Every test file (`tests/<resource>.test.js`) should report all its tests passing, with a summary like:

```
Test Suites: N passed, N total
Tests:       N passed, N total
```

Zero failures, zero skipped tests you didn't intentionally skip. If a test fails, that's a real problem to fix — either the implementation is wrong, or (less often) the test itself needs correcting.

## The verify-app command

Before committing any significant change, run `/verify-app`. It runs the full Jest suite serially (`npm test -- --runInBand`) — since the suite uses supertest against every API endpoint, a passing run confirms the whole application is working, not just the piece you touched.

Run `/verify-app` after:

- Adding or changing a route, service, or query function
- Changing the database schema or seed data
- Any refactor that touches more than one layer (routes/services/queries)

If tests fail, fix the implementation and re-run `/verify-app` until it passes. **Do not commit while any test is failing.**

## Commit message convention

Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>: <description>`, imperative mood, no trailing period.

Common types used in this repo: `feat`, `fix`, `docs`, `refactor`, `chore`.

Examples from this project's history:

```
feat: add verify-app command, Stop hook logging, and verification workflow docs
fix: correct invalid Bash permission rules in settings.json
refactor: restructure into src/ with routes -> services -> queries layering
docs: add CLAUDE.md and Claude Code project context files
```

## Before opening a pull request

1. Run `/verify-app` and confirm it passes.
2. Make sure new code follows the naming conventions in [CLAUDE.md](CLAUDE.md) (kebab-case, layer-suffixed files).
3. Commit with a Conventional Commits message.
