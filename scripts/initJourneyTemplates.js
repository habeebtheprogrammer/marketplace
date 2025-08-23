const mongoose = require('mongoose');
const JourneyTemplate = require('../model/journeyTemplate.model');

// Connect to MongoDB
const MONGODB_URI = "mongodb+srv://super:devcon@gadgets.ok1dnqs.mongodb.net/" || 'mongodb://localhost:27017/marketplace';

async function connectDB() {
  try {
        mongoose.Promise = global.Promise;
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define journey templates
const journeyTemplates = [
  // Signup Journey
  {
    name: 'signup',
    description: 'New user welcome and onboarding flow',
    steps: [
      { day: 0, type: 'email', template: 'welcome_email' },
      { day: 1, type: 'email', template: 'getting_started' },
      { day: 3, type: 'email', template: 'feature_showcase' },
      { day: 7, type: 'email', template: 'first_purchase_discount' },
    ],
  },
  
  // Cart Abandonment Journey
  {
    name: 'cart',
    description: 'Cart abandonment recovery flow',
    steps: [
      { day: 0, type: 'email', template: 'cart_reminder_1' },
      { day: 1, type: 'email', template: 'cart_reminder_2' },
      { day: 3, type: 'email', template: 'cart_last_chance' },
    ],
  },
  
  // Post-Purchase Journey
  {
    name: 'post_purchase',
    description: 'Post-purchase follow-up and review request',
    steps: [
      { day: 1, type: 'email', template: 'order_confirmation' },
      { day: 2, type: 'email', template: 'shipping_update' },
      { day: 7, type: 'email', template: 'review_request' },
    ],
  }
];

async function initializeTemplates() {
  try {
    await connectDB();
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const templateData of journeyTemplates) {
      const filter = {
        name: templateData.name
      };
      
      const existingTemplate = await JourneyTemplate.findOne(filter);
      
      if (existingTemplate) {
        // Update existing template
        existingTemplate.steps = templateData.steps;
        existingTemplate.description = templateData.description;
        existingTemplate.active = true;
        await existingTemplate.save();
        updatedCount++;
        console.log(`Updated ${templateData.name} template`);
      } else {
        // Create new template
        const newTemplate = new JourneyTemplate({
          ...templateData,
          createdBy: '6693ba1b84e5e9986703fc5a'
        });
        await newTemplate.save();
        createdCount++;
        console.log(`Created ${templateData.name} template`);
      }
    }
    
    console.log(`\nJourney templates initialization complete!`);
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.log('Error initializing journey templates:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeTemplates();
