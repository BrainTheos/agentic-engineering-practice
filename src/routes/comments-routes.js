const express = require('express');
const router = express.Router({ mergeParams: true });
const commentsService = require('../services/comments-service');

router.get('/', (req, res, next) => {
  try {
    const comments = commentsService.listCommentsForTask(parseInt(req.params.id));
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const comment = commentsService.createComment(parseInt(req.params.id), req.body);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

module.exports = { commentsRouter: router };
