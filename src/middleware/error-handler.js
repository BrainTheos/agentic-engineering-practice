/**
 * @description Express error-handling middleware that logs the error and formats it into a JSON error response.
 * @param {Error & {status?: number}} err - The error to handle, optionally carrying an HTTP status code.
 * @param {import('express').Request} req - The incoming request.
 * @param {import('express').Response} res - The response used to send the formatted error.
 * @param {import('express').NextFunction} next - Unused, present to satisfy Express's error-middleware signature.
 * @returns {void}
 */
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
