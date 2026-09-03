 const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

// GET /api/tasks - Get all tasks for logged-in user
router.get('/', (req, res) => {
    const sql = `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC`;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
        res.json(rows);
    });
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

// GET /api/tasks/export(.csv) - Export filtered tasks as CSV
router.get(['/export', '/export.csv'], (req, res) => {
    const {
        search,
        status,
        priority,
        category,
        dueFrom,
        dueTo,
        sortBy,
        sortOrder
    } = req.query;

    const allowedSort = new Set(['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title']);
    const sortField = allowedSort.has(String(sortBy || 'created_at')) ? String(sortBy || 'created_at') : 'created_at';
    const order = String(sortOrder || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const where = ['user_id = ?'];
    const params = [req.user.id];

    if (search) {
        where.push('(title LIKE ? OR description LIKE ? OR category LIKE ?)');
        const like = `%${String(search)}%`;
        params.push(like, like, like);
    }
    if (status) {
        where.push('status = ?');
        params.push(String(status));
    }
    if (priority) {
        where.push('priority = ?');
        params.push(String(priority));
    }
    if (category) {
        where.push('category = ?');
        params.push(String(category));
    }
    if (dueFrom) {
        where.push('date(due_date) >= date(?)');
        params.push(String(dueFrom));
    }
    if (dueTo) {
        where.push('date(due_date) <= date(?)');
        params.push(String(dueTo));
    }

    const sql = `SELECT id,title,description,status,priority,category,due_date,created_at,updated_at
                 FROM tasks
                 WHERE ${where.join(' AND ')}
                 ORDER BY ${sortField} ${order}`;
    // (sql is constructed above with filters/sort)
    // const sql = ...

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to generate export' });
        }

        const header = 'id,title,description,status,priority,category,due_date,created_at,updated_at';
        const escapeCsv = (value) => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            // RFC4180-ish escaping: wrap in quotes if contains special chars, double internal quotes
            const needsQuotes = /[",\n\r]/.test(str);
            const escaped = str.replace(/"/g, '""');
            return needsQuotes ? `"${escaped}"` : escaped;
        };

        const lines = [header, ...rows.map((r) => [
            r.id,
            r.title,
            r.description,
            r.status,
            r.priority,
            r.category,
            r.due_date,
            r.created_at,
            r.updated_at
        ].map(escapeCsv).join(','))];

        const csv = `${lines.join('\n')}\n`;

        const pad = (n) => String(n).padStart(2, '0');
        const now = new Date();
        const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="tasks_export_${stamp}.csv"`);
        return res.status(200).send(csv);
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
