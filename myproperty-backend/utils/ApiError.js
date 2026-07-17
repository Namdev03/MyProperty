/**
 * Custom error class so controllers can `throw new ApiError(404, "Not found")`
 * and the errorMiddleware will format it consistently.
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}
