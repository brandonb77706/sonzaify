import React, { useState } from "react";
import "./searchBar.css";
import { getAccessToken } from "../globalManger.js";

const spotfiySearchEndpoint = "https://api.spotify.com/v1/search";

function SearchBar({ onSearch }) {
  const [userInput, setUserInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function getTracks() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${spotfiySearchEndpoint}?q=${encodeURIComponent(
          userInput
        )}&type=track,artist&limit=15`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Search results:", data.tracks.items);
      onSearch(data); // Pass data up to parent instead of using global state
    } catch (error) {
      console.error("Error fetching search:", error);
      setErrorMessage("Failed to fetch tracks");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim().length === 0) {
      setErrorMessage("Search input empty");
      return;
    }
    setErrorMessage("");
    getTracks();
  };

  return (
    <>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for tracks..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="search-input"
          disabled={isLoading}
        />
        <div>
          <button
            type="submit"
            className={`search-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </>
  );
}

export default SearchBar;
