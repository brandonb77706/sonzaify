import React, { useEffect, useState } from "react";
import { setAccessToken, setUserId } from "./globalManger.js";
import "./siginin.css";

// Constants for Spotify API
const CLIENT_ID = "2c44fa46772d42b3bc909846f3e146a2";
const CLIENT_SECRET = "5033ef38d95941bf9de0a0799a0c5800";
const REDIRECT_URI = `${window.location.origin}/callback`;
const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_ENDPOINT = "https://api.spotify.com/v1";

const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "user-read-email",
];

function SignIn({ onConnect }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const exchangeCodeForToken = async (code) => {
    const tokenResponse = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error_description || "Failed to exchange code");
    }

    return tokenResponse.json();
  };

  const fetchUserProfile = async (accessToken) => {
    const profileResponse = await fetch(`${SPOTIFY_API_ENDPOINT}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }

    return profileResponse.json();
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) return;

      try {
        setIsLoading(true);
        setError(null);

        // Exchange code for token
        const tokenData = await exchangeCodeForToken(code);
        setAccessToken(tokenData.access_token);

        // Fetch user profile
        const profileData = await fetchUserProfile(tokenData.access_token);
        setUserId(profileData.id);

        onConnect(true);
      } catch (error) {
        console.error("Authentication error:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [onConnect]);

  const authorizeWithSpotify = () => {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(" "),
      show_dialog: true,
    });

    window.location.href = `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`;
  };

  return (
    <div className="signin-container">
      <div className="prompt">
        <h2>Creating Spotify playlists made easy</h2>
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        <button
          className={`prompt-button ${isLoading ? "loading" : ""}`}
          onClick={authorizeWithSpotify}
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : "Connect To Spotify"}
        </button>
      </div>
    </div>
  );
}

export default SignIn;
