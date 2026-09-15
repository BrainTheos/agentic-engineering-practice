const { db } = require('../connection');

/**
 * @description Retrieves all projects, most recently created first.
 * @returns {Object[]} The list of project rows.
 */
function listProjects() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

/**
 * @description Retrieves a single project by its ID.
 * @param {number} id - The ID of the project to find.
 * @returns {Object|undefined} The project row, or `undefined` if no project matches.
 */
function findProjectById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

/**
 * @description Inserts a new project and returns the newly created row.
 * @param {string} name - The project name.
 * @param {string|null} description - The project description, or `null` if none.
 * @param {number|null} ownerId - The ID of the owning user, or `null` if unassigned.
 * @returns {Object} The newly inserted project row.
 */
function insertProject(name, description, ownerId) {
  const result = db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description, ownerId);
  return findProjectById(result.lastInsertRowid);
}

/**
 * @description Updates a project's name, description, and owner, then returns the updated row.
 * @param {number} id - The ID of the project to update.
 * @param {string} name - The new project name.
 * @param {string|null} description - The new project description.
 * @param {number|null} ownerId - The new owning user's ID.
 * @returns {Object|undefined} The updated project row, or `undefined` if no project matches `id`.
 */
function updateProjectById(id, name, description, ownerId) {
  db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, ownerId, id);
  return findProjectById(id);
}

/**
 * @description Deletes a project by its ID.
 * @param {number} id - The ID of the project to delete.
 * @returns {import('better-sqlite3').RunResult} The result of the delete statement, including the number of rows changed.
 */
function deleteProjectById(id) {
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

/**
 * @description Checks whether a given user owns a given project.
 * @param {number} projectId - The ID of the project to check.
 * @param {number} userId - The ID of the user to check ownership for.
 * @returns {boolean} `true` if the project exists and its `owner_id` matches `userId`, otherwise `false`.
 */
function isProjectOwner(projectId, userId) {
  const project = findProjectById(projectId);
  return Boolean(project && project.owner_id === userId);
}

module.exports = { listProjects, findProjectById, insertProject, updateProjectById, deleteProjectById, isProjectOwner };
