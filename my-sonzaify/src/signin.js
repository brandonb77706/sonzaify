import React, { useEffect, useState } from "react";
import { setAccessToken, setUserId } from "./globalManger.js";
import "./siginin.css";

//client id from top of src
const CLIENT_ID = "2c44fa46772d42b3bc909846f3e146a2";
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
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) return;

      try {
        setIsLoading(true);
        // Exchange code for access token
        const tokenResponse = await fetch(
          "https://accounts.spotify.com/api/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${btoa(
                `${CLIENT_ID}:${process.env.REACT_APP_SPOTIFY_CLIENT_SECRET}`
              )}`,
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code,
              redirect_uri: REDIRECT_URI,
            }),
          }
        );

        if (!tokenResponse.ok) {
          throw new Error("Failed to exchange authorization code");
        }

        const tokenData = await tokenResponse.json();
        setAccessToken(tokenData.access_token);

        // Fetch user profile with new token
        const profileResponse = await fetch(`${SPOTIFY_API_ENDPOINT}/me`, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await profileResponse.json();
        setUserId(profileData.id);
        onConnect(true);
      } catch (error) {
        console.error("Authentication error:", error);
        setError(error.message || "Authentication failed");
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
