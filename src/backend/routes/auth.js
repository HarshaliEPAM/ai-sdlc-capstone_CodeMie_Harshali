 const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
require('dotenv').config();

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
    db.run(sql, [username, email, hashedPassword], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(409).json({ message: 'Username or email already exists.' });
            }
            return res.status(500).json({ message: 'Registration failed.', error: err.message });
        }
        res.status(201).json({ message: 'User registered successfully!', userId: this.lastID });
    });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], (err, user) => {
        if (err) return res.status(500).json({ message: 'Login failed.', error: err.message });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid) return res.status(401).json({ message: 'Invalid password.' });

        const secret = process.env.JWT_SECRET;
        // Fail fast if secret is not configured (avoid insecure default in non-test envs)
        if (!secret && process.env.NODE_ENV !== 'test') {
            return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            secret || 'qa-local-dev-secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    });
});

module.exports = router;
