import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import '../styles/navbar.css';
import { clearStoredUser, getStoredUser } from '../utils/auth';

const CART_STORAGE_KEYS = ['jerseys-cart', 'shopping-cart', 'cartItems', 'cart'];

const parseJson = (rawValue) => {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

const asArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && Array.isArray(value.items)) {
    return value.items;
  }

  if (value && Array.isArray(value.cartItems)) {
    return value.cartItems;
  }

  if (value && Array.isArray(value.lineItems)) {
    return value.lineItems;
  }

  return [];
};

const readCartItemCount = () => {
  if (typeof window === 'undefined') {
    return 0;
  }

  for (const key of CART_STORAGE_KEYS) {
    const parsed = parseJson(window.localStorage.getItem(key));
    const items = asArray(parsed);

    if (items.length > 0) {
      return items.reduce((sum, item) => {
        const quantity = Number(item?.quantity ?? item?.qty ?? item?.count ?? 1);
        return sum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
      }, 0);
    }
  }

  return 0;
};

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(() => getStoredUser());
  const [cartCount, setCartCount] = useState(() => readCartItemCount());

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    const syncCart = () => {
      setCartCount(readCartItemCount());
    };

    window.addEventListener('storage', syncUser);
    window.addEventListener('storage', syncCart);
    window.addEventListener('jerseys-auth-change', syncUser);
    window.addEventListener('jerseys-cart-change', syncCart);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('jerseys-auth-change', syncUser);
      window.removeEventListener('jerseys-cart-change', syncCart);
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
          <div className="cart-badge">{cartCount}</div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
