const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const indiaRoutes = require('./routes/india.routes');

const app = express();

// Flexible CORS for Vercel, localhost, and custom domains
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.includes('vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Root endpoint so visiting the URL directly shows a clear message
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'India R&D Tax Incentive Platform API Server is Online',
    health: '/api/health',
    screener: '/api/v1/india/eligibility/screen'
  });
});

// Indian Jurisdiction API Endpoints (v1)
app.use('/api/v1/india', indiaRoutes);

// Health check with real-time MongoDB status
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'UP',
    jurisdiction: 'India (Income-tax Act 1961 / DPIIT / DSIR)',
    database: {
      connected: isDbConnected,
      status: isDbConnected ? 'CONNECTED' : 'DISCONNECTED'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.statusCode || (err.message && err.message.includes('not found') ? 404 : 500);
  return res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;