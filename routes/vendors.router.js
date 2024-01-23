var express = require('express');
const { vendorsController } = require('../controller');
const { checkToken } = require('../utils/auth');
var router = express.Router();

router.post('/create', vendorsController.createVendor);
router.put('/update', checkToken, vendorsController.updateVendor);
router.get('/fetch', checkToken, vendorsController.getVendors);
router.get('/vendor/:slug', checkToken,  vendorsController.getVendor);

module.exports = router;