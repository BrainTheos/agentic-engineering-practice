const express = require('express');
const router = express.Router({ mergeParams: true });
const tagsService = require('../services/tags-service');

router.post('/', (req, res, next) => {
  try {
    const result = tagsService.addTagToTask(parseInt(req.params.id), req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:tagId', (req, res, next) => {
  try {
    const result = tagsService.removeTagFromTask(parseInt(req.params.id), parseInt(req.params.tagId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = { taskTagsRouter: router };
