const express = require('express');
const router = express.Router();
const tagsService = require('../services/tags-service');

router.get('/', (req, res, next) => {
  try {
    res.json(tagsService.listTags());
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const tag = tagsService.createTag(req.body);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

module.exports = { tagsRouter: router };
