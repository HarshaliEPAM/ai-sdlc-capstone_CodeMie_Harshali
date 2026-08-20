const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  const timestamp = new Date().toISOString();

  db.get('SELECT 1', (err) => {
    if (err) {
      return res.status(500).json({
        status: 'DOWN',
        error: 'DB connection failed',
        timestamp,
      });
    }

    resjson({
      status: 'UP',
      checks: [{ name: 'db', status: 'UP' }],
      timestamp,
    });
  });
});

module.exports = router;
