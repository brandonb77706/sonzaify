import React from "react";
import { tracks } from "./track";
import "./searchResults.css"; // Import the CSS file

function SearchResults() {
  return (
    <div className="search-results">
      <h1>Results</h1>
      <div>
        {tracks.map((track) => (
          <div key={track.id} className="result-item">
            <button>+</button> {/* The "X" button is positioned absolutely */}
            <h2>{track.name}</h2>
            <p>Artist: {track.artist}</p>
            <p>Album: {track.album}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchResults;
