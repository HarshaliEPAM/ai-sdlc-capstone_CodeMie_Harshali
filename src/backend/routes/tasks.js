 const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// All routes below require authentication
router.use(authMiddleware);

// ============ SEARCH ENDPOINT (must come before /:id routes) ============

// GET /api/tasks/search - Advanced search with keyword and tag filters
router.get('/search', (req, res) => {
    const { keyword, tags } = req.query;

    let sql = `SELECT DISTINCT t.* FROM tasks t
               LEFT JOIN task_tags tt ON t.id = tt.task_id
               WHERE t.user_id = ?`;
    const params = [req.user.id];

    // Add keyword search filter
    if (keyword) {
        sql += ` AND (t.title LIKE ? OR t.description LIKE ? OR t.category LIKE ?)`;
        const keywordPattern = `%${keyword}%`;
        params.push(keywordPattern, keywordPattern, keywordPattern);
    }

    // Add tag filter
    if (tags) {
        const tagIds = tags.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        if (tagIds.length > 0) {
            const placeholders = tagIds.map(() => '?').join(',');
            sql += ` AND tt.tag_id IN (${placeholders})`;
            params.push(...tagIds);
        }
    }

    sql += ` ORDER BY t.created_at DESC`;

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Search failed.', error: err.message });
        res.json(rows);
    });
});

// ============ TAGS ENDPOINTS ============

// GET /api/tags - Get all tags (moved before task routes)
router.get('/tags', (req, res) => {
    const sql = `SELECT * FROM tags ORDER BY name ASC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch tags.', error: err.message });
        res.json(rows);
    });
});

// POST /api/tags - Create a new tag
router.post('/tags', (req, res) => {
    const { name, color } = req.body;

    if (!name) return res.status(400).json({ message: 'Tag name is required.' });

    const sql = `INSERT INTO tags (name, color) VALUES (?, ?)`;
    db.run(sql, [name, color || '#3b82f6'], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ message: 'Tag already exists.' });
            }
            return res.status(500).json({ message: 'Failed to create tag.', error: err.message });
        }
        res.status(201).json({ message: 'Tag created!', tagId: this.lastID });
    });
});

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

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
    const sql = `DELETE FROM tasks WHERE id=? AND user_id=?`;
    db.run(sql, [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ message: 'Failed to delete task.', error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Task not found.' });
        res.json({ message: 'Task deleted successfully!' });
    });
});

// ============ COMMENTS ENDPOINTS ============

// GET /api/tasks/:id/comments - Get all comments for a task
router.get('/:id/comments', (req, res) => {
    const sql = `SELECT c.* FROM comments c
                 INNER JOIN tasks t ON c.task_id = t.id
                 WHERE c.task_id = ? AND t.user_id = ?
                 ORDER BY c.created_at DESC`;
    db.all(sql, [req.params.id, req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch comments.', error: err.message });
        res.json(rows);
    });
});

// POST /api/tasks/:id/comments - Add a comment to a task
router.post('/:id/comments', (req, res) => {
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: 'Content is required.' });

    // Verify task belongs to user
    db.get('SELECT id FROM tasks WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id], (err, task) => {
        if (err) return res.status(500).json({ message: 'Database error.', error: err.message });
        if (!task) return res.status(404).json({ message: 'Task not found.' });

        const sql = `INSERT INTO comments (task_id, content) VALUES (?, ?)`;
        db.run(sql, [req.params.id, content], function (err) {
            if (err) return res.status(500).json({ message: 'Failed to add comment.', error: err.message });
            res.status(201).json({ message: 'Comment added!', commentId: this.lastID });
        });
    });
});

// DELETE /api/comments/:id - Delete a comment
router.delete('/comments/:id', (req, res) => {
    // Verify comment belongs to a task owned by the user
    const sql = `DELETE FROM comments WHERE id = ? AND task_id IN
                 (SELECT id FROM tasks WHERE user_id = ?)`;
    db.run(sql, [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ message: 'Failed to delete comment.', error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Comment not found.' });
        res.json({ message: 'Comment deleted successfully!' });
    });
});

// POST /api/tasks/:id/tags - Add a tag to a task
router.post('/:id/tags', (req, res) => {
    const { tagId } = req.body;

    if (!tagId) return res.status(400).json({ message: 'Tag ID is required.' });

    // Verify task belongs to user
    db.get('SELECT id FROM tasks WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id], (err, task) => {
        if (err) return res.status(500).json({ message: 'Database error.', error: err.message });
        if (!task) return res.status(404).json({ message: 'Task not found.' });

        const sql = `INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)`;
        db.run(sql, [req.params.id, tagId], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ message: 'Tag already added to task.' });
                }
                return res.status(500).json({ message: 'Failed to add tag.', error: err.message });
            }
            res.status(201).json({ message: 'Tag added to task!' });
        });
    });
});

// DELETE /api/tasks/:id/tags/:tagId - Remove a tag from a task
router.delete('/:id/tags/:tagId', (req, res) => {
    const sql = `DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?
                 AND task_id IN (SELECT id FROM tasks WHERE user_id = ?)`;
    db.run(sql, [req.params.id, req.params.tagId, req.user.id], function (err) {
        if (err) return res.status(500).json({ message: 'Failed to remove tag.', error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Tag association not found.' });
        res.json({ message: 'Tag removed from task!' });
    });
});

// GET /api/tasks/:id/tags - Get all tags for a task
router.get('/:id/tags', (req, res) => {
    const sql = `SELECT t.* FROM tags t
                 INNER JOIN task_tags tt ON t.id = tt.tag_id
                 INNER JOIN tasks task ON tt.task_id = task.id
                 WHERE tt.task_id = ? AND task.user_id = ?`;
    db.all(sql, [req.params.id, req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch tags.', error: err.message });
        res.json(rows);
    });
});

module.exports = router;
