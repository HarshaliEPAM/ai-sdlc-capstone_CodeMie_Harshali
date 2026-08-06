import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { register } from '../services/api';

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await register(form);
            setSuccess('Registered successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold" mb={3}>📝 Task Manager</Typography>
                <Typography variant="h6" mb={2}>Register</Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField fullWidth label="Username" margin="normal"
                        value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                    <TextField fullWidth label="Email" type="email" margin="normal"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    <TextField fullWidth label="Password" type="password" margin="normal"
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                        Register
                    </Button>
                    <Typography mt={2} textAlign="center">
                        Have account? <Link to="/login">Login here</Link>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}