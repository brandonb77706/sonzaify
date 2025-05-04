import React, { useEffect, useCallback } from "react";
import { setAccessToken, setUserId } from "./globalManger.js";
import "./siginin.css";

const CLIENT_ID = "2c44fa46772d42b3bc909846f3e146a2"; // Replace with your Spotify Client ID
const REDIRECT_URI =
  "https://sonzaify-e193dsthy-brandonb77706s-projects.vercel.app/callback";
const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_API_ENDPOINT = "https://api.spotify.com/v1";

// Required scopes for creating and modifying playlists
const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
];

function SignIn({ onConnect }) {
  // Fetch user profile to get the user ID
  const fetchUserProfile = useCallback(
    async (token) => {
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
    },
    [onConnect] // Dependencies for useCallback
  );

  // Handle Spotify redirect on component mount
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

        // Set the token globally
        setAccessToken(token);

        // Store token in sessionStorage
        sessionStorage.setItem("spotify_access_token", token);

        // Clear the URL fragment
        window.location.hash = "";

        // Fetch user profile
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
  }, [fetchUserProfile]); // Add fetchUserProfile as a dependency

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
      `&response_type=token` +
      `&state=${state}` +
      `&show_dialog=true`;

    // Redirect to Spotify authorization page
    window.location.href = authUrl;
  };

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
