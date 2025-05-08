import React, { useState } from "react";
import "./searchBar.css";
import { getAccessToken } from "../globalManger.js";

// Use environment variable or fallback for the API endpoint
const SPOTIFY_API_URL =
  process.env.REACT_APP_SPOTIFY_API_URL || "https://api.spotify.com/v1";
const spotfiySearchEndpoint = `${SPOTIFY_API_URL}/search`;

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
      setErrorMessage(""); // Clear any previous errors

      const response = await fetch(
        `${spotfiySearchEndpoint}?q=${encodeURIComponent(
          userInput
        )}&type=track,artist&limit=15`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Origin: window.location.origin, // Add origin header
          },
          credentials: "include", // Include credentials in the request
        }
      );

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          // Token might be expired
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.tracks?.items) {
        throw new Error("No tracks found");
      }

      onSearch(data);
    } catch (error) {
      console.error("Error fetching search:", error);
      setErrorMessage(error.message || "Failed to fetch tracks");
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
