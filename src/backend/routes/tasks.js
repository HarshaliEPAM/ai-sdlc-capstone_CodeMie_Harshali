const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

function buildFilterWhereClause(query = {}) {
    const whereParts = [];
    const params = [];

    if (typeof query.status === 'string' && query.status.trim()) {
        const status = query.status.trim();
        const allowedStatus = new Set(['Todo', 'InProgress', 'Done']);
        if (!allowedStatus.has(status)) throw new Error('INVALID_FILTER');
        whereParts.push('status = ?');
        params.push(status);
    }

    if (typeof query.priority === 'string' && query.priority.trim()) {
        const priority = query.priority.trim();
        const allowedPriority = new Set(['High', 'Medium', 'Low']);
        if (!allowedPriority.has(priority)) throw new Error('INVALID_FILTER');
        whereParts.push('priority = ?');
        params.push(priority);
    }

    if (typeof query.category === 'string' && query.category.trim()) {
        const category = query.category.trim();
        if (category.length > 100) throw new Error('INVALID_FILTER');
        whereParts.push('category = ?');
        params.push(category);
    }

    if (whereParts.length === 0) return { clause: '', params: [] };
    return { clause: 'AND ' + whereParts.join(' AND '), params };
}

// GET /api/tasks - Getall tasks for logged-in user. Supports optional filters via query params.
router.get('/', (req, res) => {
    try {
        const { clause: filterClause, params: filterParams } = buildFilterWhereClause(req.query);
        const sql = `SELECT * FROM tasks WHERE user_id = ? ${filterClause} ORDER BY created_at DESC`
            .replace(/\n/g, ' ');

        const params = [req.user.id, ...filterParams];

        db.all(sql, params, (err, rows) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
            res.json(rows);
        });
    } catch (err) {
        if (err && err.message === 'INVALID_FILTER') {
            return res.status(400).json({ error: 'Invalid filter parameter' });
        }
        return res.status(500).json( { error: 'Internal server error' });
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
        res.status(201).json( { message: 'Task created!', taskId: this.lastID });
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
        if (err) return res.status(500).json( { message: 'Failed to update task.', error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Task not found.' });
        res.json( { message: 'Task updated successfully!' });
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
