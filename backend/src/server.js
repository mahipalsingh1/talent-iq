import express from "express";
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

// middleware
app.use(express.json());

// ✅ CORS FIX
app.use(
  cors({
    origin: ENV.CLIENT_URL, // your Vercel URL
    credentials: true,
  })
);

// Clerk auth
app.use(clerkMiddleware());

// routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/code", codeRoutes);

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// ❌ REMOVE FRONTEND SERVING (IMPORTANT)
// DO NOT SERVE FRONTEND FROM BACKEND ON RENDER

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () =>
      console.log("Server is running on port:", ENV.PORT)
    );
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();