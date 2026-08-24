const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

// GET /api/tasks - Getall tasks for logged-in user (with optional filters)
router.get('/', (req, res) => {
    try {
        const { status, priority, category } = req.query;

        const whereParts = ['user_id = ?'];
        const params = [req.user.id];

        // Status filter
        if (typeof status !== 'undefined') {
            if (typeof status !== 'string') {
                return res.status(400).json({ error: 'Invalid filter parameter' });
            }
            const allowedStatus = new Set(['Todo', 'InProgress', 'Done']);
            if (!allowedStatus.has(status)) {
                return res.status(400).json({ error: 'Invalid filter parameter' });
            }
            whereParts.push( 'status = ?' );
            params.push(status);
        }

        // Priority filter
        if (typeof priority !== 'undefined') {
            if (typeof priority !== 'string') {
                return res.status(400).json({ error: 'Invalid filter parameter' });
            }
            const allowedPriority = new Set(['High', 'Medium', 'Low']);
            if (!allowedPriority.has(priority)) {
                return res.status(400).json({ error: 'Invalid filter parameter' });
            }
            whereParts.push('priority = ?');
            params.push(priority);
        }

        // Category filter (exact match)
        if (typeof category !== 'undefined') {
            if (typeof category !== 'string') {
                return res.status(400).json( { error: 'Invalid filter parameter' });
            }
            const cat = category.trim();
            if (cat.length > 0) {
                whereParts.push('category = ?');
                params.push(cat);
            }
        }

        const whereClause = whereParts.length > 0 ? ` WHERE ${whereParts.join(' AND ')}` : '';
        const sql = `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC`;

        db.all(sql, params, (err, rows) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
            res.json(rows);
        });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch tasks.', error: e.message });
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
        if (err) return res.status(500).json( { message: 'Failed to update task.', error: err.message } );
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
