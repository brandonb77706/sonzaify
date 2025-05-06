import React, { useEffect, useState } from "react";
import { setAccessToken, setUserId } from "./globalManger.js";
import "./siginin.css";

const CLIENT_ID = "2c44fa46772d42b3bc909846f3e146a2";

// const REDIRECT_URI =
//   "https://sonzaify-n6jgpammy-brandonb77706s-projects.vercel.app/callback";
//problem with lnks being different, this keeps it the same
const REDIRECT_URI = `${window.location.origin}/callback`;
const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
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

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if we're in the callback route
      if (!window.location.search) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code");
        const returnedState = queryParams.get("state");
        const storedState = localStorage.getItem("spotify_auth_state");
        const authError = queryParams.get("error");

        // Clear the stored state immediately
        localStorage.removeItem("spotify_auth_state");

        if (authError) {
          throw new Error(`Spotify Auth Error: ${authError}`);
        }

        if (!code) {
          throw new Error("No authorization code received");
        }

        // State validation
        if (!storedState || returnedState !== storedState) {
          throw new Error("State validation failed");
        }

        // Exchange code for token
        await fetchAccessTokenFromBackend(code);
      } catch (error) {
        console.error("Authentication error:", error);
        setError(error.message || "Authentication failed");
        // Clean up any stored tokens on error
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_refresh_token");
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, []);

  const fetchAccessTokenFromBackend = async (code) => {
    const response = await fetch("http://localhost:3001/spotify/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        redirectUri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to exchange code for token");
    }

    const data = await response.json();

    // Store tokens
    setAccessToken(data.access_token);
    localStorage.setItem("spotify_access_token", data.access_token);
    localStorage.setItem("spotify_refresh_token", data.refresh_token);

    await fetchUserProfile(data.access_token);
  };

  const fetchUserProfile = async (token) => {
    const response = await fetch(`${SPOTIFY_API_ENDPOINT}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    setUserId(data.id);
    onConnect();
  };

  const authorizeWithSpotify = () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate and store state
      const state = generateRandomString(16);
      localStorage.setItem("spotify_auth_state", state);

      // Build authorization URL
      const authUrl = new URL(SPOTIFY_AUTH_ENDPOINT);
      authUrl.searchParams.append("client_id", CLIENT_ID);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("scope", SCOPES.join(" "));
      authUrl.searchParams.append("show_dialog", "true");

      // Redirect to Spotify auth page
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Authorization error:", error);
      setError("Failed to connect to Spotify");
      setIsLoading(false);
    }
  };

  const generateRandomString = (length) => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      possible.charAt(Math.floor(Math.random() * possible.length))
    ).join("");
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
