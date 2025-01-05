import mongoose from 'mongoose';

/**
 * Connects to the MongoDB database using the connection string
 * specified in the environment variables.
 * Logs a success message with the connection host on successful
 * connection, or logs an error message on failure.
 * @returns {Promise<void>} A promise that resolves when the
 * connection is established.
 */

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
};

/**
 * Disconnects from the MongoDB database if connected.
 * Logs a success message on successful disconnection,
 * or logs an error message on failure.
 * @returns {Promise<void>} A promise that resolves when the
 * connection is closed.
 */
export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ MongoDB disconnected successfully');
    }
  } catch (error) {
    console.error('MongoDB disconnection failed:', error);
    throw error;
  }
};

/**
 * Checks if the database connection is active
 * @returns {boolean} True if connected, false otherwise
 */
export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Gets current database connection statistics
 * @returns {Object} Connection statistics
 */
export const getConnectionStats = () => {
  return {
    status: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    collections: mongoose.connection.collections,
    models: mongoose.connection.models
  };
};

/**
 * Attempts to reconnect if the connection is lost
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<void>}
 */
export const reconnect = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (!isConnected()) {
        await connectDB();
        return;
      }
    } catch (error) {
      console.error(`Reconnection attempt ${i + 1} failed:`, error);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between retries
    }
  }
  throw new Error(`Failed to reconnect after ${retries} attempts`);
};

/**
 * Sets up database connection event listeners
 */
export const setupConnectionHandlers = () => {
  mongoose.connection.on('disconnected', () => {
    console.log('❌ MongoDB disconnected!');
    reconnect();
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  // Handle application shutdown
  process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
  });
};

/**
 * Drops all collections in the database (TEST ENVIRONMENT ONLY)
 * @returns {Promise<void>}
 */
export const clearDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clear database in production');
  }
  
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};
