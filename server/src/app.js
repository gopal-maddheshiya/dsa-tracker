const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cross-Origin Resource Sharing
app.use(cors());

// API Routes
app.use('/api/health', healthRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
