const express = require('express');
const router = express.Router();
const tasksService = require('../services/tasks-service');

router.get('/', (req, res, next) => {
  try {
    const tasks = tasksService.listTasks(req.query);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const task = tasksService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const task = tasksService.getTaskById(parseInt(req.params.id));
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const task = tasksService.updateTask(parseInt(req.params.id), req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const result = tasksService.deleteTask(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = { tasksRouter: router };
