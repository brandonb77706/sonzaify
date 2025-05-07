import React, { useEffect, useState } from "react";
import "./tracks.css";
//import { getJsonData } from "../globalManger.js";
import { useSearchData } from "../hooks/searchhook.js";

function Tracks({ addedTracks }) {
  const { searchData, isLoading, error } = useSearchData();

  if (isLoading) {
    return <div className="tracks-container">Loading tracks...</div>;
  }

  if (error) {
    return <div className="tracks-container">Error: {error}</div>;
  }

  if (!searchData || !searchData.tracks || !searchData.tracks.items) {
    return <div className="tracks-container">Search for tracks to display</div>;
  }
  return (
    <div className="tracks-container">
      {searchData.tracks.items.map((track) => (
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
