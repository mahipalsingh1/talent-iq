import express from "express";
import cors from "cors";
import path from "path";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import codeRoutes from "./routes/codeRoutes.js";

const app = express();
const __dirname = path.resolve();

// ================== MIDDLEWARE ==================
app.use(express.json());

// ✅ PROPER CORS FIX (VERY IMPORTANT)
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://talent-iq-flax.vercel.app", // 🔥 your deployed frontend
      ];

      // allow requests with no origin (like Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

app.use(clerkMiddleware());

// ================== ROUTES ==================
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/code", codeRoutes);

// ================== HEALTH ==================
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "API is running 🚀" });
});

// ================== ROOT FIX ==================
// ❗ prevents 404 confusion on "/"
app.get("/", (req, res) => {
  res.send("Backend is running 🚀 Use /api routes");
});

// ================== PRODUCTION STATIC ==================
// ⚠️ OPTIONAL (only if hosting frontend from backend)
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// ================== START SERVER ==================
const startServer = async () => {
  try {
    await connectDB();

    const PORT = ENV.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("💥 Error starting server:", error);
  }
};

startServer();