import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import '../styles/navbar.css';
import { clearStoredUser, getStoredUser } from '../utils/auth';

const Navbar = () => {
  const location = useLocation();
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
        <li>
          <NavLink to="/customize" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Customize
          </NavLink>
        </li>
        <li>
          <NavLink to="/trade" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Trade Marketplace
          </NavLink>
        </li>
        <li>
          <Link to="/shop#shop-insights">Insights</Link>
        </li>
      </ul>
      <div className="nav-actions">
        {user ? (
          <>
            <Link to="/profile" className="nav-btn btn-ghost">
              {user.username}
            </Link>
            <button type="button" className="nav-btn btn-solid" onClick={clearStoredUser}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn btn-ghost">
              Sign In
            </Link>
            <Link to="/register" className="nav-btn btn-solid">
              Register
            </Link>
          </>
        )}
        <Link
          to="/cart"
          state={{ backgroundLocation: location }}
          className="cart-icon"
          aria-label="Shopping cart"
        >
          <span aria-hidden="true">🛒</span>
          <div className="cart-badge">0</div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
