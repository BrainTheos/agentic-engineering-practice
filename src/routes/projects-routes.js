const express = require('express');
const router = express.Router();
const projectsService = require('../services/projects-service');
const { authenticate } = require('../middleware/authenticate');

router.get('/', (req, res, next) => {
  try {
    res.json(projectsService.listProjects());
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const project = projectsService.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const project = projectsService.getProjectById(parseInt(req.params.id));
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const project = projectsService.updateProject(parseInt(req.params.id), req.body);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, (req, res, next) => {
  try {
    const result = projectsService.deleteProject(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = { projectsRouter: router };
