var express = require('express');
const { vendorsController } = require('../controller');
const { checkToken } = require('../utils/auth');
var router = express.Router();

router.post('/create', checkToken, vendorsController.createVendor);
router.put('/update', checkToken, vendorsController.updateVendor);
router.post('/signin', vendorsController.signin);
router.get('/fetch', checkToken, vendorsController.getVendors);
router.get('/vendor/:slug', checkToken,  vendorsController.getVendor);

module.exports = router;