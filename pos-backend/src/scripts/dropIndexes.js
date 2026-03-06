const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');

console.log('🔧 Environment loaded');

const dropIndexes = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.error('❌ MONGODB_URI is undefined!');
      process.exit(1);
    }
    
    console.log('🔗 Connecting to MongoDB...');
    console.log('📍 URI:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('⚠️ Dropping existing indexes...');
    
    try {
      await mongoose.connection.collection('users').dropIndexes();
      console.log('✅ Dropped all User indexes');
    } catch (err) {
      console.log('⚠️ User collection not found or indexes already dropped');
    }
    
    try {
      await mongoose.connection.collection('verifications').dropIndexes();
      console.log('✅ Dropped all Verification indexes');
    } catch (err) {
      console.log('⚠️ Verification collection not found or indexes already dropped');
    }
    
    console.log('\n✅ Done! Closing connection...');
    await mongoose.connection.close();
    console.log('✅ Now restart your server to recreate indexes automatically.');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

dropIndexes();