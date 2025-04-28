import React, { useState } from "react";

function Tracklist() {
  const [playlistName, setPlaylistName] = useState("");

  function handleChange(e) {
    setPlaylistName(e.target.value);
  }
  return (
    <div>
      <div>
        <input
          type="text"
          value={playlistName}
          onChange={handleChange}
          placeholder="Playlist Name"
        />
      </div>
      <div>
        <button type="Submit">Save To Spotify</button>
      </div>
    </div>
  );
}
export default Tracklist;
