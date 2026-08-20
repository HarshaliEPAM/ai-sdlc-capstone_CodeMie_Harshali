const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Health (compatibility)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

// Health (V1, per design)
app.use('/api/v1/health', require('./routes/health'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
