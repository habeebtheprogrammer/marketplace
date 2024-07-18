var express = require('express');
const { addressController } = require('../controller');
const { checkAuth } = require('../utils/auth');
const { addAddressValidator } = require('../utils/validator');
var router = express.Router();

router.post('/', checkAuth, addAddressValidator, addressController.addAddress);
router.delete('/:addressId', checkAuth, addressController.removeAddress);
router.get('/', checkAuth, addressController.getAddress);

module.exports = router;