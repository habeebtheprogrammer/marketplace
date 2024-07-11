var express = require('express');
const { vendorsController } = require('../controller');
const { checkToken } = require('../utils/auth');
var router = express.Router();

router.post('/', checkToken, vendorsController.createVendors);
router.patch('/', checkToken, vendorsController.updateVendors);
router.get('/', checkToken, vendorsController.getVendors);

module.exports = router;