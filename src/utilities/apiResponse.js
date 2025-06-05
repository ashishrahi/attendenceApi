// Success Response
const apiSuccessResponse = (data, message = "Success", statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};

// Error Response
const apiErrorResponse = (message = "An error occurred", statusCode = 500, errors = []) => {
  return {
    success: false,
    statusCode,
    message,
    errors,
  };
};

module.exports = { apiSuccessResponse, apiErrorResponse };