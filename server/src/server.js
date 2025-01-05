import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {
  connectDB,
  setupConnectionHandlers,
  isConnected,
  getConnectionStats
} from './lib/db.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Database connection status middleware
app.use((req, res, next) => {
  if (!isConnected()) {
    return res.status(503).json({ error: 'Database connection unavailable' });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStats = getConnectionStats();
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: {
      connected: isConnected(),
      host: dbStats.host,
      name: dbStats.name
    }
  });
});

// Initialize database
const init = async () => {
  try {
    await connectDB();
    setupConnectionHandlers();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
};

init();
