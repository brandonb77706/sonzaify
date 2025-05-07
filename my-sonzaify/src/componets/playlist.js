import React, { useState } from "react";
import "./playlist.css";
import { getAccessToken, setAccessToken } from "../globalManger.js";

function PlaylistInfo({ getUserId, playlist = [], removeTracks }) {
  const [playlistName, setPlaylistName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const SPOTIFY_API_ENDPOINT = "https://api.spotify.com/v1";

  const handleChange = (e) => {
    setPlaylistName(e.target.value);
  };

  // Creates a new playlist and adds the tracks
  const savePlaylistToSpotify = async () => {
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
        `${SPOTIFY_API_ENDPOINT}/users/${getUserId()}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
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
            Authorization: `Bearer ${getAccessToken()}`,
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
        <div className="playlist-results">
          {playlist && playlist.length > 0 ? (
            playlist.map((track) => (
              <div key={track.id} className="track-item">
                <div className="track-content">
                  <img
                    src={track.album.images[2]?.url || "/default-album.png"}
                    alt={track.name}
                    className="track-image"
                  />
                  <div className="track-info">
                    <h3 className="track-name">{track.name}</h3>
                    <p className="track-artist">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </p>
                  </div>
                </div>
                <button
                  className="remove-track-button"
                  onClick={() => removeTracks(track)}
                  aria-label={`remove ${track.name} from playlist`}
                >
                  -
                </button>
              </div>
            ))
          ) : (
            <p className="empty-playlist-message">
              Your playlist is empty. Add some tracks!
            </p>
          )}
        </div>
      </div>
      <div className="playlist-actions">
        <button
          className="save-to-spotify-button"
          onClick={savePlaylistToSpotify}
          disabled={isLoading}
        >
          Save To Spotify
        </button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </div>
  );
}

export default PlaylistInfo;
