import { format } from 'date-fns';
import { getConnectionStats, isConnected } from '../lib/db.js';
import os from 'os';
import { networkInterfaces } from 'os';

// Export metrics storage
export const metrics = {
  requestCount: 0,
  startTime: Date.now(),
  requestLog: [],
  errorLog: [],
  systemMetrics: {
    requestsPerEndpoint: {},
    responseTimeAvg: {},
    errorCount: 0,
    lastErrors: [],
  },
};

export const getHealthStatus = (req, res) => {
  metrics.requestCount++;
  const dbStats = getConnectionStats();
  const memory = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();

  // Calculate requests per second
  const rps = (metrics.requestCount / ((Date.now() - metrics.startTime) / 1000)).toFixed(2);

  const healthData = {
    status: '✅ Operational',
    timestamp: format(new Date(), 'PPpp'),
    database: {
      connected: isConnected() ? '🟢 Connected' : '🔴 Disconnected',
      host: `🖥️ ${dbStats.host}`,
      name: `📁 ${dbStats.name}`,
    },
    server: {
      uptime: `⏱️ ${uptime.toFixed(2)}s`,
      platform: `💻 ${process.platform}`,
      nodeVersion: `⚡ ${process.version}`,
      memory: {
        heapUsed: `💾 ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `💽 ${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        rss: `📊 ${(memory.rss / 1024 / 1024).toFixed(2)}MB`,
        memoryUsagePercent: `📈 ${(((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2)}%`,
      },
      process: {
        pid: `🔍 ${process.pid}`,
        env: `🌍 ${process.env.NODE_ENV || 'development'}`,
        cpuUsage: {
          user: `👤 ${(cpuUsage.user / 1000).toFixed(2)}ms`,
          system: `⚙️ ${(cpuUsage.system / 1000).toFixed(2)}ms`,
          total: `📊 ${((cpuUsage.user + cpuUsage.system) / 1000).toFixed(2)}ms`,
        },
      },
      os: {
        platform: `🖥️ ${os.platform()}`,
        type: `📱 ${os.type()}`,
        release: `📦 ${os.release()}`,
        arch: `🏗️ ${os.arch()}`,
        cpus: `⚡ ${os.cpus().length} cores`,
        loadAvg: `⚖️ ${os.loadavg().map((load) => load.toFixed(2))}`,
        totalMem: `💾 ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB`,
        freeMem: `🆓 ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)}GB`,
      },
      performance: {
        requestCount: `📊 ${metrics.requestCount}`,
        requestsPerSecond: `⚡ ${rps} req/s`,
        uptime: `⏱️ ${format(new Date(metrics.startTime), 'PPpp')}`,
      },
      limits: {
        maxFileDescriptors: `📁 ${process.getMaxListeners()}`,
        activeHandles: `🔄 ${process._getActiveHandles().length}`,
        activeRequests: `📨 ${process._getActiveRequests().length}`,
      },
    },
  };

  // Only include network info in development environment
  if (process.env.NODE_ENV !== 'production') {
    healthData.server.network = {
      interfaces: Object.entries(networkInterfaces()).reduce((acc, [name, info]) => {
        acc[name] = info?.map((addr) => ({
          address: `🌐 ${addr.address}`,
          netmask: `🎭 ${addr.netmask}`,
          family: `👨‍👩‍👧‍👦 ${addr.family}`,
          mac: addr.mac ? `📱 ${addr.mac}` : undefined,
        }));
        return acc;
      }, {}),
    };
  }

  res.json(healthData);
};

export const getSystemLogs = (req, res) => {
  const logs = {
    requests: metrics.requestLog.slice(-100), // Last 100 requests
    errors: metrics.errorLog.slice(-50), // Last 50 errors
    timestamp: format(new Date(), 'PPpp'),
  };
  res.json(logs);
};

export const getSystemMetrics = (req, res) => {
  const metricsData = {
    ...metrics.systemMetrics,
    timestamp: format(new Date(), 'PPpp'),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
  };
  res.json(metricsData);
};

export const getProcessInfo = (req, res) => {
  const processInfo = {
    env: process.env,
    argv: process.argv,
    execPath: process.execPath,
    execArgv: process.execArgv,
    version: process.version,
    versions: process.versions,
    config: process.config,
    pid: process.pid,
    ppid: process.ppid,
    platform: process.platform,
    arch: process.arch,
    features: process.features,
    moduleLoadList: process.moduleLoadList,
    timestamp: format(new Date(), 'PPpp'),
  };
  // Remove sensitive information
  delete processInfo.env.DATABASE_URL;
  delete processInfo.env.JWT_SECRET;

  res.json(processInfo);
};

export const clearSystemMetrics = (req, res) => {
  metrics.systemMetrics = {
    requestsPerEndpoint: {},
    responseTimeAvg: {},
    errorCount: 0,
    lastErrors: [],
  };
  metrics.requestCount = 0;
  metrics.startTime = Date.now();
  metrics.requestLog = [];
  metrics.errorLog = [];

  res.json({ message: '📊 Metrics cleared', timestamp: format(new Date(), 'PPpp') });
};
