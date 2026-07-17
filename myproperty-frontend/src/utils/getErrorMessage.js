/**
 * The backend always responds with { success, message, data } (see apiResponse.js
 * on the backend), so this pulls the human-readable message out of any
 * Axios error consistently, instead of repeating optional-chaining everywhere.
 */
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message || error?.message || "Something went wrong"
  );
};
