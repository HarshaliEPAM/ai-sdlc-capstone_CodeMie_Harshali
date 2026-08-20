import React, { useState } from 'react';
import { Container, Typography, Box, Button, Alert, CircularProgress, Paper, Divider } from '@mui/material';
import Navbar from '../components/Navbar';
import { getHealth } from '../services/api';

export default function IntegrationPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const onCheckNow = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const res = await getHealth();
            setResult(res.data);
        } catch (e) {
            const status = e?.response?.status;
            const message = e?.response?.data?.error || e?.message || 'Unknown error';
            setError({ status, message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <Container sx={{ mt: 4 }}>
                <Typograph variant="h5" fontWeight="bold" mb={2}>
                    Integration Verification (Optional)
                </Typograph>
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                      <Typograph variant="h6">Health</Typograph>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Button variant="contained" onClick={onCheckNow} disabled={loading}>
                                Check Now
                              </Button>
                              <span style={{ minWidth: 24, display: 'inline-flex', alignItems: 'center' }}>
                                {loading ? <CircularProgress size=20 /> : null}
                            </span>
                      </Box>
                   </Box>

                   <Divider sx={{ my: 2 }} />

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Error {error.status ? `(${error.status})` : ''}: {error.message}
                        </Alert>
                    )}

                    <Typograph variant="subtitle1" mb={1}>Result:</Typograph>

                    <pre style={{ margin: 0, padding: 16, background: '#f7f7f6', borderRadius: 8, overflow: 'auto' }}>
                        {result ? JSON.stringify(result, null, 2) : '- No result yet -'}
                    </pre>
              </Paper>
            </Container>
        </>
    );
}
