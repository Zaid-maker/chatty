import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Ensure cookieParser is imported
import path from 'path'; // Add path import
import fs from 'fs'; // Add fs import
import { connectDB, setupConnectionHandlers, isConnected, getConnectionStats } from './lib/db.js';
import authRoutes from './routes/auth.route.js'; // Ensure routes are imported
import messageRoutes from './routes/message.route.js'; // Ensure routes are imported
import { format } from 'date-fns'; // Ensure date-fns is imported
import healthRoutes from './routes/health.route.js';
import { metrics } from './controllers/health.controller.js';

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
    metrics.systemMetrics.requestsPerEndpoint[req.path] = (metrics.systemMetrics.requestsPerEndpoint[req.path] || 0) + 1;
    metrics.systemMetrics.responseTimeAvg[req.path] = metrics.systemMetrics.responseTimeAvg[req.path] 
      ? (metrics.systemMetrics.responseTimeAvg[req.path] + duration) / 2 
      : duration;
      
    if (res.statusCode >= 400) {
      metrics.systemMetrics.errorCount++;
      metrics.systemMetrics.lastErrors.push(log);
      if (metrics.systemMetrics.lastErrors.length > 10) metrics.systemMetrics.lastErrors.shift();
      metrics.errorLog.push(log);
    }
    metrics.requestLog.push(log);
    
    // Keep logs within reasonable size
    if (metrics.requestLog.length > 1000) metrics.requestLog.shift();
    if (metrics.errorLog.length > 500) metrics.errorLog.shift();
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
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  
  app.use(express.static(clientDistPath));
  console.log("📂 Serving static files from:", clientDistPath);

  app.get("*", (req, res) => {
    const indexPath = path.resolve(clientDistPath, 'index.html');
    console.log("📂 Serving client build at:", indexPath);
    
    // Check if file exists before sending
    if (!fs.existsSync(indexPath)) {
      console.error("❌ Client build not found at:", indexPath);
      return res.status(404).send('Client build not found');
    }
    
    res.sendFile(indexPath);
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
