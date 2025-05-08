import React, { useEffect, useState } from "react";
import { setAccessToken, setUserId } from "./globalManger.js";
import "./siginin.css";

// Constants for Spotify API and client
const SPOTIFY_CONFIG = {
  clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
  redirectUri:
    process.env.NODE_ENV === "production"
      ? "https://sonzaify.onrender.com/callback"
      : `${window.location.origin}/callback`,
  authEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
  apiEndpoint: "https://api.spotify.com/v1",
  scopes: [
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-private",
    "user-read-email",
  ],
};

// Add validation
if (!SPOTIFY_CONFIG.clientId) {
  console.error("Missing REACT_APP_SPOTIFY_CLIENT_ID environment variable");
}

function SignIn({ onConnect }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const exchangeCodeForToken = async (code) => {
    try {
      const tokenResponse = await fetch(SPOTIFY_CONFIG.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: SPOTIFY_CONFIG.redirectUri,
          client_id: SPOTIFY_CONFIG.clientId,
          client_secret: SPOTIFY_CONFIG.clientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error("Token exchange failed:", errorData);
        throw new Error(
          errorData.error_description || "Failed to connect to Spotify"
        );
      }

      return tokenResponse.json();
    } catch (error) {
      console.error("Token exchange error:", error);
      throw new Error("Connection failed. Please try again.");
    }
  };

  const fetchUserProfile = async (accessToken) => {
    try {
      const profileResponse = await fetch(`${SPOTIFY_CONFIG.apiEndpoint}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        console.error("Profile fetch failed:", errorData);
        throw new Error("Failed to fetch user profile");
      }

      return profileResponse.json();
    } catch (error) {
      console.error("Profile fetch error:", error);
      throw new Error("Failed to get user information");
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const authError = urlParams.get("error");

      if (authError) {
        setError("Authorization was denied");
        return;
      }

      if (!code) return;

      try {
        setIsLoading(true);
        setError(null);

        const tokenData = await exchangeCodeForToken(code);
        setAccessToken(tokenData.access_token);

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
      client_id: SPOTIFY_CONFIG.clientId,
      response_type: "code",
      redirect_uri: SPOTIFY_CONFIG.redirectUri,
      scope: SPOTIFY_CONFIG.scopes.join(" "),
      show_dialog: true,
    });

    window.location.href = `${SPOTIFY_CONFIG.authEndpoint}?${params}`;
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
