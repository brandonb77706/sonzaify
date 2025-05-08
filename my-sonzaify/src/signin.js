import React, { useEffect } from "react";
import { API_URL } from "./config";

function SignIn({ onConnect }) {
  const REDIRECT_URI =
    process.env.NODE_ENV === "production"
      ? "https://sonzaify.onrender.com/callback"
      : "http://localhost:3000/callback";

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        try {
          await fetchAccessTokenFromBackend(code);
          onConnect(true);
        } catch (error) {
          console.error("Authentication failed:", error);
          onConnect(false);
        }
      }
    };

    handleAuthCallback();
  }, [onConnect]);

  const fetchAccessTokenFromBackend = async (code) => {
    try {
      const response = await fetch(`${API_URL}/spotify/token`, {
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
      return data.access_token;
    } catch (error) {
      console.error("Token exchange failed:", error);
      throw error;
    }
  };

  const handleSignIn = () => {
    const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const scope = "playlist-modify-public playlist-modify-private";
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    const params = {
      response_type: "code",
      client_id: CLIENT_ID,
      scope,
      redirect_uri: REDIRECT_URI,
      show_dialog: true,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  };

  return (
    <div className="signin-container">
      <h2>Welcome to Sonzaify</h2>
      <button
        className="signin-button"
        onClick={handleSignIn}
        aria-label="Sign in with Spotify"
      >
        Connect to Spotify
      </button>
    </div>
  );
}

export default SignIn;
