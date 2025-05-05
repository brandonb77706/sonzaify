import React, { useEffect } from "react";

import { setAccessToken, setUserId } from "./globalManger.js";
import "./siginin.css";

const CLIENT_ID = "2c44fa46772d42b3bc909846f3e146a2";
const REDIRECT_URI =
  "https://sonzaify-4oj2wlly0-brandonb77706s-projects.vercel.app/callback";

const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_API_ENDPOINT = "https://api.spotify.com/v1";

// Required scopes for creating and modifying playlists
const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
];

function SignIn({ onConnect }) {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Extract the access token from URL fragment
      const params = hash.substring(1).split("&");
      const accessTokenParam = params.find((param) =>
        param.startsWith("access_token=")
      );

      if (accessTokenParam) {
        const token = accessTokenParam.split("=")[1];
        setAccessToken(token);

        // Store token in sessionStorage (optional)
        sessionStorage.setItem("spotify_access_token", token);

        // Clear the URL fragment
        window.location.hash = "";

        // Get user profile to obtain user ID
        fetchUserProfile(token);
      }
    } else {
      // Check if token exists in session storage
      const storedToken = sessionStorage.getItem("spotify_access_token");
      if (storedToken) {
        setAccessToken(storedToken);
        fetchUserProfile(storedToken);
      }
    }
  }, []);

  // Fetch user profile to get the user ID (needed for playlist creation)
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${SPOTIFY_API_ENDPOINT}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.id);
        onConnect();
      } else {
        console.error("Failed to fetch user profile");
        // Token might be expired - clear it
        sessionStorage.removeItem("spotify_access_token");
        setAccessToken(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  // Initiates the Spotify authorization flow
  const authorizeWithSpotify = () => {
    // Generate a random state value for security
    const state = generateRandomString(16);
    sessionStorage.setItem("spotify_auth_state", state);

    // Create authorization URL with required parameters
    const authUrl =
      `${SPOTIFY_AUTH_ENDPOINT}?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(SCOPES.join(" "))}` +
      `&response_type=code` +
      `&state=${state}` +
      `&show_dialog=true`;

    console.log("authURL:", authUrl);

    // Redirect to Spotify authorization page
    window.location.href = authUrl;
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");

    if (code) {
      // Send the authorization code to your backend server
      fetchAccessTokenFromBackend(code);
    }
  }, []);

  //fetched token from backend
  const fetchAccessTokenFromBackend = async (code) => {
    try {
      const response = await fetch("http://localhost:3001/spotify/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, redirectUri: REDIRECT_URI }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access_token);
        sessionStorage.setItem("spotify_access_token", data.access_token);

        // Optionally store the refresh token if needed
        sessionStorage.setItem("spotify_refresh_token", data.refresh_token);

        // Fetch the user profile
        fetchUserProfile(data.access_token);
      } else {
        console.error("Failed to fetch access token from backend");
      }
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
  };

  //if token is expired
  const refreshAccessToken = async () => {
    const refreshToken = sessionStorage.getItem("spotify_refresh_token");
    if (!refreshToken) {
      console.error("No refresh token available");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/spotify/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access_token);
        sessionStorage.setItem("spotify_access_token", data.access_token);
      } else {
        console.error("Failed to refresh access token");
      }
    } catch (error) {
      console.error("Error refreshing access token:", error);
    }
  };
  //refreses expired token
  useEffect(() => {
    const refreshToken = sessionStorage.getItem("spotify_refresh_token");
    if (refreshToken) {
      console.log("Refreshing access token on app load...");
      refreshAccessToken();
    }
  }, []);

  // Utility function to generate a random string for state parameter
  const generateRandomString = (length) => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  };

  return (
    <div className="signin-container">
      <div className="prompt">
        <h2>Creating playlist made easy</h2>
        <button className="prompt-button" onClick={authorizeWithSpotify}>
          Connect To Spotify
        </button>
      </div>
    </div>
  );
}

export default SignIn;
