const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

function buildSearchWhereClause(search) {
    if (typeof search !== 'string') return { clause: '',  params: [] };
    const q = search.trim();
    if (!q) return { clause: '', params: [] };
    if (q.length > 100) throw new Error('INVALID_SEARCH');

    const pattern = `%{${q.toLowerCase()}%`,;
    return {
        clause: 'AND  (lower(title) LIKE ? OR lower(COALESCE(description, '')) LIKE ?)
        ,
        params: [pattern, pattern]
    };
}

// GET /api/tasks - Get all tasks for logged-in user. Supports optional fuzzy search by title/description.
router.get('/', (req, res) => {
    try {
        const { search } = req.query;
        const { clause: searchClause, params: searchParams } = buildSearchWhereClause(search);

        const sql = `
          SELECT * FROM tasks
          WHERE user_id = ?
          ${searchClause}
          ORDER BY created_at DESC`
          .replace(/\n/g, ' ');

        const params = [req.user.id, ...searchParams];

        db.all(sql, params, (err, rows) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch tasks.', error: err.message });
            res.json(rows);
        });
    } catch (err) {
        if (err && err.message === 'INVALID_SEARCH') {
            return res.status(400).json( { message: 'Invalid search parameter' });
        }
        return res.status(500).json({ message: 'Internal server error' });
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
