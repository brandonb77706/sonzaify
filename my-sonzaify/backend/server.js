import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Configure environment variables and paths
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express
const app = express();

// Constants
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PORT = process.env.PORT || 3001;

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, "https://sonzaify.onrender.com", "*"] // Allow Render domain and any origin as fallback
        : "http://localhost:3000",
    credentials: true,
  })
);

// API Routes
app.get("/api/health", (_, res) => {
  res.status(200).json({
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/spotify/token", async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    console.log("Token exchange request received", { redirectUri });

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("Missing Spotify credentials");
      return res.status(500).json({ error: "Missing Spotify credentials" });
    }

    if (!code || !redirectUri) {
      console.error("Missing required parameters", {
        code: !!code,
        redirectUri: !!redirectUri,
      });
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    console.log("Sending request to Spotify API");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Spotify API error:", data);
      return res.status(response.status).json({
        error:
          data.error_description || "Failed to exchange authorization code",
      });
    }

    console.log("Token exchange successful");
    res.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Refresh token endpoint
app.post("/api/spotify/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({ error: "Missing Spotify credentials" });
    }

    if (!refresh_token) {
      return res.status(400).json({ error: "Missing refresh token" });
    }

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Spotify API refresh error:", data);
      return res.status(response.status).json({
        error: data.error_description || "Failed to refresh token",
      });
    }

    res.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Static file serving for production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.resolve(__dirname, "..", "build");

  // Check if build directory exists
  if (fs.existsSync(buildPath)) {
    console.log(`Serving static files from: ${buildPath}`);

    // Serve static files
    app.use(express.static(buildPath));

    // Serve index.html for all non-API routes
    app.get("*", (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith("/api/")) {
        return next();
      }

      const indexPath = path.join(buildPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`Index file not found at ${indexPath}`);
        res.status(404).send("Frontend not built properly");
      }
    });
  } else {
    console.error(`Build directory not found at ${buildPath}`);
  }
}

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || "development"}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`Build path: ${path.resolve(__dirname, "..", "build")}`);
});

// Global error handling
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  // Don't exit in production to keep the service running
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
});
