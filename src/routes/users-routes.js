const express = require('express');
const router = express.Router();
const usersService = require('../services/users-service');
const { authenticate } = require('../middleware/authenticate');

router.get('/', (req, res, next) => {
  try {
    res.json(usersService.listUsers());
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await usersService.createUser(req.body.name, req.body.email);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const user = usersService.getUserById(parseInt(req.params.id));
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const user = await usersService.updateUser(parseInt(req.params.id), req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await usersService.deleteUser(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = { usersRouter: router };
