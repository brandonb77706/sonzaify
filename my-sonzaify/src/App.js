import React, { useState } from "react";
import SearchBar from "./componets/searchBar.js";
import SearchResults from "./componets/searchResults.js";
import "./App.css";
import PlaylistInfo from "./componets/playlist.js";
import SignIn from "./signin.js";
import { getUserId } from "./globalManger.js";

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
        <SearchBar />
        <div className="results-and-tracklist">
          <div>
            <SearchResults addedTracks={addedTracks} />
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
