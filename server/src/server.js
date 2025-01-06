import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Ensure cookieParser is imported
import path from 'path'; // Add path import
import { connectDB, setupConnectionHandlers, isConnected, getConnectionStats } from './lib/db.js';
import authRoutes from './routes/auth.route.js'; // Ensure routes are imported
import messageRoutes from './routes/message.route.js'; // Ensure routes are imported
import { format } from 'date-fns'; // Ensure date-fns is imported
import healthRoutes from './routes/health.route.js';

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

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: format(new Date(), 'PPpp')
    };
    
    // Update metrics
    systemMetrics.requestsPerEndpoint[req.path] = (systemMetrics.requestsPerEndpoint[req.path] || 0) + 1;
    systemMetrics.responseTimeAvg[req.path] = systemMetrics.responseTimeAvg[req.path] 
      ? (systemMetrics.responseTimeAvg[req.path] + duration) / 2 
      : duration;
      
    if (res.statusCode >= 400) {
      systemMetrics.errorCount++;
      systemMetrics.lastErrors.push(log);
      if (systemMetrics.lastErrors.length > 10) systemMetrics.lastErrors.shift();
      errorLog.push(log);
    }
    requestLog.push(log);
    
    // Keep logs within reasonable size
    if (requestLog.length > 1000) requestLog.shift();
    if (errorLog.length > 500) errorLog.shift();
  });
  next();
});

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
app.use('/api/health', healthRoutes);

// Production configuration
if (process.env.NODE_ENV === "production") {
  console.log("🏭 Production mode detected, serving static files");
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    console.log("📂 Serving frontend build at:", path.join(__dirname, "../frontend", "dist", "index.html"));
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

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

    const PORT = process.env.PORT;
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
