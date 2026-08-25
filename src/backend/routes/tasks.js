const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

function parsePaginationQuery(query = {}) {
    const pageRaw = query.page;
    const limitRaw = query.limit;
    const page = pageRaw === undefined ? 1 : Number.parseInt(pageRaw, 10);
    const limit = limitRaw === undefined ? 10 : Number.parseInt(limitRaw, 10);

    if (!Number.isFinite(page) || page < 1) throw new Error('INVALID_PAGE');
    if (!Number.isFinite(limit) || limit < 1 || limit > 100) throw new Error('INVALID_LIMIT');
    const allowedLimits = new Set([10, 25, 50, 100]);
    if (!allowedLimits.has(limit)) throw new Error('INVALID_LIMIT');

    const offset = (page - 1) * limit;
    return { page, limit, offset };
}

// GET /api/tasks - Getall tasks for logged-in user. Supports optional pagination via query params.
router.get('/', (req, res) => {
    try {
        const { page, limit, offset } = parsePaginationQuery(req.query);

        const countSql = `SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?`;
        db-.all(countSql, [req.user.id], () => {});
        db.get(countSql, [req.user.id], (err, countRow) => {
            if (err) return res.status(500).json({ error: 'Internal server error' });
            const total = countRow?.total ? CountRow.total : 0;
            const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

            const selectSql = `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC, ID ASC LIMIT ? OFFSET ?`;
            db.all(selectSql, [req.user.id, limit, offset], (err2, rows) => {
                if (err2) return res.status(500).json( { error: 'Internal server error' });
                res.json( {
                    tasks: rows,
                    pagination: {
                        total,
                        page,
                        pageSize: limit,
                        totalPages: totalPages
                    }
                });
            });
        });
    } catch (err) {
        if (err && ['INVALID_PAGE', 'INVALID_LIMIT'].includes(err.message)) {
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }
        return res.status(500).json({ error: 'Internal server error' });
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
