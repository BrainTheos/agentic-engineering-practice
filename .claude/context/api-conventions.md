# API conventions — adding a new endpoint

These conventions describe the **target structure** for the Taskr API after the planned refactor (see `CLAUDE.md`). The current codebase still has all routes in a single `routes.js` and no `src/` layout — follow these conventions for any new endpoint work regardless, rather than adding to the old flat structure.

## Where routes live

- New routes belong in a dedicated file under `src/routes/`, one file per resource.
- Never add new route logic to the legacy `routes.js`.
- The filename must match the resource name, lowercase, plural (e.g. `src/routes/tags.js` for the `/tags` resource, `src/routes/projects.js` for `/projects`).

## Route file shape

- Each route file exports a named Express `Router` instance — not a default export, not the raw route functions.

```js
// src/routes/tags.js
const express = require('express');
const router = express.Router();

router.get('/', listTags);
router.post('/', createTag);

module.exports = { tagsRouter: router };
```

## Handlers call services — no business logic in routes

- Every route handler calls a corresponding function in `src/services/` (e.g. `src/services/tagsService.js`). The handler's job is to parse the request, call the service, and shape the response — it must not contain query logic, validation logic, or other business logic directly.

```js
// src/routes/tags.js
const { createTag } = require('../services/tagsService');

router.post('/', async (req, res, next) => {
  try {
    const tag = await createTag(req.body);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});
```

## Errors

- Route handlers do not send error responses directly. Pass errors to Express's `next` function.
- Errors passed to `next` must carry a status code and a message object, so the central error handler can respond correctly.

```js
const err = new Error('Tag not found');
err.status = 404;
next(err);
```

## Registering routes

- All routers are registered in `src/index.js` using `app.use(resourcePath, router)`, with the resource path matching the route file's resource (e.g. `app.use('/tags', tagsRouter)`).
- Do not register routes anywhere other than `src/index.js`.
