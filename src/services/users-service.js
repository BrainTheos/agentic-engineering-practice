const usersQueries = require('../db/queries/users-queries');
const { sendEmail } = require('./send-email');
const { validateEmail, isNonEmptyString } = require('../utils/helpers');

/**
 * @description Validates input, creates a new user, and sends a welcome email.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @returns {Promise<Object>} Resolves with the newly created user row.
 * @throws {Error} A 400 error if `name`/`email` are missing or invalid, or a 409 error if the email already exists.
 */
async function createUser(name, email) {
  if (!name || !isNonEmptyString(name)) {
    const err = new Error('name is required');
    err.status = 400;
    throw err;
  }
  if (!email || !isNonEmptyString(email)) {
    const err = new Error('email is required');
    err.status = 400;
    throw err;
  }
  if (!validateEmail(email)) {
    const err = new Error('Invalid email address');
    err.status = 400;
    throw err;
  }

  let user;
  try {
    user = usersQueries.insertUser(name, email);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      const dupErr = new Error('email already exists');
      dupErr.status = 409;
      throw dupErr;
    }
    throw err;
  }

  // Sending welcome email here belongs in a notification service, not in a controller
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Taskr!',
    body: `Hi ${user.name}, your account is ready. Start managing your tasks at taskr.io.`
  });

  return user;
}

/**
 * @description Applies a partial update to a user, leaving unspecified fields unchanged.
 * @param {number} id - The ID of the user to update.
 * @param {Object} data - The fields to update.
 * @param {string} [data.name] - The new name.
 * @param {string} [data.email] - The new email address.
 * @returns {Object} The updated user row.
 * @throws {Error} A 404 error if the user does not exist.
 */
function updateUser(id, data) {
  const existing = usersQueries.findUserById(id);
  if (!existing) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  return usersQueries.updateUserById(id, name, email);
}

/**
 * @description Deletes a user by ID.
 * @param {number} id - The ID of the user to delete.
 * @returns {{deleted: boolean}} Confirmation that the user was deleted.
 * @throws {Error} A 404 error if the user does not exist.
 */
function deleteUser(id) {
  const result = usersQueries.deleteUserById(id);
  if (result.changes === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return { deleted: true };
}

/**
 * @description Retrieves all users.
 * @returns {Object[]} The list of user rows.
 */
function listUsers() {
  return usersQueries.listUsers();
}

/**
 * @description Retrieves a user by ID.
 * @param {number} id - The ID of the user to find.
 * @returns {Object} The user row.
 * @throws {Error} A 404 error if the user does not exist.
 */
function getUserById(id) {
  const user = usersQueries.findUserById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
}

module.exports = { createUser, updateUser, deleteUser, listUsers, getUserById };
