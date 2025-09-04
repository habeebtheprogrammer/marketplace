// services/journey.service.js
const JourneyTemplate = require("../model/journeyTemplate.model");
const UserJourney = require("../model/userJourney.model");
const emailTemplates = require("../emailTemplates");
const { emailTransporter } = require("../utils/email");
const { getBlogPosts } = require("./blogposts.service");
const { getCarts } = require("./carts.service");
const { sendNotification } = require("../utils/onesignal");
const { getUsers } = require("./users.service");

/**
 * Helper: Render email content from template + metadata
 */
const renderEmailContent = async (templateName, userId) => {
  const templateFn = emailTemplates[templateName];
  console.log(templateName, userId, 'about to render email content')
  if (!templateFn) return "";
  switch (templateName) {
    case "posts":
      const posts = await getBlogPosts({}, { page: 1, limit: 5 })
      return templateFn({ posts: posts.docs });
    case "cart_reminder":
      const cartItems = await getCarts({ userId });
      return templateFn({ cartItems: cartItems.docs });
    default:
      return templateFn();
  }
}

/**
 * Start a new journey for a user
 */
const startJourney = async ({ userId, journeyName, metadata = {} }) => {
  const template = await JourneyTemplate.findOne({ name: journeyName, active: true });
  if (!template) throw new Error(`No active ${journeyName} journey template found`);

  // Avoid duplicate active journeys
  const existing = await UserJourney.findOne({ userId, journeyName, active: true });
  if (existing) return existing;

  // Schedule steps
  const now = new Date();
  const steps = template.steps
    .filter(s => s.active)
    .map(s => ({
      ...s.toObject(),
      scheduledAt: new Date(now.getTime() + s.day * 24 * 60 * 60 * 1000)
    }));

  return await UserJourney.create({
    userId,
    templateId: template._id,
    journeyName,
    steps,
    metadata
  });
};

/**
 * Get active journeys for a user
 */
const getUserJourneys = async ({ userId, query = {} }) => {
  const { page = 1, limit = 10 } = query;
  return UserJourney.paginate(
    { userId },
    {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: ["templateId", "userId"]
    }
  );
};

/**
 * Process pending journey steps
 */
const processPendingSteps = async (batchSize = 100) => {
  const now = new Date();

  const journeys = await UserJourney.find({
    active: true,
    "steps.status": "pending",
    "steps.scheduledAt": { $lte: now }
  })
    .limit(batchSize)
    .populate("userId", "email");

  const results = { processed: 0, succeeded: 0, failed: 0 };

  for (const journey of journeys) {
    try {
      await processJourneySteps(journey);
      results.succeeded++;
    } catch (err) {
      console.error(`Error processing journey ${journey._id}:`, err);
      results.failed++;
    }
    results.processed++;
  }

  return results;
};

/**
 * Process steps for a single journey
 */
const processJourneySteps = async (journey) => {
  const bulkOps = [];
  const now = new Date();
  let allStepsCompleted = true;

  for (const step of journey.steps) {
    if (step.status !== "pending" || step.scheduledAt > now) {
      if (step.status === "pending") allStepsCompleted = false;
      continue;
    }

    try {
      const html = await renderEmailContent(step.template, journey.userId?._id);
      if (!html) continue;
      await emailTransporter.sendMail({
        from: '"360GadgetsAfrica" <hello@360gadgetsafrica.com>',
        to: journey.userId?.email,
        subject: step.subject || "Update from 360GadgetsAfrica",
        html
      });

      bulkOps.push({
        updateOne: {
          filter: { _id: journey._id, "steps._id": step._id },
          update: {
            $set: { "steps.$.status": "sent", "steps.$.sentAt": now }
          }
        }
      });
    } catch (err) {
      console.error(`Error step ${step._id}:`, err);
      bulkOps.push({
        updateOne: {
          filter: { _id: journey._id, "steps._id": step._id },
          update: { $set: { "steps.$.status": "failed", "steps.$.error": err.message } }
        }
      });
      allStepsCompleted = false;
    }
    try {
      const user = await getUsers({ _id: journey.userId?._id });
      const oneSignalId = user.docs[0].oneSignalId
      sendNotification({
        headings: { "en": step.subject },
        contents: { "en": `${step.description}` },
        include_subscription_ids: [oneSignalId], 
      })
    } catch (error) {
      console.log(error)
    }

  };

  if (bulkOps.length) {
    if (allStepsCompleted) {
      bulkOps.push({
        updateOne: {
          filter: { _id: journey._id },
          update: { $set: { active: false, completedAt: now } }
        }
      });
    }
    await UserJourney.bulkWrite(bulkOps);
  }
}
  /**
   * Complete a journey
   */
  const completeJourney = (journeyId) =>
    UserJourney.findByIdAndUpdate(journeyId, { active: false, completedAt: new Date() }, { new: true });

  /**
   * Event handlers
   */
  const handleUserSignup = (userId) =>
    startJourney({ userId, journeyName: "signup", metadata: { triggeredBy: "user_signup" } });

  const handleCartAbandonment = (userId, cartItems = []) => {
    if (!cartItems.length) return null;
    return startJourney({
      userId,
      journeyName: "cart",
      metadata: { triggeredBy: "cart_abandonment", cartItems }
    });
  };

  const handlePurchase = async (userId, order) => {
    // Close active cart journeys
    await UserJourney.updateMany(
      { userId, journeyName: "cart", active: true },
      { active: false, completedAt: new Date(), "metadata.completedBy": "purchase" }
    );

    // Start post-purchase journey
    return startJourney({
      userId,
      journeyName: "post_purchase",
      metadata: { triggeredBy: "purchase_complete", orderId: order._id, amount: order.totalAmount }
    });
  };

// Export all functions as methods of an object
const journeyService = {
  renderEmailContent,
  startJourney,
  getUserJourneys,
  processPendingSteps,
  processJourneySteps,
  completeJourney,
  handleUserSignup,
  handleCartAbandonment,
  handlePurchase
};

module.exports = journeyService;
