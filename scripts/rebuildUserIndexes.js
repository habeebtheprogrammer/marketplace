require('dotenv').config({ path: '.env.production.local' });
const mongoose = require('mongoose');
const Users = require('../model/users.model');

async function rebuildIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    mongoose.Promise = global.Promise;
    await mongoose.connect(process.env.DB_URL);
    
    console.log('Connected to MongoDB');
    
    // First, drop any existing indexes except _id_
    console.log('Dropping existing indexes...');
    try {
      await Users.collection.dropIndexes();
    } catch (error) {
      console.log('No indexes to drop or error dropping indexes:', error.message);
    }
    
    // Clean up phone numbers
    console.log('Cleaning up phone numbers...');
    // Update documents with null/undefined phoneNumber to empty array
    await Users.updateMany(
      { phoneNumber: { $in: [undefined, null] } },
      { $set: { phoneNumber: [] } }
    );
    
    // Create indexes one by one
    console.log('Creating indexes...');
    
    // Create email index
    await Users.collection.createIndex({ email: 1 }, { unique: true });
    console.log('Created email index');
    
    // Create firstName index
    await Users.collection.createIndex({ firstName: 1 });
    console.log('Created firstName index');
    
    // Create regular index for phoneNumber (without unique constraint)
    await Users.collection.createIndex(
      { phoneNumber: 1 },
      { sparse: true }
    );
    console.log('Created phoneNumber index');
    
    console.log('All indexes created successfully!');
    console.log('Current indexes:', await Users.collection.indexes());
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

rebuildIndexes();
