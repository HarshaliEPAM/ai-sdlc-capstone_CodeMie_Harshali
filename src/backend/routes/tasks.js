const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

// GET /api/tasks - Get all tasks for logged-in user

// Supports: ?sortBy=due_date|priority|created_at|title & order=asc|desc
router.get('/', (req, res) => {
    try {
        const { sortBy, order } = req.query;

        // Allowlist to prevent SQL injection
        const validSortFields = new Set(['due_date', 'priority', 'created_at', 'title']);

        if (typeof sortBy !== 'undefined' && (typeof sortBy !== 'string' || !validSortFields.has(sortBy))) {
            return res.status(400).json({ error: 'Invalid sortBy or order' });
        }

        if (typeof order !== 'undefined' && (typeof order !== 'string' || !['asc', 'desc'].includes(order.toLowerCase()))) {
            return res.status(400).json({ error: 'Invalid sortBy or order' });
        }

        const sortField = typeof sortBy === 'string' ? sortBy : 'created_at';
        const sortOrder = typeof order === 'string' ? order.toLowerCase() : 'desc';

        let orderByClause = `${sortField} ${sortOrder.toUpperCase()}, id ASC`;
        if (sortField === 'priority') {
            // Deterministic priority order: High > Medium > Low
            const dir = sortOrder === 'asc' ? 'ASC' : 'DESC';
            orderByClause = `CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END ${dir}, id ASC`;
        }

        const sql = `SELECT * FROM tasks WHERE user_id = ? ORDER BY ${orderByClause}`;
        db.all(sql, [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
            res.json(rows);
        });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch tasks.', error: 'Internal server error' });
    }
});

// POST /api/tasks - Create new task
router.post('/', (req, res) => {
    const { title, description, priority, status, due_date, category } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const sql = `INSERT INTO tasks (user_id, title, description, priority, status, due_date, category)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [req.user.id, title, description, priority || 'Medium',
        status || 'Todo', due_date, category], function (err) {
        if (err) return res.status(500).json({ message: 'Failed to create task.', error: err.message });
        res.status(201).json({ message: 'Task created!', taskId: this.lastID });
    });
});

// PUT /api/tasks/:id - Update task
router.put('/:id', (req, res) => {
    const { title, description, priority, status, due_date, category } = req.body;
    const sql = `UPDATE tasks SET title=?, description=?, priority=?, status=?,
                 due_date=?, category=?, updated_at=CURRENT_TIMESTAMP
                 WHERE id=? AND user_id=?`;
    db.run(sql, [title, description, priority, status, due_date, category,
        req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ message: 'Failed to update task.', error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Task not found.' });
        res.json({ message: 'Task updated successfully!' });
    });
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
    const sql = `DELETE FROM tasks WHERE id=? AND user_id=?`;
    db.run(sql, [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ message: 'Failed to delete task.', error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Task not found.' });
        res.json({ message: 'Task deleted successfully!' });
    });
});

module.exports = router;
