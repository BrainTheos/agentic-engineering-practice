const projectsQueries = require('../db/queries/projects-queries');
const tasksQueries = require('../db/queries/tasks-queries');
const { isNonEmptyString } = require('../utils/helpers');

function listProjects() {
  return projectsQueries.listProjects();
}

function createProject({ name, description, owner_id }) {
  if (!name || !isNonEmptyString(name)) {
    const err = new Error('name is required');
    err.status = 400;
    throw err;
  }
  return projectsQueries.insertProject(name, description || null, owner_id || null);
}

function getProjectStats(projectId) {
  const rows = tasksQueries.getStatusCountsByProjectId(projectId);
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

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

function formatProjectSummary(project) {
  const tasks = tasksQueries.findByProjectId(project.id);
  return {
    ...project,
    taskCount: tasks.length,
    recentTasks: tasks.slice(0, 3)
  };
}

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
