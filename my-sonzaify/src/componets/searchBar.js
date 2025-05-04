import React, { useState } from "react";
import "./searchBar.css";
import { getAccessToken } from "../globalManger.js";

//putting spotfiy api edpoints as variables
const spotfiySearchEndpoint = "https://api.spotify.com/v1/search";
console.log(getAccessToken);

function SearchBar() {
  const [userInput, setUserInput] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function getTracks() {
    try {
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
      console.log("Search results are", data);
      setJsonData(data);
    } catch (error) {
      console.error("Error fetching search:", error);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.length === 0) {
      setErrorMessage("Search innput empty");
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
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </>
  );
}

export default SearchBar;
