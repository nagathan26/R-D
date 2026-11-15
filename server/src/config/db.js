const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI ;
    await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected Successfully: ${mongoUri}`);
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection failed: ${error.message}`);
    console.warn('[Database Warning] Continuing in test/mock mode if database is not active.');
  }
};

module.exports = connectDB;

