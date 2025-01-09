import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

export default function HealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Failed to fetch health status');
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        System Health Status
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="body1" gutterBottom>
          Status: <strong>{health?.status}</strong>
        </Typography>
        <Typography variant="body1" gutterBottom>
          Last Updated: {new Date(health?.timestamp || '').toLocaleString()}
        </Typography>
        <Typography variant="body1">
          Uptime: {Math.floor((health?.uptime || 0) / 3600)} hours {Math.floor(((health?.uptime || 0) % 3600) / 60)} minutes
        </Typography>
      </Paper>
    </Box>
  );
}
