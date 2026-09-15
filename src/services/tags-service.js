const tagsQueries = require('../db/queries/tags-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const { isNonEmptyString } = require('../utils/helpers');

/**
 * @description Retrieves all tags.
 * @returns {Object[]} The list of tag rows.
 */
function listTags() {
  return tagsQueries.listTags();
}

/**
 * @description Validates input and creates a new tag, normalizing its name to lowercase.
 * @param {Object} data - The tag payload.
 * @param {string} data.name - The tag name.
 * @returns {Object} The newly created tag row.
 * @throws {Error} A 400 error if `name` is missing or invalid, or a 409 error if the tag already exists.
 */
function createTag({ name }) {
  if (!name || !isNonEmptyString(name)) {
    const err = new Error('name is required');
    err.status = 400;
    throw err;
  }
  try {
    return tagsQueries.insertTag(name.toLowerCase().trim());
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      const dupErr = new Error('tag already exists');
      dupErr.status = 409;
      throw dupErr;
    }
    throw err;
  }
}

/**
 * @description Validates input and applies an existing tag to a task.
 * @param {number} taskId - The ID of the task to tag.
 * @param {Object} data - The request payload.
 * @param {number|string} data.tag_id - The ID of the tag to apply.
 * @returns {{task_id: number, tag_id: number}} Confirmation of the created task/tag association.
 * @throws {Error} A 404 error if the task or tag doesn't exist, a 400 error if `tag_id` is missing, or a 409 error if the tag is already applied.
 */
function addTagToTask(taskId, { tag_id }) {
  const task = tasksQueries.findTaskById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  if (!tag_id) {
    const err = new Error('tag_id is required');
    err.status = 400;
    throw err;
  }
  const tag = tagsQueries.findTagById(parseInt(tag_id));
  if (!tag) {
    const err = new Error('Tag not found');
    err.status = 404;
    throw err;
  }
  try {
    tagsQueries.insertTaskTag(taskId, parseInt(tag_id));
    return { task_id: taskId, tag_id: parseInt(tag_id) };
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      const dupErr = new Error('tag already applied to this task');
      dupErr.status = 409;
      throw dupErr;
    }
    throw err;
  }
}

/**
 * @description Removes a tag association from a task.
 * @param {number} taskId - The ID of the task to remove the tag from.
 * @param {number} tagId - The ID of the tag to remove.
 * @returns {{deleted: boolean}} Confirmation that the association was deleted.
 * @throws {Error} A 404 error if the tag was not applied to the task.
 */
function removeTagFromTask(taskId, tagId) {
  const result = tagsQueries.deleteTaskTag(taskId, tagId);
  if (result.changes === 0) {
    const err = new Error('Tag not applied to this task');
    err.status = 404;
    throw err;
  }
  return { deleted: true };
}

module.exports = { listTags, createTag, addTagToTask, removeTagFromTask };
