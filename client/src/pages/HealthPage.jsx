import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

export default function HealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const baseUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5001' 
          : '';
        
        const response = await fetch(`${baseUrl}/api/health`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch health status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        console.error('Health check error:', err);
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
      <div className="mt-20 flex justify-center items-center min-h-[200px]">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <main className="mt-20">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">System Health Status</h1>
        <div className="bg-base-200 rounded-lg p-6 shadow-lg">
          <div className="mb-4">
            Status: <span className="font-semibold text-primary">{health?.status}</span>
          </div>
          <div className="mb-4">
            Last Updated: {new Date(health?.timestamp || '').toLocaleString()}
          </div>
          <div>
            Uptime: {Math.floor((health?.uptime || 0) / 3600)} hours {Math.floor(((health?.uptime || 0) % 3600) / 60)} minutes
          </div>
        </div>
      </div>
    </main>
  );
}
