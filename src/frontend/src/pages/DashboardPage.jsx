import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Grid, Chip, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getTasks, deleteTask, getTags, createTag, searchTasks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import Navbar from '../components/Navbar';

const statusColors = { Todo: 'default', InProgress: 'primary', Done: 'success' };

export default function DashboardPage() {
    const [tasks, setTasks] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [openTagDialog, setOpenTagDialog] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#3b82f6');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchTasks = async () => {
        try {
            const res = await getTasks();
            setTasks(res.data);
            setFiltered(res.data);
        } catch { navigate('/login'); }
    };

    const fetchTags = async () => {
        try {
            const res = await getTags();
            setAllTags(res.data);
        } catch (err) {
            console.error('Failed to fetch tags:', err);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchTags();
    }, []);

    useEffect(() => {
        setFiltered(filterStatus === 'All' ? tasks :
            tasks.filter(t => t.status === filterStatus));
    }, [filterStatus, tasks]);

    const handleDelete = async (id) => {
        await deleteTask(id);
        fetchTasks();
    };

    const handleEdit = (task) => { setEditTask(task); setOpenForm(true); };

    const handleSearch = async () => {
        try {
            if (searchKeyword || selectedTags.length > 0) {
                const res = await searchTasks(searchKeyword, selectedTags);
                setTasks(res.data);
                setFiltered(res.data);
            } else {
                fetchTasks();
            }
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            await createTag({ name: newTagName, color: newTagColor });
            setNewTagName('');
            setNewTagColor('#3b82f6');
            setOpenTagDialog(false);
            fetchTags();
        } catch (err) {
            console.error('Failed to create tag:', err);
        }
    };

    const toggleTagFilter = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    return (
        <>
            <Navbar />
            <Container sx={{ mt: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">
                        Welcome, {user?.username}! 👋
                    </Typography>
                    <Box display="flex" gap={1}>
                        <Button variant="outlined" onClick={() => setOpenTagDialog(true)}>
                            + Create Tag
                        </Button>
                        <Button variant="contained" data-testid="add-task-btn"
                            onClick={() => { setEditTask(null); setOpenForm(true); }}>
                            + Add Task
                        </Button>
                    </Box>
                </Box>

                {/* Search Bar */}
                <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search tasks..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        sx={{ minWidth: 200 }}
                    />
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                        {allTags.map(tag => (
                            <Chip
                                key={tag.id}
                                label={tag.name}
                                size="small"
                                onClick={() => toggleTagFilter(tag.id)}
                                sx={{
                                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                                    color: selectedTags.includes(tag.id) ? '#fff' : tag.color,
                                    border: `1px solid ${tag.color}`,
                                    cursor: 'pointer'
                                }}
                            />
                        ))}
                    </Box>
                    <Button variant="contained" onClick={handleSearch}>Search</Button>
                    <Button variant="text" onClick={() => {
                        setSearchKeyword('');
                        setSelectedTags([]);
                        fetchTasks();
                    }}>Clear</Button>
                </Box>

                {/* Stats */}
                <Box display="flex" gap={2} mb={3}>
                    {['All','Todo','InProgress','Done'].map(s => (
                        <Chip key={s} label={`${s}: ${s==='All'?tasks.length:tasks.filter(t=>t.status===s).length}`}
                            color={s==='All'?'default':statusColors[s]}
                            onClick={() => setFilterStatus(s)}
                            variant={filterStatus===s?'filled':'outlined'} />
                    ))}
                </Box>

                {/* Task Cards */}
                <Grid container spacing={2}>
                    {filtered.map(task => (
                        <Grid item xs={12} sm={6} md={4} key={task.id}>
                            <TaskCard
                                task={task}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                allTags={allTags}
                            />
                        </Grid>
                    ))}
                    {filtered.length === 0 && (
                        <Grid item xs={12}>
                            <Typography color="text.secondary" textAlign="center" mt={4}>
                                No tasks found. Click "+ Add Task" to get started!
                            </Typography>
                        </Grid>
                    )}
                </Grid>

                <TaskForm open={openForm} onClose={() => setOpenForm(false)}
                    onSaved={fetchTasks} editTask={editTask} />

                {/* Create Tag Dialog */}
                <Dialog open={openTagDialog} onClose={() => setOpenTagDialog(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Create New Tag</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Tag Name"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                        <Box mt={2}>
                            <Typography variant="body2" mb={1}>Color:</Typography>
                            <input
                                type="color"
                                value={newTagColor}
                                onChange={(e) => setNewTagColor(e.target.value)}
                                style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenTagDialog(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleCreateTag}>Create</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
}