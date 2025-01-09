import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

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
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-20">
      <h1 className="text-2xl font-bold mb-6">System Health Status</h1>
      <div className="bg-base-200 rounded-lg p-6 shadow-lg">
        <div className="mb-4">
          Status: <span className="font-semibold">{health?.status}</span>
        </div>
        <div className="mb-4">
          Last Updated: {new Date(health?.timestamp || '').toLocaleString()}
        </div>
        <div>
          Uptime: {Math.floor((health?.uptime || 0) / 3600)} hours {Math.floor(((health?.uptime || 0) % 3600) / 60)} minutes
        </div>
      </div>
    </div>
  );
}
