require('dotenv').config({ path: '.env.production.local' });
const mongoose = require('mongoose');
const Products = require('../model/products.model');

async function rebuildIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    mongoose.Promise = global.Promise;
    await mongoose.connect(process.env.DB_URL);
    
    console.log('Connected to MongoDB');
    console.log('Dropping existing indexes...');
    
    // Drop all indexes except _id_
    await Products.collection.dropIndexes();
    
    console.log('Creating new indexes...');
    // Force re-creation of all indexes
    await Products.init();
    
    console.log('Indexes rebuilt successfully!');
    console.log('Current indexes:', await Products.collection.indexes());
    
    process.exit(0);
  } catch (error) {
    console.error('Error rebuilding indexes:', error);
    process.exit(1);
  }
}

rebuildIndexes();
