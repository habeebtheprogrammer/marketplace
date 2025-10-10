var express = require('express');
const {  whatsappController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
    
var router = express.Router();

router.get('/webhook', whatsappController.getWhatsapp);
router.post('/webhook', whatsappController.postWhatsapp);

module.exports = router;