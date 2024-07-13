const jwt = require("jsonwebtoken");


exports.generateRandomNumber = (n) => {
    return Math.floor(Math.random() * (9 * Math.pow(10, n - 1))) + Math.pow(10, n - 1);
  }

exports.createToken = (data) => {
  var token = jwt.sign(data, process.env.secretKey, { expiresIn: '30d' });
  return token;
};