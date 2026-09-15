/**
 * @description Express middleware that logs each incoming request's timestamp, method, and URL.
 * @param {import('express').Request} req - The incoming request being logged.
 * @param {import('express').Response} res - The outgoing response, unused.
 * @param {import('express').NextFunction} next - Called to continue to the next middleware.
 * @returns {void}
 */
function requestLogger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

module.exports = { requestLogger };
