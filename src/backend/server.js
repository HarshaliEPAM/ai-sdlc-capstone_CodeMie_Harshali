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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

// Start server
const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 3000);
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
