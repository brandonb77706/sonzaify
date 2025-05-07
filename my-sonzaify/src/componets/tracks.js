import React from "react";
import "./tracks.css";

function Tracks({ addedTracks, searchResults }) {
  return (
    <div className="tracks-container">
      {!searchResults && <div>Search for tracks to display</div>}

      {searchResults?.tracks?.items?.map((track) => (
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
            className="add-track-button"
            onClick={() => addedTracks(track)}
            aria-label={`Add ${track.name} to playlist`}
          >
            +
          </button>
        </div>
      ))}
    </div>
  );
}

export default Tracks;
