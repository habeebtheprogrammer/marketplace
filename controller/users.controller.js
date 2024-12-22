const { usersService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")
const constant = require('../utils/constant')
const bcrypt = require("bcryptjs")
const { createToken, sendSignupMail, isAppleRelayEmail, generateRandomNumber } = require("../utils/helpers")


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
        var referrerId = ""
        if (req.body.referralCode) {
            const referrer = await usersService.getUsers({ referralCode: req.body.referralCode });

            if (!referrer?.totalDocs) {
                throw Error('Invalid referral code')
            }
            referrerId = referrer.docs[0]
        }
        const referralCode = req.body.firstName.substring(0, 4).toUpperCase() + generateRandomNumber(4);

        const user = await usersService.createUser({ ...req.body, lastName: req.body.lastName || req.body.firstName, password: hash, referralCode, referredBy: referrerId, verificationCode: generateRandomNumber(5) })
        var token = createToken(JSON.stringify(user))
        if (referrerId) {
            await usersService.updateUsers(
                { _id: referrerId },
                { $inc: { referrals: 1 } }
            );
        }
        successResponse(res, { user, token })
        !isAppleRelayEmail(user.email) && sendSignupMail(user.email)
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

exports.verifyEmail = async (req, res, next) => {
    try {
        var { email, verificationCode } = request.body;
        const user = await usersService.findOne({ email, verificationCode })

        if (!user?.totalDocs) throw Error('"Verification code is not correct"')
        const data = await usersService.updateUsers({ _id: user?.docs[0]._id }, { verificationCode: '' })
        successResponse(res, data)
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
