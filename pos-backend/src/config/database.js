const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ✅ Use MONGODB_URI instead of MONGO_URI
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    console.log('🔗 Connecting to MongoDB:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connected');
    
    // ✅ Sync indexes
    const User = require('../models/User');
    const Verification = require('../models/Verification');
    
    console.log('🔄 Syncing indexes...');
    
    await User.collection.dropIndexes().catch(() => {});
    await User.syncIndexes();
    console.log('✅ User indexes synced');
    
    await Verification.collection.dropIndexes().catch(() => {});
    await Verification.syncIndexes();
    console.log('✅ Verification indexes synced');
    
    const userIndexes = await User.collection.getIndexes();
    console.log('📋 User indexes:', Object.keys(userIndexes));
    
    const verificationIndexes = await Verification.collection.getIndexes();
    console.log('📋 Verification indexes:', Object.keys(verificationIndexes));
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;