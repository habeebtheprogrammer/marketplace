require('dotenv').config({ path: '.env.production.local' });
const mongoose = require('mongoose');
const Transactions = require('../model/transactions.model');

async function rebuildIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    mongoose.Promise = global.Promise;
    await mongoose.connect(process.env.DB_URL);
    
    console.log('Connected to MongoDB');
    
    // First, drop any existing indexes except _id_
    console.log('Dropping existing indexes...');
    try {
      await Transactions.collection.dropIndexes();
    } catch (error) {
      console.log('No indexes to drop or error dropping indexes:', error.message);
    }
    
    // Create indexes one by one
    console.log('Creating indexes...');
    
    // Create reference index (unique)
    await Transactions.collection.createIndex({ reference: 1 }, { unique: true });
    console.log('Created reference index');
    
    // Create narration index
    await Transactions.collection.createIndex({ narration: 1 });
    console.log('Created narration index');
    
    // Create status index
    await Transactions.collection.createIndex({ status: 1 });
    console.log('Created status index');
    
    // Create type index
    await Transactions.collection.createIndex({ type: 1 });
    console.log('Created type index');
    
    // Create userId index since it's frequently used for lookups
    await Transactions.collection.createIndex({ userId: 1 });
    console.log('Created userId index');
    
    console.log('All indexes created successfully!');
    console.log('Current indexes:', await Transactions.collection.indexes());
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

rebuildIndexes();
