const tasksQueries = require('../db/queries/tasks-queries');
const projectsQueries = require('../db/queries/projects-queries');
const usersQueries = require('../db/queries/users-queries');
const { isNonEmptyString } = require('../utils/helpers');
const { VALID_TASK_STATUSES } = require('../config');

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

function getTaskById(id) {
  const task = tasksQueries.getTaskById(id);
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  return task;
}

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
