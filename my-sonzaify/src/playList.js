import React, { useState } from "react";
import "./playlist.css";
function PlaylistInfo({ playlist, removeTracks }) {
  const [playlistName, setPlaylistName] = useState("");

  function handleChange(e) {
    setPlaylistName(e.target.value);
  }

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
    </div>
  );
}

export default PlaylistInfo;
