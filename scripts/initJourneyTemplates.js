const mongoose = require('mongoose');
const JourneyTemplate = require('../model/journeyTemplate.model');

// Connect to MongoDB
const MONGODB_URI = process.env.DB_URL || 'mongodb://localhost:27017/marketplace';

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
      { day: 0, type: 'email', template: 'welcome_email', subject: 'We’re excited to have you join the 360GadgetsAfrica family!', description: 'From the latest gadgets to VTU Top-ups and expert device care. Everything you need is right here.' },
      { day: 1, type: 'email', template: 'getting_started', subject: 'You’re in! Let’s get you started', description: 'Browse categories or search -> Add to cart & choose delivery -> Pay securely (Card/Transfer/Wallet)' },
      { day: 3, type: 'email', template: 'first_purchase_discount', subject: '🎁 Your Welcome Discount!', description: 'Thanks for joining 360GadgetsAfrica! Use code GANUSI to get 50% OFF your first' },
      { day: 7, type: 'email', template: 'reviews', subject: 'Why people trust 360GadgetsAfrica', description: `"My favorite thing about the app asides the sleekness and comfortable user experience is the prompt notifications about possible downtimes and the speed of service restoration" - Abdulgafar Shuaib` },
    ],
  },
  
  // Cart Abandonment Journey
  {
    name: 'cart',
    description: 'Cart abandonment recovery flow',
    steps: [
      { day: 0, type: 'email', template: 'cart_reminder', subject: 'Don’t forget your cart 🛒', description: 'Abeg no leave your gadget hang for cart 😅. Your order dey wait for you for 360GadgetsAfrica. Complete am now' },
      { day: 1, type: 'email', template: 'cart_reminder', subject: 'You left something in your cart 🛒', description: 'The items you love are still waiting. Checkout now to get them delivered fast!' },
      { day: 3, type: 'email', template: 'reviews', subject: 'What Our Customers Are Saying', description: '"I got my iPhone case through 360gadgetsafrica and i really love it. Would recommend"' },
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
