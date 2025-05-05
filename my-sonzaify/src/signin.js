import React, { useEffect, useState } from "react";
import { setAccessToken, setUserId } from "./globalManger.js";
import "./siginin.css";

const CLIENT_ID = "2c44fa46772d42b3bc909846f3e146a2";
const REDIRECT_URI =
  "https://sonzaify-mb7uk90e6-brandonb77706s-projects.vercel.app/callback";
const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_API_ENDPOINT = "https://api.spotify.com/v1";

const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "user-read-email", // Added email scope for better profile info
];

function SignIn({ onConnect }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get("code");
      const returnedState = queryParams.get("state");
      const storedState = sessionStorage.getItem("spotify_auth_state");
      const error = queryParams.get("error");

      // Clear any previous errors
      setError(null);

      if (error) {
        console.error("Spotify Auth Error:", error);
        setError(`Authentication failed: ${error}`);
        return;
      }

      if (code) {
        console.log("Received authorization code");
        setIsLoading(true);

        if (returnedState !== storedState) {
          console.error("State mismatch. Possible CSRF attack.");
          setError("Security validation failed");
          setIsLoading(false);
          return;
        }

        // Clear the stored state
        sessionStorage.removeItem("spotify_auth_state");

        try {
          await fetchAccessTokenFromBackend(code);
        } catch (error) {
          setError("Failed to complete authentication");
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleAuthCallback();
  }, []);

  const fetchAccessTokenFromBackend = async (code) => {
    try {
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
      console.log("Token exchange successful");

      setAccessToken(data.access_token);
      sessionStorage.setItem("spotify_access_token", data.access_token);
      sessionStorage.setItem("spotify_refresh_token", data.refresh_token);

      await fetchUserProfile(data.access_token);
    } catch (error) {
      console.error("Token exchange error:", error);
      throw error;
    }
  };

  const fetchUserProfile = async (token) => {
    try {
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
    } catch (error) {
      console.error("Profile fetch error:", error);
      sessionStorage.removeItem("spotify_access_token");
      setAccessToken(null);
      throw error;
    }
  };

  const authorizeWithSpotify = () => {
    setIsLoading(true);
    setError(null);

    try {
      const state = generateRandomString(16);
      sessionStorage.setItem("spotify_auth_state", state);

      const authUrl = new URL(SPOTIFY_AUTH_ENDPOINT);
      authUrl.searchParams.append("client_id", CLIENT_ID);
      authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.append("scope", SCOPES.join(" "));
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("show_dialog", "true");

      console.log("Initiating Spotify authorization...");
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
        {error && <div className="error-message">{error}</div>}
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
