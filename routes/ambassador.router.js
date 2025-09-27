var express = require('express');
const { ambassadorController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
const { ambassadorCreationValidator, updateValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', ambassadorController.getAmbassadors);
router.post('/',  ambassadorCreationValidator, ambassadorController.createAmbassador);
router.patch('/', checkAuth, updateValidator, ambassadorController.updateAmbassador);
router.delete('/', checkAuth, ambassadorController.deleteAmbassador);

module.exports = router;
