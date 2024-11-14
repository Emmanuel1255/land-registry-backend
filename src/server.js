// src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/property');
const verificationRoutes = require('./routes/verification');
const transferRoutes = require('./routes/transfer');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const { errorHandler, notFound } = require('./middleware/error');
const { requestLogger } = require('./utils/logger');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB events
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Security Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization
app.use(mongoSanitize()); // Against NoSQL query injection
app.use(xss()); // Against XSS

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/properties/transfer', transferRoutes);
app.use('/api/users', userRoutes);  
app.use('/api/dashboard', dashboardRoutes);

// Basic route for API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Land Registry API',
    version: '1.0.0',
    description: 'API for managing land registry and property transfers',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      properties: {
        list: 'GET /api/properties',
        create: 'POST /api/properties',
        get: 'GET /api/properties/:id',
        update: 'PUT /api/properties/:id',
        search: 'GET /api/properties/search'
      },
      verification: {
        submit: 'POST /api/verification/submit',
        approve: 'PUT /api/verification/:id/approve',
        status: 'GET /api/verification/status/:propertyId'
      },
      transfer: {
        initiate: 'POST /api/transfer/initiate',
        approve: 'PUT /api/transfer/:id/approve',
        complete: 'POST /api/transfer/:id/complete'
      }
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Unhandled rejection handler
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
    🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
    👉 http://localhost:${PORT}
    📝 API Documentation: http://localhost:${PORT}/api/docs
    ❤️  Health Check: http://localhost:${PORT}/api/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Performing graceful shutdown...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('💤 Process terminated!');
      process.exit(0);
    });
  });
});

module.exports = { app, server };