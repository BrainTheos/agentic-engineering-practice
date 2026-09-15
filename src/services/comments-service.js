const commentsQueries = require('../db/queries/comments-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const usersQueries = require('../db/queries/users-queries');
const { isNonEmptyString } = require('../utils/helpers');

/**
 * @description Retrieves all comments for a task, verifying that the task exists first.
 * @param {number} taskId - The ID of the task whose comments should be listed.
 * @returns {Object[]} The list of comment rows for the task.
 * @throws {Error} A 404 error if the task does not exist.
 */
function listCommentsForTask(taskId) {
  const task = tasksQueries.findTaskById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  return commentsQueries.listCommentsByTaskId(taskId);
}

/**
 * @description Validates input and creates a new comment on a task.
 * @param {number} taskId - The ID of the task to comment on.
 * @param {Object} data - The comment payload.
 * @param {number|string} data.user_id - The ID of the user creating the comment.
 * @param {string} data.body - The comment text.
 * @returns {Object} The newly created comment row.
 * @throws {Error} A 404 error if the task or referenced user doesn't exist, or a 400 error if `body`/`user_id` are missing or invalid.
 */
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
