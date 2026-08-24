const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

function parseInt(str, defaultVal) {
    const n = Number.parseInt(str, 10);
    return Number.isFinite(n) ? n : defaultVal;
}

function validatePagination(page, limit) {
    if (page < 1) return false;
    if (![10, 25, 50, 100].includes(limit)) return false;
    return true;
}

// GET /api/tasks - paginated task list
router.get('/', (req, res) => {
    const page = parseInt(req.query.page, 1);
    const limit = parseInt(req.query.limit, 10);
    if (!validatePagination(page, limit)) {
        return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const offset = (page - 1) * limit;
    const baseWhere = `FROM tasks WHERE user_id = ?`;
    const params = [req.user.id];

    const countSql = `SELECT COUNT(*) AS total ${baseWhere}`;
    db.get(countSql, params, (countErr, countRow) => {
        if (countErr) {
            return res.status(500).json({ message: 'Failed to fetch tasks.', error: countErr.message });
        }
        const total = countRow?.total || 0;
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        const dataSql = `SELECT * ${baseWhere} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        db.all(dataSql, [...params, limit, offset], (dataErr, rows) => {
            if (dataErr) return res.status(500).json({ message: 'Failed to fetch tasks.', error: dataErr.message });
            res.json( {
                tasks: rows,
                pagination: {
                    total,
                    page,
                    pageSize: limit,
                    totalPages: totalPages,
                },
            });
        });
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
