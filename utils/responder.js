const { errMesg, requiredErr } = require('./constant');
const { HttpStatusCode } = require('axios');

const ApiResponder = (res, statusCode, message, payload, extra = {}) => {
  res.status(statusCode).send({
    status: statusCode,
    success: statusCode === HttpStatusCode.Ok || statusCode === HttpStatusCode.Created ? true : false,
    message,
    data: payload,
    ...extra,
  });
};

exports.successResponse = (res, payload = {}, message = 'Success', statusCode = HttpStatusCode.Ok) => {
  return ApiResponder(res, statusCode, message, payload);
};

exports.errorResponse = (res,  error, message = errMesg, statusCode = HttpStatusCode.InternalServerError) => {
    var errorData  = []
    console.log(error)
    if(error?.name == 'ValidationError'){
        Object.keys(error?.errors).forEach(i => errorData.push({[i] : error.errors[i].message}))
        message = requiredErr
    } else if(error?.code == "11000" ){
        Object.keys(error.keyValue).forEach(i => {
            message = error.keyValue[i]
            errorData.push({[i] : error.keyValue[i] + " is not available"})
        })
        message +=  " is not available"
    } else if(error?.message && error?.name != 'JsonWebTokenError'){
        message = error.message
    }  
    return ApiResponder(res, statusCode, message, errorData);
};
  