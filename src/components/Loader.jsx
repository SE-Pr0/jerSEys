import React from 'react';
import '../styles/loader.css';

const Loader = () => {
  return (
    <div id="loader">
      <div className="loader-logo">
        jer<span>SE</span>ys
      </div>
      <div className="loader-bar">
        <div className="loader-progress" />
      </div>
      <div className="loader-text">Loading the drop...</div>
    </div>
  );
};

export default Loader;
