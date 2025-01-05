import mongoose from "mongoose";

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
    console.error("MongoDB connection failed:", error);
  }
};
