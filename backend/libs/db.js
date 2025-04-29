import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
// Connect to MongoDB using Mongoose
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully", conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}