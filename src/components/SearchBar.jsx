import React from 'react';
import '../styles/search.css';

const SearchBar = ({ value, onChange, placeholder = 'Search jerseys, clubs, players...' }) => {
  return (
    <div className="search-bar">
      <input
        className="search-input"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <span className="search-icon">🔍</span>
    </div>
  );
};

export default SearchBar;
