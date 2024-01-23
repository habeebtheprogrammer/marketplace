const jwt = require("jsonwebtoken");
const { errorResponse } = require("./responder");
const { HttpStatusCode } = require("axios");

exports.createToken = (data) => {
  var token = jwt.sign(data, process.env.secretKey, { expiresIn: '30d' });
  return token;
};

exports.checkToken = (req, res, next) => {
  var token = req.header("authorization");
  try {
    var data = jwt.verify(token, process.env.secretKey);
    req.userId = data._id;
    next();
  } catch (error) {
    errorResponse(res, error, "Please login to continue", HttpStatusCode.Forbidden)
  }
}
 