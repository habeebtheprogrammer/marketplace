const { usersService, journeyService } = require("../service");
const { successResponse, errorResponse } = require("../utils/responder");
const constant = require("../utils/constant");
const bcrypt = require("bcryptjs");
const {
  createToken,
  sendSignupMail,
  isAppleRelayEmail,
  generateRandomNumber,
  sendOtpCode,
  sendPasswordResetEmail,
} = require("../utils/helpers");
const Users = require("../model/users.model");

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await usersService.getUsers({ email });
    if (!user?.totalDocs) throw Error(constant.mismatchCredErr);
    const verify = await bcrypt.compare(password, user.docs[0].password);
    if (!verify) throw Error(constant.mismatchCredErr);
    var token = createToken(JSON.stringify(user.docs[0]));
    successResponse(res, { user: user.docs[0], token });
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);

    const referralCode =
      req.body.firstName.substring(0, 4).toUpperCase() +
      generateRandomNumber(4);

    var query = {
      ...req.body,
      lastName: req.body.lastName || req.body.firstName,
      password: hash,
      referralCode,
      verificationCode: generateRandomNumber(5),
      deviceid: req.headers.deviceid,
    };
    if (req.body.referralCode) {
      const referrer = await usersService.getUsers({
        referralCode: req.body.referralCode,
      });
      if (!referrer?.totalDocs) {
        throw Error("Invalid referral code");
      }
      query.referredBy = referrer.docs[0]._id;
    }

    const user = await usersService.createUser(query);
    var token = createToken(JSON.stringify(user));
    if (query.referredBy) {
      await usersService.updateUsers(
        { _id: query.referredBy },
        { $inc: { referrals: 1 } }
      );
    }
    successResponse(res, { user, token });
    !isAppleRelayEmail(user.email) && journeyService.handleUserSignup(user?._id)
    if (user.verificationCode) sendOtpCode(user.email, user.verificationCode);
  } catch (error) {
    console.log(error)
    errorResponse(res, error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    var updateObj = {};
    Object.keys(req.body).forEach((key) => {
      if (req.body[key]) {
        updateObj[key] = req.body[key];
      }
    });
    if (updateObj.password) {
      const hash = await bcrypt.hash(updateObj.password, 10);
      updateObj.password = hash;
    }
    const data = await usersService.updateUsers({ _id: req.userId }, updateObj);
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.sendOtpEmail = async (req, res, next) => {
  try {
    var { email } = req.body;
    const user = await usersService.getUsers({ email });
    if (!user?.totalDocs) throw Error("Email addresss does not exist");
    sendOtpCode(email, user.docs[0].verificationCode);
    successResponse(res, { success: true });
  } catch (error) {
    console.log(error);
    errorResponse(res, error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    var { otp, email } = req.body;
    const user = await usersService.getUsers({ email, verificationCode: otp });
    if (!user?.totalDocs) throw Error("Incorrect otp. please try again");
    await usersService.updateUsers({ email }, { verificationCode: "" });
    successResponse(res, { verified: true });
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.getUserAccount = async (req, res, next) => {
  try {
    const data = await usersService.getUsers({ _id: req.userId });
    successResponse(res, data?.docs[0]);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const user = await usersService.getUsers({ _id: req.userId });
    if (user?.docs[0]) {
      if (!user.docs[0].referralCode) {
        const referralCode =
          user.docs[0].firstName.substring(0, 4).toUpperCase() +
          generateRandomNumber(4);
        const data = await usersService.updateUsers(
          { _id: user.docs[0]._id },
          { referralCode }
        );
      }
      var token = createToken(JSON.stringify(user.docs[0]));
      successResponse(res, { user: user.docs[0], token });
      const {
        latitude,
        longitude,
        city,
        platform,
        buildnumber,
        buildversion,
        model,
        deviceid,
      } = req.headers;
      await usersService.updateUsers(
        { _id: user.docs[0]._id },
        {
          location: {
            latitude,
            longitude,
            city,
            platform,
            buildnumber,
            buildversion,
            model,
            deviceid,
            lastseen: new Date(),
          },
        }
      );
    }
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const filters = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ],
    };

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const users = await Users.find(filters)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate([]); // put your fields here later

    const total = await Users.countDocuments(filters);

    const result = {
      users,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      limit: limitNumber,
    };

    successResponse(res, result);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.deleteUsers = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const data = await usersService.updateUsers({ _id }, { archive: true });
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.getUserDelivery = async (req, res, next) => {
  try {
    const data = await usersService.getUserDelivery({});
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await usersService.getUserById(userId);
    if (!user) {
      return errorResponse(res, { message: "User not found" });
    }
    successResponse(res, user);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.updateUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    var updateObj = {};

    // Only include fields that are provided in the request
    Object.keys(req.body).forEach((key) => {
      if (req.body[key]) {
        updateObj[key] = req.body[key];
      }
    });

    // If password is provided, hash it
    if (updateObj.password) {
      const hash = await bcrypt.hash(updateObj.password, 10);
      updateObj.password = hash;
    }

    const data = await usersService.updateUsers({ _id: userId }, updateObj);

    if (!data) {
      return errorResponse(res, { message: "User not found" });
    }

    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

// Get users referred by a particular user
exports.getReferredUsers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Find users where referredBy matches userId
    const users = await Users.find({ referredBy: userId })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNumber);
    console.log(JSON.stringify(users, null, 2));
    const total = await Users.countDocuments({ referredBy: userId });

    const result = {
      users,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      limit: limitNumber,
    };
    successResponse(res, result);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.getReferrals = async (req, res, next) => {
  try {
    const data = await usersService.getUsers({ referredBy: req.userId });
    console.log(JSON.stringify(data, null, 2))
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};
 
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error('Email is required');

    const user = await usersService.getUsers({ email });
    if (!user?.totalDocs) {
      return successResponse(res, { message: 'If an account exists with this email, a password reset link has been sent' });
    }

    const resetToken = generateRandomNumber(12);
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    await usersService.updateUsers(
      { _id: user.docs[0]._id },
      { 
        resetToken,
        resetTokenExpiry 
      }
    );

    const resetLink = `https://360gadgetsafrica.com/reset-password?token=${resetToken}&id=${user.docs[0]._id}`;
    await sendPasswordResetEmail(email, resetLink);

    successResponse(res, { message: 'If an account exists with this email, a password reset link has been sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    errorResponse(res, error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password, token, userId } = req.body;

    if (!token || !userId) {
      throw new Error('Invalid or expired reset link');
    }

    const user = await usersService.getUsers({ _id: userId, resetToken: token });
    if (!user?.totalDocs) {
      throw new Error('Invalid or expired reset link');
    }

    const userData = user.docs[0];
    if (userData.resetTokenExpiry < Date.now()) {
      throw new Error('Reset link has expired');
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await usersService.updateUsers(
      { _id: userId },
      { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    );

    // Send email with new password
    await sendPasswordResetEmail(userData.email, `Your new password is: ${password}`);

    successResponse(res, { message: 'Password has been reset successfully. Please check your email for the new password.' });
  } catch (error) {
    console.error('Password reset error:', error);
    errorResponse(res, error);
  }
};
