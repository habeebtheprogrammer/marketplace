var express = require('express');
const { journeyController } = require('../controller');
const { checkAuth, adminAccessOnly } = require('../utils/authMiddleware');

var router = express.Router();

// User routes
router.get('/user/journeys', checkAuth, journeyController.getUserJourneys);
router.post('/journey/start', checkAuth, journeyController.startJourney);
router.patch('/journey/:journeyId/complete', checkAuth, journeyController.completeJourney);

// Admin routes
router.post('/admin/journey/process', checkAuth, adminAccessOnly, journeyController.processPendingSteps);

module.exports = router;
