const tasksQueries = require('../db/queries/tasks-queries');
const projectsQueries = require('../db/queries/projects-queries');
const usersQueries = require('../db/queries/users-queries');
const { isNonEmptyString } = require('../utils/helpers');
const { VALID_TASK_STATUSES } = require('../config');

/**
 * @description Validates filters and retrieves a paginated list of tasks.
 * @param {Object} [options={}] - The filter and pagination options.
 * @param {string} [options.status] - If provided, restrict results to this status; must be a valid task status.
 * @param {number|string} [options.project_id] - If provided, restrict results to this project.
 * @param {number|string} [options.assignee_id] - If provided, restrict results to this assignee.
 * @param {number|string} [options.page] - The 1-based page number to return (defaults to 1).
 * @param {number|string} [options.page_size] - The number of items per page, capped at 100 (defaults to 20).
 * @returns {Object[]} The list of matching task rows.
 * @throws {Error} A 400 error if `status` is not a valid task status.
 */
function listTasks({ status, project_id, assignee_id, page, page_size } = {}) {
  if (status && !VALID_TASK_STATUSES.includes(status)) {
    const err = new Error(`status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const limit = Math.min(100, parseInt(page_size) || 20);
  const offset = ((parseInt(page) || 1) - 1) * limit;

  return tasksQueries.listTasks({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
}

/**
 * @description Validates input and creates a new task.
 * @param {Object} data - The task payload.
 * @param {string} data.title - The task title.
 * @param {string} [data.description] - The task description.
 * @param {number|string} [data.project_id] - The ID of the owning project.
 * @param {number|string} [data.assignee_id] - The ID of the assigned user.
 * @param {string} [data.due_date] - The task's due date.
 * @returns {Object} The newly created task row.
 * @throws {Error} A 400 error if `title` is missing, or the referenced project/assignee doesn't exist.
 */
function createTask({ title, description, project_id, assignee_id, due_date }) {
  if (!title || !isNonEmptyString(title)) {
    const err = new Error('title is required');
    err.status = 400;
    throw err;
  }
  if (project_id) {
    const project = projectsQueries.findProjectById(parseInt(project_id));
    if (!project) {
      const err = new Error('project not found');
      err.status = 400;
      throw err;
    }
  }
  if (assignee_id) {
    const user = usersQueries.findUserById(parseInt(assignee_id));
    if (!user) {
      const err = new Error('assignee not found');
      err.status = 400;
      throw err;
    }
  }
  return tasksQueries.insertTask(
    title,
    description || null,
    project_id ? parseInt(project_id) : null,
    assignee_id ? parseInt(assignee_id) : null,
    due_date || null
  );
}

/**
 * @description Retrieves a task by ID, including its tags and comments.
 * @param {number} id - The ID of the task to find.
 * @returns {Object} The task row with its tags and comments attached.
 * @throws {Error} A 404 error if the task does not exist.
 */
function getTaskById(id) {
  const task = tasksQueries.getTaskById(id);
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  return task;
}

/**
 * @description Applies a partial update to a task, leaving unspecified fields unchanged and stamping `completed_at` on status transitions.
 * @param {number} id - The ID of the task to update.
 * @param {Object} data - The fields to update.
 * @param {string} [data.title] - The new task title.
 * @param {string} [data.description] - The new task description.
 * @param {string} [data.status] - The new task status; must be a valid task status.
 * @param {number} [data.project_id] - The new owning project's ID.
 * @param {number} [data.assignee_id] - The new assigned user's ID.
 * @param {string} [data.due_date] - The new due date.
 * @returns {Object} The updated task row.
 * @throws {Error} A 404 error if the task does not exist, or a 400 error if `status` is invalid.
 */
function updateTask(id, data) {
  const existing = tasksQueries.findTaskById(id);
  if (!existing) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }

  const { title, description, status, project_id, assignee_id, due_date } = data;

  if (status && !VALID_TASK_STATUSES.includes(status)) {
    const err = new Error(`status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const updatedTitle = title !== undefined ? title : existing.title;
  const updatedDesc = description !== undefined ? description : existing.description;
  const updatedStatus = status !== undefined ? status : existing.status;
  const updatedProject = project_id !== undefined ? project_id : existing.project_id;
  const updatedAssignee = assignee_id !== undefined ? assignee_id : existing.assignee_id;
  const updatedDue = due_date !== undefined ? due_date : existing.due_date;
  const completedAt = updatedStatus === 'completed' && existing.status !== 'completed'
    ? new Date().toISOString()
    : (updatedStatus !== 'completed' ? null : existing.completed_at);

  return tasksQueries.updateTaskById(
    id, updatedTitle, updatedDesc, updatedStatus, updatedProject, updatedAssignee, updatedDue, completedAt
  );
}

/**
 * @description Deletes a task by ID.
 * @param {number} id - The ID of the task to delete.
 * @returns {{deleted: boolean}} Confirmation that the task was deleted.
 * @throws {Error} A 404 error if the task does not exist.
 */
function deleteTask(id) {
  const result = tasksQueries.deleteTaskById(id);
  if (result.changes === 0) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  return { deleted: true };
}

module.exports = { listTasks, createTask, getTaskById, updateTask, deleteTask };
