import { format } from 'date-fns';
import { getConnectionStats, isConnected } from '../lib/db.js';

export const getHealthStatus = (req, res) => {
  const dbStats = getConnectionStats();
  const memory = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.json({
    status: '✅ Operational',
    timestamp: format(new Date(), 'PPpp'),
    database: {
      connected: isConnected() ? '🟢 Connected' : '🔴 Disconnected',
      host: `🖥️ ${dbStats.host}`,
      name: `📁 ${dbStats.name}`,
    },
    server: {
      uptime: `⏱️ ${process.uptime().toFixed(2)}s`,
      platform: `💻 ${process.platform}`,
      nodeVersion: `⚡ ${process.version}`,
      memory: {
        heapUsed: `💾 ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `💽 ${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        rss: `📊 ${(memory.rss / 1024 / 1024).toFixed(2)}MB`,
      },
      process: {
        pid: `🔍 ${process.pid}`,
        env: `🌍 ${process.env.NODE_ENV || 'development'}`,
        cpuUsage: {
          user: `👤 ${(cpuUsage.user / 1000).toFixed(2)}ms`,
          system: `⚙️ ${(cpuUsage.system / 1000).toFixed(2)}ms`,
          total: `📊 ${((cpuUsage.user + cpuUsage.system) / 1000).toFixed(2)}ms`,
        }
      }
    },
  });
};
