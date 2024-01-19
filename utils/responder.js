const httpStatus = require('http-status');
const { errMesg } = require('./constant');

const ApiResponder = (res, statusCode, message, payload, extra = {}) => {
  res.status(statusCode).send({
    status: statusCode,
    success: statusCode === httpStatus.OK || statusCode === httpStatus.CREATED ? true : false,
    message,
    data: payload,
    ...extra,
  });
};

const successResponse = (res, payload = {}, message = 'Success', statusCode = httpStatus.OK) => {
  return ApiResponder(res, statusCode, message, payload);
};

const errorResponse = (res,  error, message = errMesg, statusCode = httpStatus.INTERNAL_SERVER_ERROR) => {
    var errorData  = []
    console.log(error?.name)
    if(error?.name == 'ValidationError'){
        Object.keys(error?.errors).forEach(i => errorData.push({[i] : error.errors[i].message}))
    } else if(error?.code == "11000" ){
        Object.keys(error.keyValue).forEach(i => {
            message = error.keyValue[i]
            errorData.push({[i] : error.keyValue[i]})
        })
        message +=  " is not available"
    }
    return ApiResponder(res, statusCode, message, errorData);
};
 
module.exports = { ApiResponder, successResponse, errorResponse,  };
