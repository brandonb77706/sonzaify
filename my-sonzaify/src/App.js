import React, { useState } from "react";
import SearchBar from "./searchBar";
import SearchResults from "./searchResults";
import "./App.css"; // Import the CSS file for the background
import PlaylistInfo from "./playlist";

function App() {
  const [playlist, setPlaylist] = useState([]);
  function addedTracks(track) {
    if (!playlist.some((t) => track.id === t.id)) {
      setPlaylist((prevTrack) => [track, ...prevTrack]);
    }
  }

  function removeTracks(track) {
    setPlaylist(playlist.filter((t) => track.id !== t.id));
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Sonzaify</h1>
      </header>
      <main className="app-main">
        <SearchBar />
        <div className="results-and-tracklist">
          <div>
            <SearchResults addedTracks={addedTracks} />
          </div>
          <div className="playlist">
            <PlaylistInfo playlist={playlist} removeTracks={removeTracks} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
