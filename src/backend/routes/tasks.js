const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

const ALLOWED_STATUS = new Set(['Todo', 'InProgress', 'Done']);
const ALLOWED_PRIORITY = new Set(['High', 'Medium', 'Low']);

function buildWhereClause({ userId, status, priority, category }) {
    let where = 'user_id = ?';
    const params = [userId];

    if (status !== undefined && status !== '') {
        if (!ALLOWED_STATUS.has(status)) {
            return null;
        }
        where += ' AND status = ?';
        params.push(status);
    }

    if (priority !== undefined && priority !== '') {
        if (!ALLOWED_PRIORITY.has(priority)) {
            return null;
        }
        where += ' AND priority = ?';
        params.push(priority);
    }

    if (typeof category === 'string' && category.trim()) {
        where += ' AND category = ?';
        params.push(category.trim());
    }

    return { where, params };
}

// GET /api/tasks - Get all tasks for logged-in user (with filters)
router.get('/', (req, res) => {
    const clause = buildWhereClause({
        userId: req.user.id,
        status: req.query.status,
        priority: req.query.priority,
        category: req.query.category,
    });

    if (clause === null) {
        return res.status(400).json({ error: 'Invalid filter parameter' });
    }

    const sql = `SELECT * FROM tasks WHERE `${clause.where}` ORDER BY created_at DESC`;
    db.all(sql, clause.params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
        res.json(rows);
    });
});

// POST /api/tasks - Create new task
router.post('/', (req, res) => {
    const { title, description, priority, status, due_date, category } = req.body;

    if (!title) return res.status(400).json( { message: 'Title is required.' });

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
