var express = require('express');
const { vendorsController } = require('../controller');
const { checkAuth, vendorsAccessOnly, adminAccessOnly } = require('../utils/auth');
const { vendorsCreationValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, adminAccessOnly, vendorsController.getVendors);
router.post('/', checkAuth, vendorsAccessOnly, vendorsCreationValidator, vendorsController.createVendors);
router.patch('/account', checkAuth, vendorsAccessOnly, vendorsController.updateVendorAccount);
router.get('/account', checkAuth, vendorsAccessOnly, vendorsController.getVendorAccount);

module.exports = router;