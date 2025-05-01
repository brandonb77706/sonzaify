import React, { useState, useEffect } from "react";
import "./playlist.css";

// Configuration for Spotify API
const CLIENT_ID = "2c44fa46772d42b3bc909846f3e146a2"; // Replace with your Spotify Client ID
//make sure this is the new deployment
const REDIRECT_URI =
  "https://sonzaify-hofcuzgyc-brandonb77706s-projects.vercel.app/callback";
const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_API_ENDPOINT = "https://api.spotify.com/v1";

// Required scopes for creating and modifying playlists
const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
];

let tokenToExport = null;
function PlaylistInfo({ playlist, removeTracks }) {
  const [playlistName, setPlaylistName] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

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

  //allows me to export token to other file
  useEffect(() => {
    tokenToExport = accessToken;
  }, [accessToken]);

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

  const handleChange = (e) => {
    setPlaylistName(e.target.value);
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

  // Creates a new playlist and adds the tracks
  const savePlaylistToSpotify = async () => {
    if (!accessToken) {
      authorizeWithSpotify();
      return;
    }

    if (!playlistName.trim()) {
      setStatusMessage("Please enter a playlist name");
      return;
    }

    if (playlist.length === 0) {
      setStatusMessage("Your playlist is empty");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Creating playlist...");

    try {
      // Step 1: Create a new playlist
      const createPlaylistResponse = await fetch(
        `${SPOTIFY_API_ENDPOINT}/users/${userId}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: playlistName,
            description: "Created with My Playlist App",
            public: false, // Set to true for public playlists
          }),
        }
      );

      if (!createPlaylistResponse.ok) {
        throw new Error("Failed to create playlist");
      }

      const playlistData = await createPlaylistResponse.json();
      const playlistId = playlistData.id;

      // Step 2: Add tracks to the playlist
      // Extract track URIs from your playlist array
      const trackUris = playlist.map((track) => track.uri);

      const addTracksResponse = await fetch(
        `${SPOTIFY_API_ENDPOINT}/playlists/${playlistId}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: trackUris,
          }),
        }
      );

      if (!addTracksResponse.ok) {
        throw new Error("Failed to add tracks to playlist");
      }

      setStatusMessage("Playlist successfully saved to your Spotify account!");
      setPlaylistName(""); // Reset playlist name
    } catch (error) {
      console.error("Error saving playlist:", error);
      setStatusMessage(`Error: ${error.message}`);

      // Handle token expiration
      if (error.message.includes("401")) {
        sessionStorage.removeItem("spotify_access_token");
        setAccessToken(null);
        setStatusMessage("Session expired. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="playlist-container">
      <div className="playlist-input-wrapper">
        <input
          type="text"
          value={playlistName}
          onChange={handleChange}
          placeholder="Enter Playlist Name"
          className="playlist-input"
        />
      </div>
      <div className="playlist-results">
        {playlist.map((track) => (
          <div key={track.id} className="playlist-result-item">
            <button onClick={() => removeTracks(track)}>-</button>
            <h2>{track.name}</h2>
            <p>Artist: {track.artist}</p>
            <p>Album: {track.album}</p>
          </div>
        ))}
      </div>
      <div className="playlist-actions">
        <button
          className="save-to-spotify-button"
          onClick={savePlaylistToSpotify}
          disabled={isLoading}
        >
          {accessToken ? "Save to spotify" : "Connect to spotify "}
        </button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </div>
  );
}

export const getAccessToken = () => tokenToExport;
export default PlaylistInfo;
