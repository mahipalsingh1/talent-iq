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

// middleware
app.use(express.json());

// ✅ FIXED CORS (supports both local + deployed)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      ENV.CLIENT_URL, // production frontend
    ],
    credentials: true,
  })
);

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

// production frontend serve (optional)
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = ENV.PORT || 3000; // ✅ FIXED

    app.listen(PORT, () =>
      console.log("Server is running on port:", PORT)
    );
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();