import React, { useState } from "react";
import SearchBar from "./componets/searchBar.js";
import "./App.css";
import PlaylistInfo from "./componets/playlist.js";
import SignIn from "./signin.js";
import Tracks from "./componets/tracks.js";
import { getUserId } from "./globalManger.js";
const [searchResults, setSearchResults] = useState(null); // Add this state

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  //function to add tracks
  function addedTracks(track) {
    if (!playlist.some((t) => track.id === t.id)) {
      setPlaylist((prevTrack) => [track, ...prevTrack]);
    }
  }
  //function to remove tracks
  function removeTracks(track) {
    setPlaylist(playlist.filter((t) => track.id !== t.id));
  }

  // Add this function to handle search results
  const handleSearch = (results) => {
    setSearchResults(results);
  };

  //handles connections to spotfiy
  const handleConnectToSpotify = () => {
    setIsConnected(true);
  };

  //consdition if not connected
  if (!isConnected) {
    return (
      <div className="app-container">
        <main className="app-main">
          <h1 className="title">Sonzaify </h1>
          <SignIn onConnect={handleConnectToSpotify} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="search-title">Sonzaify</h1>
      </header>
      <main className="app-main">
        <SearchBar onSearch={handleSearch} />
        <div className="results-and-tracklist">
          <div className="search-tracks">
            <Tracks addedTracks={addedTracks} searchResults={searchResults} />
          </div>
          <div className="playlist">
            <PlaylistInfo
              getUserId={getUserId}
              playlist={playlist}
              removeTracks={removeTracks}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
