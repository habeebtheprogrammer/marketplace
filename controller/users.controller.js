const { usersService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")
const constant = require('../utils/constant')
const bcrypt = require("bcryptjs")
const { createToken, sendSignupMail, isAppleRelayEmail, generateRandomNumber, sendOtpCode } = require("../utils/helpers")


exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await usersService.getUsers({ email })
        if (!user?.totalDocs) throw Error(constant.mismatchCredErr)
        const verify = await bcrypt.compare(password, user.docs[0].password)
        if (!verify) throw Error(constant.mismatchCredErr)
        var token = createToken(JSON.stringify(user.docs[0]))
        successResponse(res, { user: user.docs[0], token })
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.createUser = async (req, res, next) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 10)
    
        const referralCode = req.body.firstName.substring(0, 4).toUpperCase() + generateRandomNumber(4);
     
        var query = { ...req.body, lastName: req.body.lastName || req.body.firstName, password: hash, referralCode, verificationCode: generateRandomNumber(5) , deviceid: req.headers.deviceid}
        if (req.body.referralCode) {
            const referrer = await usersService.getUsers({ referralCode: req.body.referralCode });
            if (!referrer?.totalDocs) {
                throw Error('Invalid referral code')
            }
            query.referredBy = referrer.docs[0]._id
        }

        const user = await usersService.createUser(query)
        var token = createToken(JSON.stringify(user))
        if (query.referredBy) {
            await usersService.updateUsers(
                { _id: query.referredBy },
                { $inc: { referrals: 1 } }
            );

        }
        successResponse(res, { user, token })
        !isAppleRelayEmail(user.email) && sendSignupMail(user.email)
        if(user.verificationCode) sendOtpCode(user.email, user.verificationCode)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        var updateObj = {}
        Object.keys(req.body).forEach(key => {
            if (req.body[key]) {
                updateObj[key] = req.body[key];
            }
        })
        if (updateObj.password) {
            const hash = await bcrypt.hash(password, 10)
            updateObj.password = hash
        }
        const data = await usersService.updateUsers({ _id: req.userId }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.sendOtpEmail = async (req, res, next) => {
    try {
        var { email } = req.body;
        const user = await usersService.getUsers({ email })
        if (!user?.totalDocs) throw Error("Email addresss does not exist")
        sendOtpCode(email, user.docs[0].verificationCode)
        successResponse(res, { success: true })
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}

exports.verifyOtp = async (req, res, next) => {
    try {
        var { otp, email } = req.body;
        const user = await usersService.getUsers({ email, verificationCode: otp })
        if (!user?.totalDocs) throw Error("Incorrect otp. please try again")
        await usersService.updateUsers({ email }, { verificationCode: '' })
        successResponse(res, { verified: true })
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getUserAccount = async (req, res, next) => {
    try {
        const data = await usersService.getUsers({ _id: req.userId })
        successResponse(res, data?.docs[0])
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.refreshToken = async (req, res, next) => {
    try {
        const user = await usersService.getUsers({ _id: req.userId })
        if (user?.docs[0]) {
            if (!user.docs[0].referralCode) {
                const referralCode = user.docs[0].firstName.substring(0, 4).toUpperCase() + generateRandomNumber(4);
                const data = await usersService.updateUsers({ _id: user.docs[0]._id }, { referralCode })
            }
            var token = createToken(JSON.stringify(user.docs[0]))
            successResponse(res, { user: user.docs[0], token })
            const {
                latitude,
                longitude,
                city,
                platform,
                buildnumber,
                buildversion,
                model,
                deviceid,
            } = req.headers
            await usersService.updateUsers({ _id: user.docs[0]._id }, {
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
                }
            })

        }
    } catch (error) {
        errorResponse(res, error)
    }
}
exports.getUsers = async (req, res, next) => {
    try {
        const data = await usersService.getUsers({ "archive": false, ...req.query })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}


exports.deleteUsers = async (req, res, next) => {
    try {
        const { _id } = req.params
        const data = await usersService.updateUsers({ _id }, { "archive": true })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}


exports.getUserDelivery = async (req, res, next) => {
    try {
        const data = await usersService.getUserDelivery({})
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

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
}
