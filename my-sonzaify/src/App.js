import React from "react";
import SearchBar from "./searchBar";
import SearchResults from "./searchResults";
import Tracklist from "./trackList";
import "./App.css"; // Import the CSS file for the background

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Sonzaify</h1>
      </header>
      <main className="app-main">
        <SearchBar />
        <div className="results-and-tracklist">
          <div className="search-results">
            <SearchResults />
          </div>
          <div className="tracklist">
            <Tracklist />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
