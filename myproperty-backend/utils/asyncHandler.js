/**
 * Wraps an async controller so thrown errors are passed to next()
 * instead of needing try/catch in every single controller function.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
