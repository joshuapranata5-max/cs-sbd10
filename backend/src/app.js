const express = require('express');
const cors = require('cors');     
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

app.use(cors({
  origin: true, // Allow all origins securely
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  credentials: true
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    payload: null
  }
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/user', userRoutes);
app.use('/items', itemRoutes);
app.use('/transaction', transactionRoutes);
app.use('/reports', reportRoutes);
app.use('/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    payload: null,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;