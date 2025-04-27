import React from 'react';
import SearchBar from './searchBar';
import './index.css';

function App() {
  return (
    <div >
      <header >
        <h1>Sonzaify</h1>
      </header>
      <main >
        <h2>Search for a song</h2>
        <SearchBar />
      </main>
    </div>
  );
}

export default App;