const express = require('express');
const morgan = require('morgan');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Routes 
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/transfers', require('./routes/transfers'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler — catches any error thrown in controllers
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle axios errors from NIBSS calls
  if (err.response) {
    return res.status(err.response.status).json({
      message: err.response.data?.message || 'NIBSS API error',
    });
  }

  res.status(500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;