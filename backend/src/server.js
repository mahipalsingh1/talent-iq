import express from "express";
import path from "path";
import cors from "cors";
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

// ================= MIDDLEWARE =================
app.use(express.json());

// ✅🔥 FINAL CORS FIX (IMPORTANT)
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        ENV.CLIENT_URL,
        "https://talent-iq-flax.vercel.app",
        "https://talent-5kis5379d-bhanwarmahipals-9385s-projects.vercel.app"
      ];

      // allow tools like Postman / no-origin requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Handle preflight requests (VERY IMPORTANT)
app.options("/*", cors());

app.use(clerkMiddleware());

// ================= ROUTES =================
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/code", codeRoutes);

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "API is running 🚀" });
});

// ================= PRODUCTION =================
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDB();

    const PORT = ENV.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("💥 Error starting server:", error);
  }
};

startServer();