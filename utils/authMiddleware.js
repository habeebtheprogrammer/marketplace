const jwt = require("jsonwebtoken");
const { usersService } = require("../service");
const constant = require("./constant");
const bcrypt = require("bcryptjs");
const { errorResponse, successResponse } = require("./responder");
const { HttpStatusCode, default: axios } = require("axios");
const { OAuth2Client } = require("google-auth-library");
const appleSignin = require("apple-signin-auth");
const { createToken, sendSignupMail, isAppleRelayEmail } = require("./helpers");

exports.checkAuth = (req, res, next) => {
  var token = req.header("authorization");
  var oneSignalId = req.header("onesignalid");
  try {
    if (token) {
      token = token.split(" ")[1]
    var data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data._id;
    req.firstName = data.firstName;
    req.lastName = data.lastName;
    req.userType = data.userType;
    req.email = data.email;
    req.oneSignalId = oneSignalId
    if(data.verificationCode && req.originalUrl != '/api/users/refreshToken'){
      throw Error("Please verify your account")
    }
    next();
    if(oneSignalId && !data.oneSignalId || (oneSignalId && (oneSignalId != data.oneSignalId))){
      usersService.updateUsers({_id: data._id}, {oneSignalId}).then((suc => console.log('onesignal update')))
    }
    } else throw Error("an error has occured")
  } catch (error) {
    console.log(error)
    errorResponse(
      res,
      error,
      "Please login to continue",
      HttpStatusCode.Forbidden
    );
  }
};
exports.googleAuth = async (req, res, next) => {
  try {
    const { oauthToken } = req.body;

    if (oauthToken) {
      const client = new OAuth2Client();

      const ticket = await client.verifyIdToken({
        idToken: oauthToken,
        audience: [
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_ID_2,
          process.env.GOOGLE_CLIENT_ID_3,
        ],
      });
      //  const ticket = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {headers: {
      //   Authorization: `Bearer ${oauthToken}`
      //  }})
      console.log(ticket);
      //  await client.getTokenInfo(oauthToken);
      const { payload } = ticket;
      const firstName = payload["given_name"];
      const lastName = payload["family_name"];
      const id = payload["sub"];
      const email = payload["email"];

      const user = await usersService.getUsers({ email });
      if (!user?.totalDocs) {
        const hash = await bcrypt.hash(id, 10);
        const user = await usersService.createUser({
          firstName,
          email,
          lastName,
          password: hash,
          deviceid: req.headers.deviceid,
        });
        var token = createToken(JSON.stringify(user));
        successResponse(res, { user, token });
        !isAppleRelayEmail(email) && sendSignupMail(email);
      } else {
        var token = createToken(JSON.stringify(user.docs[0]));
        successResponse(res, { user: user.docs[0], token });
      }
    } else next();
  } catch (error) {
    console.log(error);
    errorResponse(
      res,
      error,
      "An error has occured. please try again later",
      HttpStatusCode.Forbidden
    );
  }
};

exports.appleSignin = async (req, res, next) => {
  try {
    const { appleToken } = req.body;
    console.log(appleToken, req.header("platform"));
    if (appleToken) {
      const { authorization, user } = appleToken;
      const verifyTok = await appleSignin.verifyIdToken(
        authorization.id_token, // We need to pass the token that we wish to decode.
        {
          audience: req.header("platform")
            ? process.env.APPLE_CLIENT_ID2
            : process.env.APPLE_CLIENT_ID, // client id - The same one we used  on the frontend, this is the secret key used for encoding and decoding the token.
          ignoreExpiration: true, // Token will not expire unless you manually do so.
        }
      );
      const email = verifyTok?.email;
      const name = user?.name;
      const userObj = await usersService.getUsers({ email });
      if (!userObj?.totalDocs) {
        const hash = await bcrypt.hash(verifyTok.sub, 10);
        const data = await usersService.createUser({
          firstName: name?.firstName || "champ",
          lastName: name?.lastName || "champ",
          password: hash,
          email,
          deviceid: req.headers.deviceid,
        });
        var token = createToken(JSON.stringify(data));
        successResponse(res, { user: data, token });
        !isAppleRelayEmail(email) && sendSignupMail(email);
      } else {
        var token = createToken(JSON.stringify(userObj.docs[0]));
        successResponse(res, { user: userObj.docs[0], token });
      }
    } else {
      next();
    }
  } catch (error) {
    // Token is not verified
    console.error(error);
    errorResponse(
      res,
      error,
      "An error has occured. please try again later",
      HttpStatusCode.Forbidden
    );
  }
};
exports.vendorsAccessOnly = (req, res, next) => {
  try {
    if (req.userType != "vendor") throw Error(constant.vendorOnly);
    next();
  } catch (error) {
    errorResponse(res, error, constant.vendorOnly, HttpStatusCode.Forbidden);
  }
};

exports.adminAccessOnly = (req, res, next) => {
  try {
    if (req.userType != "superuser") throw Error(constant.unathorizeAccess);
    next();
  } catch (error) {
    errorResponse(res, error, constant.vendorOnly, HttpStatusCode.Forbidden);
  }
};

exports.adminOrVendorAccessOnly = (req, res, next) => {
  try {
    if (req.userType != "superuser" && req.userType != "vendor")
      throw Error(constant.unathorizeAccess);
    next();
  } catch (error) {
    errorResponse(res, error, constant.vendorOnly, HttpStatusCode.Forbidden);
  }
};
