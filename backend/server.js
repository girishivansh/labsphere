require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: false
}));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later' }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'mongodb', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/items',   require('./routes/items'));
app.use('/api/issues',  require('./routes/issues'));
app.use('/api/returns', require('./routes/returns'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users',   require('./routes/users'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 ChemLab Backend running on http://localhost:${PORT}`);
  console.log(`🍃 Database  : MongoDB`);
  console.log(`🌍 Frontend  : ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📋 Env       : ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
