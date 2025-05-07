import React from "react";
import { tracks } from "./tracks.js";
import "./searchResults.css"; // Import the CSS file

function SearchResults({ addedTracks }) {
  return (
    <>
      <div className="search-root">
        <h1>Results</h1>
        <div className="search-results">
          {tracks.map((track) => (
            <div key={track.id} className="search-result-item">
              <button onClick={() => addedTracks(track)}>+</button>
              {/* The "X" button is positioned absolutely */}
              <h2>{track.name}</h2>
              <p>Artist: {track.artist}</p>
              <p>Album: {track.album}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default SearchResults;
