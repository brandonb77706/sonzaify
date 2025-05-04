import dotenv from "dotenv";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

app.post("/spotify/token", async (req, res) => {
  const { code, redirectUri } = req.body;

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

    if (response.ok) {
      const data = await response.json();
      res.json({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      });
    } else {
      const error = await response.json();
      res.status(400).json({ error });
    }
  } catch (error) {
    console.error("Error exchanging authorization code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
