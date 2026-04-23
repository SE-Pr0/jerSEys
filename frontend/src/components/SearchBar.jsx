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
        aria-label={placeholder}
      />
      <span className="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
    </div>
  );
};

export default SearchBar;
