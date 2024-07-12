var express = require('express');
const { usersController } = require('../controller');
const { checkToken } = require('../utils/auth');
const { signupValidator, signinValidator } = require('../utils/validator');
var router = express.Router();

router.get('/profile', checkToken,  usersController.getUser);
router.post('/signin', signinValidator, usersController.signin);
router.post('/signup', signupValidator, usersController.createUser);
router.patch('/update', checkToken, usersController.updateUser);
router.delete('/delete/:_id', checkToken, usersController.deleteUsers);
router.get('/', checkToken, usersController.getUsers);

module.exports = router;