const dotenv = require('dotenv');

// Load environment variables before initializing app or db
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Initialize database connection
connectDB();

// Start HTTP server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [Server]: DSA Tracker API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ [Unhandled Rejection]: ${err.message}`);
});
