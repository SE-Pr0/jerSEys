import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => {
  return (
    <nav>
      <Link to="/" className="nav-logo">
        jer<span>SE</span>ys
      </Link>
      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Shop
          </NavLink>
        </li>
        <li><a href="/shop#shop-catalog">Catalog</a></li>
        <li><a href="/shop#shop-insights">Insights</a></li>
      </ul>
      <div className="nav-actions">
        <a href="#" className="nav-btn btn-ghost">Sign In</a>
        <a href="#" className="nav-btn btn-solid">Register</a>
        <div className="cart-icon">
          Cart
          <div className="cart-badge">0</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
