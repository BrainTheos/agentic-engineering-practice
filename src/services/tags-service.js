const tagsQueries = require('../db/queries/tags-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const { isNonEmptyString } = require('../utils/helpers');

function listTags() {
  return tagsQueries.listTags();
}

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
