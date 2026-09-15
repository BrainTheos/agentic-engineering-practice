const projectsQueries = require('../db/queries/projects-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const { isNonEmptyString } = require('../utils/helpers');

/**
 * @description Retrieves all projects.
 * @returns {Object[]} The list of project rows.
 */
function listProjects() {
  return projectsQueries.listProjects();
}

/**
 * @description Validates input and creates a new project.
 * @param {Object} data - The project payload.
 * @param {string} data.name - The project name.
 * @param {string} [data.description] - The project description.
 * @param {number} [data.owner_id] - The ID of the owning user.
 * @returns {Object} The newly created project row.
 * @throws {Error} A 400 error if `name` is missing or invalid.
 */
function createProject({ name, description, owner_id }) {
  if (!name || !isNonEmptyString(name)) {
    const err = new Error('name is required');
    err.status = 400;
    throw err;
  }
  return projectsQueries.insertProject(name, description || null, owner_id || null);
}

/**
 * @description Computes task counts by status for a project.
 * @param {number} projectId - The ID of the project to aggregate statistics for.
 * @returns {{total: number, active: number, completed: number, archived: number}} The task counts by status.
 */
function getProjectStats(projectId) {
  const rows = tasksQueries.getStatusCountsByProjectId(projectId);
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

/**
 * @description Retrieves a project by ID along with its task statistics.
 * @param {number} id - The ID of the project to find.
 * @returns {Object} The project row merged with a `stats` object.
 * @throws {Error} A 404 error if the project does not exist.
 */
function getProjectById(id) {
  const project = projectsQueries.findProjectById(id);
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  const stats = getProjectStats(id);
  return { ...project, stats };
}

/**
 * @description Builds a summary of a project including its task count and most recent tasks.
 * @param {Object} project - The project row to summarize.
 * @param {number} project.id - The ID of the project.
 * @returns {Object} The project merged with `taskCount` and `recentTasks` fields.
 */
function formatProjectSummary(project) {
  const tasks = tasksQueries.findByProjectId(project.id);
  return {
    ...project,
    taskCount: tasks.length,
    recentTasks: tasks.slice(0, 3)
  };
}

/**
 * @description Applies a partial update to a project, leaving unspecified fields unchanged.
 * @param {number} id - The ID of the project to update.
 * @param {Object} data - The fields to update.
 * @param {string} [data.name] - The new project name.
 * @param {string} [data.description] - The new project description.
 * @param {number} [data.owner_id] - The new owning user's ID.
 * @returns {Object} The updated project row.
 * @throws {Error} A 404 error if the project does not exist.
 */
function updateProject(id, data) {
  const existing = projectsQueries.findProjectById(id);
  if (!existing) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const owner_id = data.owner_id !== undefined ? data.owner_id : existing.owner_id;
  return projectsQueries.updateProjectById(id, name, description, owner_id);
}

/**
 * @description Deletes a project by ID.
 * @param {number} id - The ID of the project to delete.
 * @returns {{deleted: boolean}} Confirmation that the project was deleted.
 * @throws {Error} A 404 error if the project does not exist.
 */
function deleteProject(id) {
  const result = projectsQueries.deleteProjectById(id);
  if (result.changes === 0) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  return { deleted: true };
}

module.exports = {
  listProjects,
  createProject,
  getProjectById,
  formatProjectSummary,
  updateProject,
  deleteProject,
  getProjectStats
};
