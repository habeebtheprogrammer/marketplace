const jwt = require("jsonwebtoken");
const constant = require("./constant");
const bcrypt = require("bcryptjs")
const { errorResponse, successResponse } = require("./responder");
const { HttpStatusCode } = require("axios");
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require("apple-signin-auth");
const { createToken, sendSignupMail } = require("./helpers");
const { usersService } = require("../service")


exports.checkAuth = (req, res, next) => {
  var token = req.header("authorization");
  try {
    if (token) token = token.split(" ")[1]
    var data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data._id;
    req.userType = data.userType;
    next();
  } catch (error) {
    errorResponse(res, error, "Please login to continue", HttpStatusCode.Forbidden)
  }
}
exports.googleAuth = async (req, res, next) => {
  try {
    const { oauthToken } = req.body;

    if (oauthToken) {
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: oauthToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const firstName = payload['given_name']
      const lastName = payload['family_name']
      const id = payload['sub']
      const email = payload['email']

      const user = await usersService.getUsers({ email })
      if (!user?.totalDocs) {
        const hash = await bcrypt.hash(id, 10)
        const user = await usersService.createUser({ firstName, email, lastName, password: hash })
        var token = createToken(JSON.stringify(user))
        successResponse(res, { user, token })
        sendSignupMail(email)

      } else {
        var token = createToken(JSON.stringify(user.docs[0]))
        successResponse(res, { user: user.docs[0], token })
      }
    } else next();
  } catch (error) {
    console.log(error)
    errorResponse(res, error, "An error has occured. please try again later", HttpStatusCode.Forbidden)
  }
}
 

exports.appleSignin = async (req, res, next) => {

  try {
    const { appleToken } = req.body;
    console.log(appleToken)
    if (appleToken) {

      const { authorization, user } = appleToken
      const verifyTok = await appleSignin.verifyIdToken(
        authorization.id_token, // We need to pass the token that we wish to decode.
        {
          audience: process.env.APPLE_CLIENT_ID, // client id - The same one we used  on the frontend, this is the secret key used for encoding and decoding the token.
          ignoreExpiration: true, // Token will not expire unless you manually do so.
        }
      );
      const email = verifyTok?.email
      const name = user?.user
      const userObj = await usersService.getUsers({ email })
      if (!userObj?.totalDocs) {
        const hash = await bcrypt.hash(name.firstName, 10)
        const data = await usersService.createUser({ firstName: name?.firstName|| "champ", lastName: name?.lastName || "champ", password: hash, email })
        var token = createToken(JSON.stringify(data))
        successResponse(res, { user: data, token })
        sendSignupMail(email)
      } else {
        var token = createToken(JSON.stringify(userObj.docs[0]))
        successResponse(res, { user: userObj.docs[0], token })
      }
    } else {
      next()
    }
  } catch (error) {
    // Token is not verified
    console.error(error);
    errorResponse(res, error, "An error has occured. please try again later", HttpStatusCode.Forbidden)
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