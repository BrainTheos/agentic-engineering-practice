# API conventions — adding a new endpoint

These conventions describe the actual structure of the Taskr API after the `src/` restructure (see `CLAUDE.md`). Routes live in `src/routes/`, business logic in `src/services/`, and database access in `src/db/queries/`. Follow these conventions for any new endpoint work.

## Where routes live

- New routes belong in a dedicated file under `src/routes/`, one file per resource.
- Never add new route logic to `routes.js` — that file no longer exists; every resource has its own route file.
- The filename is kebab-case, plural resource name plus `-routes` (e.g. `src/routes/tags-routes.js` for the `/tags` resource, `src/routes/projects-routes.js` for `/projects`).

## Route file shape

- Each route file exports a named Express `Router` instance, keyed by resource (e.g. `tagsRouter`) — not a default export, not the raw route functions.

```js
// src/routes/tags-routes.js
const express = require('express');
const router = express.Router();

router.get('/', listTags);
router.post('/', createTag);

module.exports = { tagsRouter: router };
```

## Handlers call services — no business logic in routes

- Every route handler calls a corresponding function in `src/services/<resource>-service.js` (e.g. `src/services/tags-service.js`). The handler's job is to parse the request, call the service, and shape the response — it must not contain query logic, validation logic, or other business logic directly.

```js
// src/routes/tags-routes.js
const tagsService = require('../services/tags-service');

router.post('/', (req, res, next) => {
  try {
    const tag = tagsService.createTag(req.body);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});
```

## Services call queries — no database access in services

- Every service function that needs data calls a corresponding function in `src/db/queries/<resource>-queries.js` (e.g. `src/db/queries/tags-queries.js`). Services own validation and business rules; queries own `db.prepare(...)` calls and nothing else.
- Services must not import `req`/`res` or format HTTP responses — that stays in the route file.

## Errors

- Route handlers do not send error responses directly. Pass errors to Express's `next` function.
- Errors passed to `next` must carry a status code on `.status`, so the central error handler (`src/middleware/error-handler.js`) can respond correctly.

```js
const err = new Error('Tag not found');
err.status = 404;
throw err; // caught by the route's try/catch, which calls next(err)
```

## Registering routes

- All routers are registered in `src/index.js` using `app.use(resourcePath, router)`, with the resource path matching the route file's resource (e.g. `app.use('/tags', tagsRouter)`).
- Do not register routes anywhere other than `src/index.js`.
- Routes nested under another resource (e.g. `/tasks/:id/comments`) use `express.Router({ mergeParams: true })` so the parent's route params are available, and are still registered only in `src/index.js`.

## Naming conventions

| Layer | Pattern | Example |
|---|---|---|
| Routes | `<plural-resource>-routes.js` | `tags-routes.js` |
| Services | `<plural-resource>-service.js` | `tags-service.js` |
| Queries | `<plural-resource>-queries.js` | `tags-queries.js` |
| Tests | `<plural-resource>.test.js` | `tags.test.js` |

All filenames are kebab-case throughout `src/`.
