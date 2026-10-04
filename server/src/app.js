const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const problemRoutes = require('./routes/problem.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Disable Express fingerprinting
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Production-ready CORS Configuration
const defaultOrigins = [
  'http://localhost:5173',
  'https://dsa-tracker-xi-weld.vercel.app',
];

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, test suites)
      if (!origin) return callback(null, true);

      // Check configured origins, known project Vercel domains, or localhost in development
      const isAllowed =
        allowedOrigins.includes(origin) ||
        (origin.startsWith('https://dsa-tracker') && origin.endsWith('.vercel.app')) ||
        (process.env.NODE_ENV !== 'production' &&
          (origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:') ||
            origin.startsWith('http://192.168.') ||
            origin.startsWith('http://10.') ||
            /^http:\/\/172\.(1[6-9]|2\d|3[01])\./.test(origin)));

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow access from origin: ${origin}`), false);
    },
    credentials: true,
  })
);

// Global JSON Middleware with 100kb body size boundary
app.use(express.json({ limit: '100kb' }));

// Base Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DSA / Interview Prep Tracker API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
