/**
 * Wrap async Express route handlers to automatically pass errors to the next middleware.
 * Prevents process crashes from unhandled promise rejections.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
