const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './db/capstone.db';

// Create db directory if it doesn't exist
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Initialize tables
const initSQL = fs.readFileSync(
    path.join(__dirname, 'init.sql'),
    'utf8'
);

db.exec(initSQL, (err) => {
    if (err) {
        console.error('❌ Table initialization error:', err.message);
    } else {
        console.log('✅ Database tables initialized');
    }
});

module.exports = db; 
