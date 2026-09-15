const { db } = require('../connection');

/**
 * @description Retrieves all tags, ordered alphabetically by name.
 * @returns {Object[]} The list of tag rows.
 */
function listTags() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

/**
 * @description Retrieves a single tag by its ID.
 * @param {number} id - The ID of the tag to find.
 * @returns {Object|undefined} The tag row, or `undefined` if no tag matches.
 */
function findTagById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

/**
 * @description Inserts a new tag and returns the newly created row.
 * @param {string} name - The tag name.
 * @returns {Object} The newly inserted tag row.
 */
function insertTag(name) {
  const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
  return findTagById(result.lastInsertRowid);
}

/**
 * @description Associates a tag with a task.
 * @param {number} taskId - The ID of the task to tag.
 * @param {number} tagId - The ID of the tag to apply.
 * @returns {void}
 */
function insertTaskTag(taskId, tagId) {
  db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
}

/**
 * @description Removes a tag association from a task.
 * @param {number} taskId - The ID of the task to remove the tag from.
 * @param {number} tagId - The ID of the tag to remove.
 * @returns {import('better-sqlite3').RunResult} The result of the delete statement, including the number of rows changed.
 */
function deleteTaskTag(taskId, tagId) {
  return db.prepare('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?').run(taskId, tagId);
}

module.exports = { listTags, findTagById, insertTag, insertTaskTag, deleteTaskTag };
