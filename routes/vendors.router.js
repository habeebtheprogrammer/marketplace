var express = require('express');
const { vendorsController } = require('../controller');
const { checkAuth, vendorsAccessOnly, adminAccessOnly, adminOrVendorAccessOnly } = require('../utils/authMiddleware');
const { vendorsCreationValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, adminOrVendorAccessOnly, vendorsController.getVendors);
router.post('/', checkAuth, vendorsAccessOnly, vendorsCreationValidator, vendorsController.createVendors);
router.patch('/account', checkAuth, vendorsAccessOnly, vendorsController.updateVendorAccount);
router.get('/account', checkAuth, vendorsAccessOnly, vendorsController.getVendorAccount);
router.patch('/:id', checkAuth, adminOrVendorAccessOnly, vendorsController.updateVendorById);
router.get('/:id', checkAuth, adminOrVendorAccessOnly, vendorsController.getVendorById);

module.exports = router;