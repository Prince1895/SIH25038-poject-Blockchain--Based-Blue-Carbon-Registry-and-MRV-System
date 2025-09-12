import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";

import path from 'path'; // 💡 ADDED
import { fileURLToPath } from 'url'; // 💡 ADDED

// 💡 ADDED: These lines create a reliable path to the .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORRECTED: Explicitly set the path
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// ✅ CORRECTED: express.json() is the modern replacement for bodyParser.json()
app.use(express.json());

// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

// --- Routes ---
app.use("/api/auth", authRoutes);

// --- Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});