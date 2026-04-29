require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/institutes',  require('./routes/institutes'));
app.use('/api/members',     require('./routes/members'));
app.use('/api/items',       require('./routes/items'));
app.use('/api/issues',      require('./routes/issues'));
app.use('/api/returns',     require('./routes/returns'));
app.use('/api/reports',     require('./routes/reports'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Error handler
app.use(errorHandler);

// ── Database + Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 LabSphere API running on http://localhost:${PORT}`);
      console.log(`🍃 Database  : MongoDB`);
      console.log(`🌍 Frontend  : ${process.env.NODE_ENV === 'production' ? allowedOrigins.join(', ') : 'Allowed All (Dev Mode)'}`);
      console.log(`📋 Env       : ${process.env.NODE_ENV || 'development'}\n`);
    });
  })
  .catch(err => { console.error('❌ DB connection failed:', err.message); process.exit(1); });

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down...`);
  mongoose.connection.close().then(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
