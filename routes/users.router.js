var express = require('express');
const { usersController } = require('../controller');
const { checkAuth, adminAccessOnly, googleAuth, appleSignin } = require('../utils/authMiddleware');
const { signupInputValidator, signinInputValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, adminAccessOnly, usersController.getUsers);
router.get('/account', checkAuth, usersController.getUserAccount);
router.get('/refreshToken', checkAuth, usersController.refreshToken);
router.get('/delivery', usersController.getUserDelivery);
router.get('/referred/:userId', checkAuth, adminAccessOnly, usersController.getReferredUsers);
router.get('/getRef', usersController.getReferrals);
router.get('/:userId', checkAuth, adminAccessOnly, usersController.getUserById);
router.patch('/account', checkAuth, usersController.updateUser);
router.patch('/account/:userId', checkAuth, adminAccessOnly, usersController.updateUserById);
router.post('/signin', googleAuth, appleSignin, signinInputValidator,  usersController.signin);
router.post('/signup', signupInputValidator, usersController.createUser);
router.post('/sendOtp', usersController.sendOtpEmail);
router.post('/verifyOtp', usersController.verifyOtp);
router.post('/request-password-reset', usersController.requestPasswordReset);
router.post('/reset-password', usersController.resetPassword);
router.delete('/delete/:_id', checkAuth, adminAccessOnly, usersController.deleteUsers);

module.exports = router;