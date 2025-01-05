import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database.
 *
 * @async
 * @function
 * @param {Object} params - An object containing parameters for the connection.
 * @returns {Promise<void>}
 */
export const connectDB = async (params) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};
