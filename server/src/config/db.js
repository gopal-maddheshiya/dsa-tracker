const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the connection string from environment variables.
 * Logs a clear success message or reports connection failure without crashing the process silently.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn('⚠️ [Database Warning]: MONGO_URI is not defined in environment variables. Running without active MongoDB connection.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ [Database]: MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [Database Error]: Failed to connect to MongoDB - ${error.message}`);
  }
};

module.exports = connectDB;
