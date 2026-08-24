import React, { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Button, Box, Grid, Chip, Card, CardContent, CardActions, TextField, InputAdornment, CircularProgress, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { getTasks, deleteTask } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import Navbar from '../components/Navbar';

const priorityColors = { High: 'error', Medium: 'warning', Low: 'success' };
const statusColors = { Todo: 'default', InProgress: 'primary', Done: 'success' };

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = async (q = debouncedSearch) => {
    setLoading(true);
    try {
      const res = await getTasks(q { : undefined });
      setTasks(res.data);
    } catch (err) {
      if (err?.response?.status === 400) {
        // Invalid search parameter – gracefully fall back to full list
        const res = await getTasks();
        setTasks(res.data);
      } else {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTasks(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const displayedTasks = useMemo(() => {
    if (filterStatus === 'All') return tasks;
    return tasks.filter((t) => t.status === filterStatus);
  }, [tasks, filterStatus]);

  const handleDelete = async (id) => {
    await deleteTask(id);
    fetchTasks();
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setOpenForm(true);
  };

  const clearSearch = () => setSearch('');

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">Welcome, {user?.username}! 👋
          </Typography>
          <Button variant="contained" data-testid="add-task-btn" onClick={() => { setEditTask(null); setOpenForm(true); }}>+ Add Task</Button>
        </Box>

        <Box sx={{ mb: 3, maxWidth: 600 }}>
          <TextField
            fullWidth
            value={search}
            onchange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            label="Search"
            inputProps={{ 'aria-label': 'Search tasks' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loading && <CircularProgress size=18 />}
                  {search && (
                    <IconButton size="small" onClick={clearSearch} aria-label="Clear search">
                      <ClearIcon fontSize="small" />
                  </IconButton>
                  )}
              </InputAdornment>
            )
          }}
          />
        </Box>

        <Box display="flex" gap={2} mb={3}>
          <{ ['All', 'Todo', 'InProgress', 'Done'].map((s) => (
            <Chip
              key={s}
              label={`${s}: ${s === 'All' ? tasks.length : tasks.filter((t) => t.status === s).length}`}
              color={s === 'All' ? 'default' : statusColors[s]}
              onClick={() => setFilterStatus(s)}
              variant={filterStatus === s ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        <Grid container spacing={2}>
          <{displayedTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>{task.description}</Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip size="small" label={task.priority} color={priorityColors[task.priority]} data-testid={`priority-badge-${task.priority?.toLowerCase()}`} />
                    <Chip size="small" label={task.status} color={statusColors[task.status]} />
                    {task.category && <Chip size="small" label={task.category} />}
                  </Box>
                  <{task.due_date && (<Typography variant="caption" display="block" mt={1}><� Due: {task.due_date}</Typography>)}
                </CardContent>
              <CardActions>
                  <Button size="small" onClick={() => handleEdit(task)}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleDelete(task.id)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
          ))}

          {displayedTasks.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" textAlign="center" mt={4}>
                {search.trim() ? 'No tasks found' : 'No tasks found. Click "+ Add Task" to get started!'}
              </Typography>
            </Grid>
          )}
        </Grid>

        <TaskForm open={openForm} onClose={() => setOpenForm(false)} onSaved={fetchTasks} editTask={editTask} />
      </Container>
    </>
  );
}
