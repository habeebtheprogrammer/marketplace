var express = require('express');
const { userController } = require('../controller');
var router = express.Router();

router.post('/create',  userController.createUser);
router.put('/update',  userController.updateUser);
router.get('/all',  userController.getUsers);
router.get('/:id',  userController.getUser);

module.exports = router;