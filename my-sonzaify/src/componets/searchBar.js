import React, { useState } from "react";
import "./searchBar.css";
import { getAccessToken } from "../globalManger.js";

// Spotify API endpoint
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const spotifySearchEndpoint = `${SPOTIFY_API_URL}/search`;

function SearchBar({ onSearch }) {
  const [userInput, setUserInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function getTracks() {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to search");
      }

      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${spotifySearchEndpoint}?q=${encodeURIComponent(
          userInput
        )}&type=track,artist&limit=15`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error("Failed to fetch tracks. Please try again.");
      }

      const data = await response.json();
      if (!data.tracks?.items?.length) {
        throw new Error("No tracks found. Try a different search.");
      }

      onSearch(data);
    } catch (error) {
      console.error("Search error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setErrorMessage("Please enter a search term");
      return;
    }
    setErrorMessage("");
    getTracks();
  };

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for songs..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="search-input"
          disabled={isLoading}
          aria-label="Search input"
        />
        <button
          type="submit"
          className={`search-button ${isLoading ? "loading" : ""}`}
          disabled={isLoading}
          aria-label="Search"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>
      {errorMessage && (
        <p className="error-message" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default SearchBar;
