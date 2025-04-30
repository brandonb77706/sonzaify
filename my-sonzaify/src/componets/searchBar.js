import React, { useState } from "react";
import "./searchBar.css";
import getAccessToken from "./playlist.js";

//putting spotfiy api edpoints as variables
const spotfiySearchEndpoint = "https://api.spotify.com/v1/search";

function SearchBar() {
  const [userInput, setUserInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.length === 0) {
      console.error("search input empty");
      return;
    }
    getTracks();
  };
  async function getTracks() {
    try {
      const response = await fetch(
        `${spotfiySearchEndpoint}?q=${encodeURIComponent(
          userInput
        )}&type=track,artist`,
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
      console.log("Search results are", data);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  }
  //calls both these functions on sumbit
  const handleFormSubmit = (e) => {
    handleSubmit(e);
    getTracks();
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="search-bar">
        <input
          type="text"
          placeholder="Search"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="search-input"
        />
        <div>
          <button type="submit" className="search-button">
            Search
          </button>
        </div>
      </form>
    </>
  );
}

export default SearchBar;
