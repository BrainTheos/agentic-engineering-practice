const { db } = require('../connection');

/**
 * @description Retrieves all users, most recently created first.
 * @returns {Object[]} The list of user rows.
 */
function listUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

/**
 * @description Retrieves a single user by their ID.
 * @param {number} id - The ID of the user to find.
 * @returns {Object|undefined} The user row, or `undefined` if no user matches.
 */
function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/**
 * @description Inserts a new user and returns the newly created row.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @returns {Object} The newly inserted user row.
 */
function insertUser(name, email) {
  const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
  return findUserById(result.lastInsertRowid);
}

/**
 * @description Updates a user's name and email, then returns the updated row.
 * @param {number} id - The ID of the user to update.
 * @param {string} name - The new name.
 * @param {string} email - The new email address.
 * @returns {Object|undefined} The updated user row, or `undefined` if no user matches `id`.
 */
function updateUserById(id, name, email) {
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
  return findUserById(id);
}

/**
 * @description Deletes a user by their ID.
 * @param {number} id - The ID of the user to delete.
 * @returns {import('better-sqlite3').RunResult} The result of the delete statement, including the number of rows changed.
 */
function deleteUserById(id) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

module.exports = { listUsers, findUserById, insertUser, updateUserById, deleteUserById };
