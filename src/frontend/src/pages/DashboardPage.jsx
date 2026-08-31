import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Container,
    Grid,
    Snackbar,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';
import { deleteTask, downloadTasksCsv, getTasks } from '../services/api';

const priorityColors = { High: 'error', Medium: 'warning', Low: 'success' };
const statusColors = { Todo: 'default', InProgress: 'primary', Done: 'success' };

export default function DashboardPage() {
    const [tasks, setTasks] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [toast, setToast] = useState({ open: false, severity: 'success', message: '' });

    const { user } = useAuth();
    const navigate = useNavigate();

    const exportParams = useMemo(() => {
        // Current UI only supports filtering by status; map that to API filter params.
        return {
            status: filterStatus === 'All' ? undefined : filterStatus,
        };
    }, [filterStatus]);

    const fetchTasks = async () => {
        try {
            const res = await getTasks(exportParams);
            setTasks(res.data);
            setFiltered(res.data);
        } catch {
            navigate('/login');
        }
    };

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Keep client-side filtered list for existing UI.
        setFiltered(filterStatus === 'All' ? tasks : tasks.filter((t) => t.status === filterStatus));
    }, [filterStatus, tasks]);

    const handleDelete = async (id) => {
        await deleteTask(id);
        fetchTasks();
    };

    const handleEdit = (task) => {
        setEditTask(task);
        setOpenForm(true);
    };

    const handleExportCsv = async () => {
        try {
            const res = await downloadTasksCsv(exportParams);

            if (res.status === 200) {
                const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);

                const contentDisposition = res.headers?.['content-disposition'] || '';
                const match = /filename=([^;]+)/i.exec(contentDisposition);
                const filename = match?.[1] ? match[1].trim() : 'tasks_export.csv';

                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                return;
            }

            if (res.status === 401) {
                setToast({ open: true, severity: 'error', message: 'Session expired. Please login again.' });
                navigate('/login');
                return;
            }

            // Attempt to parse API error from blob response
            let message = 'Failed to export CSV.';
            try {
                const txt = await res.data.text();
                const parsed = JSON.parse(txt);
                message = parsed?.message || message;
            } catch {
                // ignore
            }
            setToast({ open: true, severity: 'error', message });
        } catch {
            setToast({ open: true, severity: 'error', message: 'Failed to export CSV.' });
        }
    };

    return (
        <>
            <Navbar />
            <Container sx={{ mt: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">
                        Welcome, {user?.username}! 👋
                    </Typography>
                    <Box display="flex" gap={2}>
                        <Button variant="outlined" onClick={handleExportCsv}>
                            Export as CSV
                        </Button>
                        <Button
                            variant="contained"
                            data-testid="add-task-btn"
                            onClick={() => {
                                setEditTask(null);
                                setOpenForm(true);
                            }}
                        >
                            + Add Task
                        </Button>
                    </Box>
                </Box>

                {/* Stats */}
                <Box display="flex" gap={2} mb={3}>
                    {['All', 'Todo', 'InProgress', 'Done'].map((s) => (
                        <Chip
                            key={s}
                            label={`${s}: ${s === 'All' ? tasks.length : tasks.filter((t) => t.status === s).length}`}
                            color={s === 'All' ? 'default' : statusColors[s]}
                            onClick={() => setFilterStatus(s)}
                            variant={filterStatus === s ? 'filled' : 'outlined'}
                        />
                    ))}
                </Box>

                {/* Task Cards */}
                <Grid container spacing={2}>
                    {filtered.map((task) => (
                        <Grid item xs={12} sm={6} md={4} key={task.id}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6">{task.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        {task.description}
                                    </Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap">
                                        <Chip
                                            size="small"
                                            label={task.priority}
                                            color={priorityColors[task.priority]}
                                            data-testid={`priority-badge-${task.priority?.toLowerCase()}`}
                                        />
                                        <Chip size="small" label={task.status} color={statusColors[task.status]} />
                                        {task.category && <Chip size="small" label={task.category} />}
                                    </Box>
                                    {task.due_date && (
                                        <Typography variant="caption" display="block" mt={1}>
                                            📅 Due: {task.due_date}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button size="small" onClick={() => handleEdit(task)}>
                                        Edit
                                    </Button>
                                    <Button size="small" color="error" onClick={() => handleDelete(task.id)}>
                                        Delete
                                    </Button>
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

                <TaskForm open={openForm} onClose={() => setOpenForm(false)} onSaved={fetchTasks} editTask={editTask} />

                <Snackbar
                    open={toast.open}
                    autoHideDuration={5000}
                    onClose={() => setToast((t) => ({ ...t, open: false }))}
                >
                    <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
                        {toast.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
}
