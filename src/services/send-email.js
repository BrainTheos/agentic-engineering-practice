// TODO: replace with real email provider (SendGrid, SES, etc.)

/**
 * @description Sends an email (stubbed: logs the send and resolves immediately without contacting a real provider).
 * @param {Object} data - The email payload.
 * @param {string} data.to - The recipient's email address.
 * @param {string} data.subject - The email subject line.
 * @param {string} data.body - The email body text.
 * @returns {Promise<{sent: boolean, to: string, subject: string}>} Resolves with a confirmation of the (simulated) send.
 */
function sendEmail({ to, subject, body }) {
  console.log('[EMAIL] Sending to:', to, '| Subject:', subject);
  return Promise.resolve({ sent: true, to, subject });
}

module.exports = { sendEmail };
