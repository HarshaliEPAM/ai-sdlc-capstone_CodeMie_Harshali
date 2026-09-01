const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { buildTaskQuery } = require('../services/taskQuery');
const { csvLine } = require('../utils/csv');

function pad2(n) {
    return String(n).padStart(2, '0');
}

function formatTimestampForFilename(d = new Date()) {
    return (
        d.getFullYear() +
        pad2(d.getMonth() + 1) +
        pad2(d.getDate()) +
        '_' +
        pad2(d.getHours()) +
        pad2(d.getMinutes()) +
        pad2(d.getSeconds())
    );
}

// All routes below require authentication
router.use(authMiddleware);

// GET /api/tasks - Get all tasks for logged-in user (supports filters/sorting)
router.get('/', (req, res) => {
    const { search, status, priority, category, dueFrom, dueTo, sortBy, sortOrder } = req.query;

    const built = buildTaskQuery({
        userId: req.user.id,
        filters: { search, status, priority, category, dueFrom, dueTo, sortBy, sortOrder },
    });

    if (!built.ok) return res.status(built.error.status).json(built.error.body);

    db.all(built.sql, built.params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
        res.json(rows);
    });
});

// GET /api/tasks/export.csv - Export filtered tasks as CSV
router.get('/export.csv', (req, res) => {
    const { search, status, priority, category, dueFrom, dueTo, sortBy, sortOrder } = req.query;

    const built = buildTaskQuery({
        userId: req.user.id,
        filters: { search, status, priority, category, dueFrom, dueTo, sortBy, sortOrder },
    });

    if (!built.ok) return res.status(built.error.status).json(built.error.body);

    const filename = `tasks_export_${formatTimestampForFilename(new Date())}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    // Quote filename for better cross-browser parsing and ensure ASCII-safe characters.
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // CSV header
    res.write(
        csvLine([
            'id',
            'title',
            'description',
            'status',
            'priority',
            'category',
            'due_date',
            'created_at',
            'updated_at',
        ])
    );

    let streamErrored = false;

    db.each(
        built.sql,
        built.params,
        (err, row) => {
            if (err) {
                streamErrored = true;
                // Response already started; just close.
                res.end();
                return;
            }

            res.write(
                csvLine([
                    row.id,
                    row.title,
                    row.description,
                    row.status,
                    row.priority,
                    row.category,
                    row.due_date,
                    row.created_at,
                    row.updated_at,
                ])
            );
        },
        (err) => {
            if (err || streamErrored) {
                // If headers not sent yet, we can still return JSON error.
                if (!res.headersSent) {
                    return res
                        .status(500)
                        .json({ error: 'INTERNAL_ERROR', message: 'Failed to generate export' });
                }
                return res.end();
            }
            res.end();
        }
    );
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
