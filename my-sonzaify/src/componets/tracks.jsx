import React, { useState } from "react";
import "./tracks.css";
import check from "../images/check.png";

function Tracks({ addedTracks, searchResults }) {
  const [addedTrackIds, setAddedTrackIds] = useState(new Set());

  const handleAddTrack = (track) => {
    setAddedTrackIds((prev) => {
      const newIds = new Set(prev);
      if (newIds.has(track.id)) {
        newIds.delete(track.id);
      } else {
        newIds.add(track.id);
      }
      return newIds;
    });
    addedTracks(track);
  };
  const isTrackAdded = (trackId) => {
    return addedTrackIds.has(trackId);
  };

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
            onClick={() => handleAddTrack(track)}
            aria-label={`Add ${track.name} to playlist`}
          >
            {isTrackAdded(track.id) ? <img src={check} alt="check" /> : "+"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Tracks;
