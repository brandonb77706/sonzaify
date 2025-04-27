import React, { useState } from "react";

function SearchBar() {
  const [userInput, setUserInput] = useState("");

  return (
    <div >
      <input
        type="text"
        placeholder="Search for a song..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
       
      />
      <div >
        <button type="submit">
          Search
        </button>
        <button>
          Save To Spotify
        </button>
      </div>
    </div>
  );
}

export default SearchBar;