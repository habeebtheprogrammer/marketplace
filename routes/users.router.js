var express = require('express');
const { usersController } = require('../controller');
const { checkAuth, adminAccessOnly, googleAuth, appleSignin } = require('../utils/authMiddleware');
const { signupInputValidator, signinInputValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, adminAccessOnly, usersController.getUsers);
router.get('/account', checkAuth, usersController.getUserAccount);
router.patch('/account', checkAuth, usersController.updateUser);
router.post('/signin', googleAuth, appleSignin, signinInputValidator,  usersController.signin);
router.post('/signup', signupInputValidator, usersController.createUser);
router.delete('/delete/:_id', checkAuth, adminAccessOnly, usersController.deleteUsers);

module.exports = router;