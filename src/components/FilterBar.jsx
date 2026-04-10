import React from 'react';
import '../styles/filter.css';

const defaultFilters = [
  { key: 'all', label: 'All' },
  { key: 'football', label: 'Football' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'club', label: 'Club Teams' },
  { key: 'national', label: 'National Teams' },
];

const FilterBar = ({ activeFilter, onFilterChange, filters = defaultFilters }) => {
  return (
    <div className="filter-bar">
      {filters.map((filter) => (
        <button
          key={filter.key}
          className={`filter-btn${activeFilter === filter.key ? ' active' : ''}`}
          type="button"
          onClick={() => onFilterChange(filter.key)}
          aria-pressed={activeFilter === filter.key}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
