import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
  })
);

// Constants
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// Validation middleware
const validateSpotifyCredentials = (req, res, next) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({
      error: "Missing Spotify credentials",
    });
  }
  next();
};

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Spotify token endpoint
app.post("/spotify/token", validateSpotifyCredentials, async (req, res) => {
  const { code, redirectUri } = req.body;

  if (!code || !redirectUri) {
    return res.status(400).json({
      error: "Missing required parameters",
    });
  }

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);

  try {
    const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
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

    res.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Serve static files from React app
  app.use(express.static(path.join(__dirname, "../build")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Error handling
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});
