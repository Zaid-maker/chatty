import { useState, useEffect } from "react";
import {
  Loader,
  Server,
  Clock,
  Activity,
  HardDrive, // Changed from Memory
  Cpu,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function HealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const baseUrl =
          process.env.NODE_ENV === "development" ? "http://localhost:5001" : "";

        const response = await fetch(`${baseUrl}/api/health`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch health status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }

        const data = await response.json();
        setHealth(data);
        toast.success(`Server is ${data.status}`, {
          duration: 2000,
          icon: "🟢",
        });
      } catch (err) {
        console.error("Health check error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        toast.error(errorMessage, {
          duration: 4000,
          icon: "🔴",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  const renderMetricValue = (value, placeholder = "N/A", formatter = null) => {
    if (value === undefined || value === null) {
      return <span className="text-base-content/50 italic">{placeholder}</span>;
    }
    return (
      <span className="font-semibold">
        {formatter ? formatter(value) : value}
      </span>
    );
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 GB";
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  if (loading) {
    return (
      <div className="mt-20 flex justify-center items-center min-h-[200px]">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="mt-20 p-4 text-red-500">{error}</div>;
  }

  return (
    <main className="mt-20">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Server className="w-6 h-6" />
          System Health Status
        </h1>

        {!health && !loading && !error ? (
          <div className="bg-warning/10 border border-warning rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <p className="text-warning">Some system metrics are unavailable</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Card */}
          <div className="bg-base-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Activity className="w-5 h-5" />
              System Status
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Status</span>
                {renderMetricValue(health?.status, "Unknown", (status) => (
                  <span
                    className={`${status === "healthy" ? "text-success" : "text-error"}`}
                  >
                    {status}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Environment</span>
                {renderMetricValue(health?.environment, "Unknown")}
              </div>
            </div>
          </div>

          {/* Uptime Card */}
          <div className="bg-base-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Clock className="w-5 h-5" />
              Time Metrics
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Uptime</span>
                {renderMetricValue(health?.uptime, "No data", formatUptime)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Last Updated</span>
                {renderMetricValue(health?.timestamp, "Never", (time) =>
                  new Date(time).toLocaleString(),
                )}
              </div>
            </div>
          </div>

          {/* System Resources Card */}
          <div className="bg-base-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <HardDrive className="w-5 h-5" />{" "}
              {/* Changed from Memory to HardDrive */}
              Memory Usage
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Total Memory</span>
                {renderMetricValue(
                  health?.memory?.total,
                  "No data",
                  formatBytes,
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Free Memory</span>
                {renderMetricValue(
                  health?.memory?.free,
                  "No data",
                  formatBytes,
                )}
              </div>
              {health?.memory?.total && health?.memory?.free ? (
                <div className="w-full bg-base-300 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{
                      width: `${(1 - health.memory.free / health.memory.total) * 100}%`,
                    }}
                  ></div>
                </div>
              ) : (
                <div className="text-center text-sm text-base-content/50 italic">
                  Memory usage data unavailable
                </div>
              )}
            </div>
          </div>

          {/* CPU Info Card */}
          <div className="bg-base-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Cpu className="w-5 h-5" />
              CPU Information
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">CPU Load</span>
                {renderMetricValue(
                  health?.cpu?.loadAvg?.[0],
                  "No data",
                  (load) => `${load.toFixed(2)}%`,
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">CPU Cores</span>
                {renderMetricValue(health?.cpu?.cores, "Unknown")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
