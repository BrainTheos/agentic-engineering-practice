const { db } = require('../connection');

/**
 * @description Retrieves all comments for a given task, ordered by creation time, joined with the commenting user's name.
 * @param {number} taskId - The ID of the task whose comments should be listed.
 * @returns {Object[]} The list of comment rows, each including a `user_name` field.
 */
function listCommentsByTaskId(taskId) {
  return db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at ASC'
  ).all(taskId);
}

/**
 * @description Retrieves a single comment by its ID, joined with the commenting user's name.
 * @param {number} id - The ID of the comment to find.
 * @returns {Object|undefined} The comment row including a `user_name` field, or `undefined` if no comment matches.
 */
function findCommentById(id) {
  return db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?'
  ).get(id);
}

/**
 * @description Inserts a new comment on a task and returns the newly created row.
 * @param {number} taskId - The ID of the task the comment belongs to.
 * @param {number} userId - The ID of the user creating the comment.
 * @param {string} body - The comment text.
 * @returns {Object} The newly inserted comment row.
 */
function insertComment(taskId, userId, body) {
  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, userId, body);
  return findCommentById(result.lastInsertRowid);
}

module.exports = { listCommentsByTaskId, findCommentById, insertComment };
