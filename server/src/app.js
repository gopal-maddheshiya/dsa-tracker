const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/auth.routes');
const problemRoutes = require('./routes/problem.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const syncRoutes = require('./routes/sync.routes');
const aiRoutes = require('./routes/ai.routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { securityHeaders } = require('./middleware/securityHeaders');

const app = express();

// Trust reverse proxy (e.g. Render, Railway, Vercel, Cloudflare, Nginx)
app.set('trust proxy', 1);

// Security HTTP headers
app.use(securityHeaders);

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cross-Origin Resource Sharing
const rawOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];
const allowedOrigins = [
  ...rawOrigins.map((url) => url.trim().replace(/\/+$/, '')),
  'https://dsa-tracker-gopal.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl) or allowed origins
      const normalizedOrigin = origin ? origin.replace(/\/+$/, '') : null;
      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Access denied for this origin'));
      }
    },
    credentials: true,
  })
);

// Keep-alive / Uptime monitor root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DSA Tracker API is active and healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
