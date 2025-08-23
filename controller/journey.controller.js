const { journeyService } = require("../service");
const { successResponse, errorResponse } = require("../utils/responder");

/**
 * Start a new journey for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.startJourney = async (req, res) => {
  try {
    const { journeyName, metadata = {} } = req.body;
    const userId = req.userId || req.body.userId;
    
    if (!userId || !journeyName) {
      return errorResponse(res, new Error('userId and journeyName are required'), 400);
    }

    const journey = await journeyService.startJourney({
      userId,
      journeyName,
      metadata: { ...metadata, initiatedBy: req.userId }
    });

    successResponse(res, journey);
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Get user's active journeys
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserJourneys = async (req, res) => {
  try {
    const userId = req.userId || req.query.userId;
    if (!userId) {
      return errorResponse(res, new Error('User ID is required'), 400);
    }

    const data = await journeyService.getUserJourneys({
      userId,
      query: req.query
    });

    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Complete a journey
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.completeJourney = async (req, res) => {
  try {
    const { journeyId } = req.params;
    if (!journeyId) {
      return errorResponse(res, new Error('journeyId is required'), 400);
    }

    const journey = await journeyService.completeJourney(journeyId);
    if (!journey) {
      return errorResponse(res, new Error('Journey not found'), 404);
    }

    successResponse(res, journey);
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Process pending journey steps (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processPendingSteps = async (req, res) => {
  try {
    const { batchSize = 100 } = req.query;
    const results = await journeyService.processPendingSteps(parseInt(batchSize, 10));
    successResponse(res, results);
  } catch (error) {
    errorResponse(res, error);
  }
};
