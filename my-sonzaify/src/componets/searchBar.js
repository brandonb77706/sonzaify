import React, { useState } from "react";
import styles from "./searchBarcss";

function SearchBar() {
  const [userInput, setUserInput] = useState("");

  return (
    <div style={styles.searchBar} className="search-bar">
      <input
        type="text"
        placeholder="Search for a song..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="search-input"
      />
      <div>
        <button
          type="submit"
          style={styles.searchButton}
          className="search-button"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
