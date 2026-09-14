const { db } = require('../connection');

function listProjects() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

function findProjectById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

function insertProject(name, description, ownerId) {
  const result = db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description, ownerId);
  return findProjectById(result.lastInsertRowid);
}

function updateProjectById(id, name, description, ownerId) {
  db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, ownerId, id);
  return findProjectById(id);
}

function deleteProjectById(id) {
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

function isProjectOwner(projectId, userId) {
  const project = findProjectById(projectId);
  return Boolean(project && project.owner_id === userId);
}

module.exports = { listProjects, findProjectById, insertProject, updateProjectById, deleteProjectById, isProjectOwner };
