import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { createTask, updateTask } from '../services/api';

export default function TaskForm({ open, onClose, onSaved, editTask }) {
    const [form, setForm] = useState({
        title: '', description: '', priority: 'Medium',
        status: 'Todo', due_date: '', category: ''
    });

    useEffect(() => {
        if (editTask) setForm(editTask);
        else setForm({ title: '', description: '', priority: 'Medium',
            status: 'Todo', due_date: '', category: '' });
    }, [editTask]);

    const handleSubmit = async () => {
        try {
            if (editTask) await updateTask(editTask.id, form);
            else await createTask(form);
            onSaved(); onClose();
        } catch (err) { alert('Failed to save task.'); }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogContent>
                <TextField fullWidth label="Title" margin="normal" data-testid="task-title"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <TextField fullWidth label="Description" margin="normal" multiline rows={2}
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Priority</InputLabel>
                    <Select data-testid="priority" value={form.priority} label="Priority"
                        onChange={e => setForm({ ...form, priority: e.target.value })}>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Low">Low</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select value={form.status} label="Status"
                        onChange={e => setForm({ ...form, status: e.target.value })}>
                        <MenuItem value="Todo">Todo</MenuItem>
                        <MenuItem value="InProgress">In Progress</MenuItem>
                        <MenuItem value="Done">Done</MenuItem>
                    </Select>
                </FormControl>
                <TextField fullWidth label="Category" margin="normal"
                    value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                <TextField fullWidth label="Due Date" type="date" margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}
                    data-testid="save-task-btn">
                    {editTask ? 'Update' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}