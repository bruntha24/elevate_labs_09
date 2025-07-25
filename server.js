// Load .env file
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";



// Convert __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import resumeRoutes from "./routes/resumeRoutes.js";
import contactRoutes from "./routes/contact.js";
import userRoutes from "./routes/userRoutes.js";

// App setup
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Debug .env values
console.log("📦 Loaded ENV:");
console.log("MONGO_URI =", MONGO_URI);
console.log("PORT =", PORT);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/resumes", resumeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRoutes);


// Serve frontend React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

// MongoDB connection with retry logic
async function connectToMongoDB() {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is undefined");

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Fail fast
    });

    console.log("✅ MongoDB connected successfully 🚀");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("🔁 Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectToMongoDB, 5000);
  }
}
connectToMongoDB();

// Start server
function startServer(port) {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  }).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("❌ Server failed to start:", err);
    }
  });
}
startServer(PORT);
