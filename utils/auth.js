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
    if(token) token = token.split(" ")[1]
    var data = jwt.verify(token, process.env.secretKey);
    req.userId = data.docs[0]._id;
    req.userType = data.docs[0].userType;
    next();
  } catch (error) {
    errorResponse(res, error, "Please login to continue", HttpStatusCode.Forbidden)
  }
}
 