import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Grid, Chip, Card,
    CardContent, CardActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { getTasks, deleteTask } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import Navbar from '../components/Navbar';

const priorityColors = { High: 'error', Medium: 'warning', Low: 'success' };
const statusColors = { Todo: 'default', InProgress: 'primary', Done: 'success' };

export default function DashboardPage() {
    const [tasks, setTasks] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchTasks = async () => {
        try {
            const res = await getTasks();
            setTasks(res.data);
            setFiltered(res.data);
        } catch { navigate('/login'); }
    };

    useEffect(() => { fetchTasks(); }, []);

    useEffect(() => {
        setFiltered(filterStatus === 'All' ? tasks :
            tasks.filter(t => t.status === filterStatus));
    }, [filterStatus, tasks]);

    const handleDelete = async (id) => {
        await deleteTask(id);
        fetchTasks();
    };

    const handleEdit = (task) => { setEditTask(task); setOpenForm(true); };

    return (
        <>
            <Navbar />
            <Container sx={{ mt: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">
                        Welcome, {user?.username}! 👋
                    </Typography>
                    <Button variant="contained" data-testid="add-task-btn"
                        onClick={() => { setEditTask(null); setOpenForm(true); }}>
                        + Add Task
                    </Button>
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
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6">{task.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        {task.description}
                                    </Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap">
                                        <Chip size="small" label={task.priority}
                                            color={priorityColors[task.priority]}
                                            data-testid={`priority-badge-${task.priority?.toLowerCase()}`} />
                                        <Chip size="small" label={task.status}
                                            color={statusColors[task.status]} />
                                        {task.category && <Chip size="small" label={task.category} />}
                                    </Box>
                                    {task.due_date && (
                                        <Typography variant="caption" display="block" mt={1}>
                                            📅 Due: {task.due_date}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button size="small" onClick={() => handleEdit(task)}>Edit</Button>
                                    <Button size="small" color="error"
                                        onClick={() => handleDelete(task.id)}>Delete</Button>
                                </CardActions>
                            </Card>
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
            </Container>
        </>
    );
}