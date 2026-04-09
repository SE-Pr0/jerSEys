import React from 'react';
import '../styles/navbar.css';

const Navbar = () => {
  return (
    <nav>
      <a href="#" className="nav-logo">
        jer<span>SE</span>ys
      </a>
      <ul className="nav-links">
        <li><a href="#jerseys">Shop</a></li>
        <li><a href="#customize">Customize</a></li>
        <li><a href="#trade">Trade</a></li>
        <li><a href="#">About</a></li>
      </ul>
      <div className="nav-actions">
        <a href="#" className="nav-btn btn-ghost">Sign In</a>
        <a href="#" className="nav-btn btn-solid">Register</a>
        <div className="cart-icon">
          🛒
          <div className="cart-badge">0</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
