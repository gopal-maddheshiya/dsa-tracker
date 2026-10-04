const path = require('path');
const dotenv = require('dotenv');

// 1. Explicitly load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Server startup lifecycle:
 * 1. Establish MongoDB connection first.
 * 2. Start Express HTTP server only after database is connected.
 * 3. Halt process with clear error message if database connection fails.
 */
async function startServer() {
  try {
    // 2. Connect to MongoDB
    await connectDB();

    // 3. Start listening on HTTP port & host
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 [Server]: DSA Tracker API running on http://${HOST}:${PORT}`);
      console.log(`🩺 [Server]: Health check available at http://${HOST}:${PORT}/api/health`);
    });

    // Graceful termination handlers (Render sends SIGTERM on rollout)
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
  } catch (error) {
    console.error(`💥 [Server Fatal]: Failed to start application - ${error.message}`);
    process.exit(1);
  }
}

// Execute server start
startServer();

module.exports = { startServer };
