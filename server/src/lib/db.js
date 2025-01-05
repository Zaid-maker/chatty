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
