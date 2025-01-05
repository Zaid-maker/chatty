import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Ensure cookieParser is imported
import path from 'path'; // Add path import
import { connectDB, setupConnectionHandlers, isConnected, getConnectionStats } from './lib/db.js';
import authRoutes from './routes/auth.route.js'; // Ensure routes are imported
import messageRoutes from './routes/message.route.js'; // Ensure routes are imported
import { format } from 'date-fns'; // Ensure date-fns is imported

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 🔌 Database connection status middleware
app.use((req, res, next) => {
  if (!isConnected()) {
    return res.status(503).json({
      status: '❌ Error',
      error: 'Database connection unavailable',
    });
  }
  next();
});

// 🛣️ Routes
console.log('📝 Loading routes...');
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Production configuration
if (process.env.NODE_ENV === "production") {
  console.log("🏭 Production mode detected, serving static files");
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    console.log("📂 Serving frontend build at:", path.join(__dirname, "../frontend", "dist", "index.html"));
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// 🏥 Health check endpoint
app.get('/health', (req, res) => {
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
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: '❌ Error',
    error: 'Internal Server Error',
  });
});

// 🚀 Initialize database
const init = async () => {
  try {
    console.log('🔄 Initializing server...');
    await connectDB();
    setupConnectionHandlers();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`
═══════════════════════════════════════════
🚀 Server running on port ${PORT}
📊 Environment: ${process.env.NODE_ENV}
🔗 http://localhost:${PORT}
═══════════════════════════════════════════`);
    });
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
};

init();
