import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../styles/navbar.css';
import { clearStoredUser, getStoredUser } from '../utils/auth';

const Navbar = () => {
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('storage', syncUser);
    window.addEventListener('jerseys-auth-change', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('jerseys-auth-change', syncUser);
    };
  }, []);

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
        {user ? (
          <>
            <span className="nav-btn btn-ghost">{user.username}</span>
            <button type="button" className="nav-btn btn-solid" onClick={clearStoredUser}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn btn-ghost">Sign In</Link>
            <Link to="/register" className="nav-btn btn-solid">Register</Link>
          </>
        )}
        <div className="cart-icon">
          Cart
          <div className="cart-badge">0</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
