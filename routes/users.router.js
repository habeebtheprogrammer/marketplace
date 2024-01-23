var express = require('express');
const { usersController } = require('../controller');
const { checkToken } = require('../utils/auth');
var router = express.Router();

router.post('/signin', usersController.signin);
router.post('/signup', usersController.createUser);
router.put('/update', checkToken, usersController.updateUser);
router.get('/all', checkToken, usersController.getUsers);
router.get('/user/:username', checkToken,  usersController.getUser);

module.exports = router;