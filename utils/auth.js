const jwt = require("jsonwebtoken");
const { errorResponse } = require("./responder");
const { HttpStatusCode } = require("axios");
const constant = require("./constant");


exports.checkAuth = (req, res, next) => {
  var token = req.header("authorization");
  try {
    if(token) token = token.split(" ")[1]
    var data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data._id;
    req.userType = data.userType;
    next();
  } catch (error) {
    errorResponse(res, error, "Please login to continue", HttpStatusCode.Forbidden)
  }
}
 
exports.vendorsAccessOnly = (req, res, next) => { 
  try {
    if (req.userType != 'vendor') throw Error(constant.vendorOnly)
    next();
  } catch (error) {
    errorResponse(res, error, constant.vendorOnly, HttpStatusCode.Forbidden)
  }
}
  
exports.adminAccessOnly = (req, res, next) => { 
  try {
    if (req.userType != 'superuser') throw Error(constant.unathorizeAccess)
    next();
  } catch (error) {
    errorResponse(res, error, constant.vendorOnly, HttpStatusCode.Forbidden)
  }
}