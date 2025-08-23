const JourneyTemplate = require("../model/journeyTemplate.model");
const UserJourney = require("../model/userJourney.model");
const { errorResponse } = require("../utils/responder");
const logger = require("../utils/logger");

/**
 * Start a new journey for a user
 * @param {Object} param
 * @param {String} param.userId - User ID
 * @param {String} param.journeyName - Name of the journey template
 * @param {Object} param.metadata - Additional data to store with the journey
 * @returns {Promise<Object>} The created user journey
 */
exports.startJourney = async ({ userId, journeyName, metadata = {} }) => {
  try {
    // Find the appropriate template
    const template = await JourneyTemplate.findOne({ 
      name: journeyName,
      active: true
    });

    if (!template) {
      throw new Error(`No active ${journeyName} journey template found`);
    }

    // Check for existing active journey of this type
    const existingJourney = await UserJourney.findOne({
      user: userId,
      journeyName,
      active: true
    });

    if (existingJourney) {
      return existingJourney;
    }

    // Create the user journey with scheduled steps
    const now = new Date();
    const steps = template.steps
      .filter(step => step.active)
      .map(step => ({
        ...step.toObject(),
        scheduledAt: new Date(now.getTime() + step.day * 24 * 60 * 60 * 1000)
      }));

    const userJourney = new UserJourney({
      user: userId,
      templateId: template._id,
      journeyName,
      steps,
      metadata
    });

    return await userJourney.save();
  } catch (error) {
    logger.error('Error starting journey:', error);
    throw error;
  }
};

/**
 * Get active journeys for a user
 * @param {Object} param
 * @param {String} param.userId - User ID
 * @param {Object} param.query - Query parameters for pagination
 * @returns {Promise<Object>} Paginated list of user journeys
 */
exports.getUserJourneys = async ({ userId, query = {} }) => {
  const { page = 1, limit = 10 } = query;
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: ['templateId', 'user']
  };

  return await UserJourney.paginate({ user: userId }, options);
};

/**
 * Process pending journey steps
 * @param {Number} batchSize - Number of steps to process in this batch
 * @returns {Promise<Object>} Processing results
 */
exports.processPendingSteps = async (batchSize = 100) => {
  const now = new Date();
  
  // Find journeys with pending steps that are due
  const journeys = await UserJourney.aggregate([
    { $match: { active: true } },
    { $unwind: '$steps' },
    { $match: { 'steps.status': 'pending', 'steps.scheduledAt': { $lte: now } } },
    { $limit: batchSize },
    {
      $group: {
        _id: '$_id',
        user: { $first: '$user' },
        journeyName: { $first: '$journeyName' },
        steps: { $push: '$steps' },
        metadata: { $first: '$metadata' }
      }
    }
  ]);

  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0
  };

  for (const journey of journeys) {
    try {
      await this.processJourneySteps(journey);
      results.succeeded++;
    } catch (error) {
      logger.error(`Error processing journey ${journey._id}:`, error);
      results.failed++;
    }
    results.processed++;
  }

  return results;
};

/**
 * Process steps for a single journey
 * @private
 * @param {Object} journey - The journey to process
 */
exports.processJourneySteps = async (journey) => {
  const bulkOps = [];
  const now = new Date();
  let allStepsCompleted = true;

  for (const step of journey.steps) {
    if (step.status !== 'pending' || step.scheduledAt > now) {
      if (step.status === 'pending') allStepsCompleted = false;
      continue;
    }

    try {
      // TODO: Implement actual email/sms sending logic
      // This is a placeholder - replace with your actual email/sms service
      logger.info(`Sending ${step.type} to user ${journey.user} using template ${step.template}`);
      
      bulkOps.push({
        updateOne: {
          filter: { _id: journey._id, 'steps._id': step._id },
          update: {
            $set: {
              'steps.$.status': 'sent',
              'steps.$.sentAt': now,
              currentStep: { $add: ['$currentStep', 1] }
            }
          }
        }
      });
    } catch (error) {
      logger.error(`Error processing step ${step._id}:`, error);
      bulkOps.push({
        updateOne: {
          filter: { _id: journey._id, 'steps._id': step._id },
          update: {
            $set: {
              'steps.$.status': 'failed',
              'steps.$.error': error.message
            }
          }
        }
      });
      allStepsCompleted = false;
    }
  }

  // If we have operations to perform
  if (bulkOps.length > 0) {
    // Mark journey as completed if all steps are done
    if (allStepsCompleted) {
      bulkOps.push({
        updateOne: {
          filter: { _id: journey._id },
          update: {
            $set: { 
              active: false,
              completedAt: now
            }
          }
        }
      });
    }

    await UserJourney.bulkWrite(bulkOps);
  }
};

/**
 * Complete a journey
 * @param {String} journeyId - Journey ID
 * @returns {Promise<Object>} Updated journey
 */
exports.completeJourney = async (journeyId) => {
  return await UserJourney.findByIdAndUpdate(
    journeyId,
    { 
      $set: { 
        active: false,
        completedAt: new Date()
      } 
    },
    { new: true }
  );
};

/**
 * Handle user signup event
 * @param {String} userId - User ID
 */
exports.handleUserSignup = async (userId) => {
  return this.startJourney({
    userId,
    journeyName: 'signup',
    metadata: { triggeredBy: 'user_signup' }
  });
};

/**
 * Handle cart abandonment event
 * @param {String} userId - User ID
 * @param {Array} cartItems - Array of cart items
 */
exports.handleCartAbandonment = async (userId, cartItems = []) => {
  if (!cartItems?.length) return null;
  
  return this.startJourney({
    userId,
    journeyName: 'cart',
    metadata: { 
      triggeredBy: 'cart_abandonment',
      cartItems: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    }
  });
};

/**
 * Handle purchase event
 * @param {String} userId - User ID
 * @param {Object} order - Order details
 */
exports.handlePurchase = async (userId, order) => {
  // Complete any active cart abandonment journeys
  await UserJourney.updateMany(
    { 
      user: userId, 
      journeyName: 'cart',
      active: true 
    },
    { 
      $set: { 
        active: false,
        completedAt: new Date(),
        'metadata.completedBy': 'purchase'
      } 
    }
  );

  // Start post-purchase journey
  return this.startJourney({
    userId,
    journeyName: 'post_purchase',
    metadata: { 
      triggeredBy: 'purchase_complete',
      orderId: order._id,
      amount: order.totalAmount
    }
  });
};


