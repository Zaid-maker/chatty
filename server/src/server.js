import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Ensure cookieParser is imported
import { connectDB, setupConnectionHandlers, isConnected, getConnectionStats } from './lib/db.js';
import authRoutes from './routes/auth.route.js'; // Ensure routes are imported
import messageRoutes from './routes/message.route.js'; // Ensure routes are imported

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

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

// 🏥 Health check endpoint
app.get('/health', (req, res) => {
  const dbStats = getConnectionStats();
  res.json({
    status: '✅ Operational',
    timestamp: new Date(),
    database: {
      connected: isConnected() ? '🟢 Connected' : '🔴 Disconnected',
      host: `🖥️ ${dbStats.host}`,
      name: `📁 ${dbStats.name}`,
    },
    server: {
      uptime: `⏱️ ${process.uptime().toFixed(2)}s`,
      memory: `💾 ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
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
