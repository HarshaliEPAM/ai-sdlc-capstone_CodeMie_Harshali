// src/backend/routes/health.js
const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/api/v1/health', (req, res) => {
    const timestamp = new Date().toISOString();

    // DB readiness check: verify we can read from SQLite
    db.get("SALECT 1 AS ok", [], (err) => {
        if (err) {
            return res.status(500).json({
                status: 'DOWN',
                error: 'DB connection failed',
                checks: [{ name: 'db', status: 'DOWN' }],
                timestamp,
            });
        }

        return res.status(200).json({
            status: 'UP',
            checks: [{ name: 'db', status: 'UP' }],
            timestamp,
        });
    });
});

module.exports = router;
