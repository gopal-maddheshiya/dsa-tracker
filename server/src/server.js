const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 1. Explicitly load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Server startup lifecycle:
 * 1. Start Express HTTP server on PORT immediately so Vite proxy /api never gets ECONNREFUSED.
 * 2. Connect to MongoDB Atlas.
 * 3. If MongoDB is temporarily unreachable (e.g. WiFi reconnect), retry in background instead of crashing.
 */
async function startServer() {
  // Start HTTP server immediately to prevent ECONNREFUSED on local proxies
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 [Server]: DSA Tracker API running on http://${HOST}:${PORT}`);
    console.log(`🩺 [Server]: Health check available at http://${HOST}:${PORT}/api/health`);
  });

  // Connect to database
  try {
    await connectDB();
  } catch (error) {
    console.error(`⚠️ [Database Warning]: Initial connection failed (${error.message}). Auto-retrying in background...`);
    const retryInterval = setInterval(async () => {
      if (mongoose.connection.readyState === 1) {
        clearInterval(retryInterval);
        return;
      }
      try {
        await connectDB();
        console.log('✅ [Database]: Reconnected to MongoDB successfully!');
        clearInterval(retryInterval);
      } catch (err) {
        console.log(`⏳ [Database]: Still waiting for MongoDB connection (${err.message})...`);
      }
    }, 4000);
  }

  // Graceful termination handlers
  const gracefulShutdown = (signal) => {
    console.log(`${signal} signal received. Closing server gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return server;
}

// Execute server start
startServer();

module.exports = { startServer };
