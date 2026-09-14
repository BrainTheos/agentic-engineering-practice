const commentsQueries = require('../db/queries/comments-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const usersQueries = require('../db/queries/users-queries');
const { isNonEmptyString } = require('../utils/helpers');

function listCommentsForTask(taskId) {
  const task = tasksQueries.findTaskById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  return commentsQueries.listCommentsByTaskId(taskId);
}

function createComment(taskId, { user_id, body }) {
  const task = tasksQueries.findTaskById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  if (!body || !isNonEmptyString(body)) {
    const err = new Error('body is required');
    err.status = 400;
    throw err;
  }
  if (!user_id) {
    const err = new Error('user_id is required');
    err.status = 400;
    throw err;
  }
  const user = usersQueries.findUserById(parseInt(user_id));
  if (!user) {
    const err = new Error('user not found');
    err.status = 400;
    throw err;
  }
  return commentsQueries.insertComment(taskId, parseInt(user_id), body);
}

module.exports = { listCommentsForTask, createComment };
