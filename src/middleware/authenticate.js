// TODO: replace with real JWT validation

/**
 * @description Express middleware that checks a static API key header and rejects the request with a 401 if it doesn't match.
 * @param {import('express').Request} req - The incoming request, expected to carry an `x-api-key` header.
 * @param {import('express').Response} res - The response used to send a 401 when authentication fails.
 * @param {import('express').NextFunction} next - Called to continue to the next middleware when authentication succeeds.
 * @returns {void}
 */
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === (process.env.API_KEY || 'dev-key')) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { authenticate };
