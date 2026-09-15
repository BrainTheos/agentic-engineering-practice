const { db } = require('../connection');

/**
 * @description Retrieves tasks matching optional filters, with pagination.
 * @param {Object} [options={}] - The filter and pagination options.
 * @param {string} [options.status] - If provided, restrict results to this status.
 * @param {number} [options.projectId] - If provided, restrict results to this project.
 * @param {number} [options.assigneeId] - If provided, restrict results to this assignee.
 * @param {number} [options.limit=20] - The maximum number of rows to return.
 * @param {number} [options.offset=0] - The number of rows to skip.
 * @returns {Object[]} The list of matching task rows, most recently created first.
 */
function listTasks({ status, projectId, assigneeId, limit = 20, offset = 0 } = {}) {
  let query = 'SELECT * FROM tasks';
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (projectId) {
    conditions.push('project_id = ?');
    params.push(projectId);
  }
  if (assigneeId) {
    conditions.push('assignee_id = ?');
    params.push(assigneeId);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(params);
}

/**
 * @description Retrieves a single task by its ID, without related tags or comments.
 * @param {number} id - The ID of the task to find.
 * @returns {Object|undefined} The task row, or `undefined` if no task matches.
 */
function findTaskById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

/**
 * @description Retrieves a single task by its ID, including its associated tags and comments.
 * @param {number} id - The ID of the task to find.
 * @returns {Object|null} The task row with `tags` and `comments` arrays attached, or `null` if no task matches.
 */
function getTaskById(id) {
  const task = findTaskById(id);
  if (!task) return null;
  task.tags = db.prepare(
    'SELECT t.* FROM tags t JOIN task_tags tt ON tt.tag_id = t.id WHERE tt.task_id = ?'
  ).all(id);
  task.comments = db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at ASC'
  ).all(id);
  return task;
}

/**
 * @description Inserts a new task and returns the newly created row.
 * @param {string} title - The task title.
 * @param {string|null} description - The task description, or `null` if none.
 * @param {number|null} projectId - The ID of the owning project, or `null` if unassigned.
 * @param {number|null} assigneeId - The ID of the assigned user, or `null` if unassigned.
 * @param {string|null} dueDate - The due date, or `null` if none.
 * @returns {Object} The newly inserted task row.
 */
function insertTask(title, description, projectId, assigneeId, dueDate) {
  const result = db.prepare(
    'INSERT INTO tasks (title, description, project_id, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description, projectId, assigneeId, dueDate);
  return findTaskById(result.lastInsertRowid);
}

/**
 * @description Updates all fields of a task and returns the updated row.
 * @param {number} id - The ID of the task to update.
 * @param {string} title - The new task title.
 * @param {string|null} description - The new task description.
 * @param {string} status - The new task status.
 * @param {number|null} projectId - The new owning project's ID.
 * @param {number|null} assigneeId - The new assigned user's ID.
 * @param {string|null} dueDate - The new due date.
 * @param {string|null} completedAt - The new completion timestamp, or `null` if not completed.
 * @returns {Object|undefined} The updated task row, or `undefined` if no task matches `id`.
 */
function updateTaskById(id, title, description, status, projectId, assigneeId, dueDate, completedAt) {
  db.prepare(
    'UPDATE tasks SET title=?, description=?, status=?, project_id=?, assignee_id=?, due_date=?, completed_at=? WHERE id=?'
  ).run(title, description, status, projectId, assigneeId, dueDate, completedAt, id);
  return findTaskById(id);
}

/**
 * @description Deletes a task by its ID.
 * @param {number} id - The ID of the task to delete.
 * @returns {import('better-sqlite3').RunResult} The result of the delete statement, including the number of rows changed.
 */
function deleteTaskById(id) {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

/**
 * @description Retrieves all tasks belonging to a project, most recently created first.
 * @param {number} projectId - The ID of the project whose tasks should be listed.
 * @returns {Object[]} The list of task rows.
 */
function findByProjectId(projectId) {
  return db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC').all(projectId);
}

/**
 * @description Retrieves the count of tasks per status for a given project.
 * @param {number} projectId - The ID of the project to aggregate statuses for.
 * @returns {{status: string, count: number}[]} The list of status/count pairs.
 */
function getStatusCountsByProjectId(projectId) {
  return db.prepare(
    'SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status'
  ).all(projectId);
}

module.exports = {
  listTasks,
  findTaskById,
  getTaskById,
  insertTask,
  updateTaskById,
  deleteTaskById,
  findByProjectId,
  getStatusCountsByProjectId
};
