const { errMesg, requiredErr } = require('./constant');
const { HttpStatusCode } = require('axios');
const { sendErrorEmail } = require('./helpers');

const ApiResponder = (res, statusCode, payload, error = false) => {
  res.status(statusCode).send({
    status: statusCode,
    success: !error,
    [error ? 'errors' : 'data']: payload,
  });
};

exports.successResponse = (res, payload = {}, message = 'Success', statusCode = HttpStatusCode.Ok) => {
  return ApiResponder(res, statusCode, payload);
};

exports.errorResponse = (res, error, message = errMesg, statusCode = HttpStatusCode.InternalServerError) => {

  var errorData = []
  if (error?.name == 'ValidationError') {
    Object.keys(error?.errors).forEach(i => errorData.push(error.errors[i].message))
  } else if (error?.code == "11000") {
    Object.keys(error.keyValue).forEach(i => {
      message = error.keyValue[i]
      errorData.push(error.keyValue[i] + " is not available")
    })
  } else if (error?.message && error?.name != 'JsonWebTokenError') {
    message = error.message
    errorData.push(error.message)
  } else {
    errorData.push(message)
  }
  if (error?.name != 'JsonWebTokenError') errorData.push(JSON.stringify({errorData, error}))
  return ApiResponder(res, statusCode, errorData, true);
};
