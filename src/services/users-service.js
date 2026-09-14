const usersQueries = require('../db/queries/users-queries');
const { sendEmail } = require('./send-email');
const { validateEmail, isNonEmptyString } = require('../utils/helpers');

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

function deleteUser(id) {
  const result = usersQueries.deleteUserById(id);
  if (result.changes === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return { deleted: true };
}

function listUsers() {
  return usersQueries.listUsers();
}

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
