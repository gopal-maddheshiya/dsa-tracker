const mongoose = require('mongoose');

/**
 * Connects to MongoDB using Mongoose.
 * Reads MONGO_URI from environment variables.
 * Throws a descriptive error if connection fails or MONGO_URI is missing.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    const error = new Error('Database connection failed: MONGO_URI is not defined in environment variables.');
    console.error(`❌ [Database Error]: ${error.message}`);
    throw error;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ [Database]: MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ [Database Error]: Connection to MongoDB failed - ${error.message}`);
    throw error;
  }
};

/**
 * Disconnects from MongoDB (useful for graceful shutdown and testing).
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 [Database]: MongoDB disconnected successfully');
  } catch (error) {
    console.error(`❌ [Database Error]: Error disconnecting from MongoDB - ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
