import React from "react";
import "./tracks.css";
import { getJsonData, useEffect } from "../globalManger.js";

function Tracks({ addedTracks }) {
  const [searchData, setSearchData] = useState(null);

  // Only update searchData when getJsonData() returns something
  useEffect(() => {
    const data = getJsonData();
    if (data) {
      setSearchData(data);
    }
  }, [getJsonData()]); // This will run when getJsonData updates

  // Show nothing until search is performed
  if (!searchData || !searchData.tracks) {
    return null;
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
