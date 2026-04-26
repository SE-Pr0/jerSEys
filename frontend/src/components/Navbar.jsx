import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import '../styles/navbar.css';
import { getCombinedCart } from '../services/cartService';
import { logoutUser } from '../services/authService';
import { getStoredUser, isAdminUser } from '../utils/auth';

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(() => getStoredUser());
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    const syncCart = async () => {
      const items = await getCombinedCart().catch(() => []);
      setCartCount(items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0));
    };

    syncCart();

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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="site-nav">
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
          {isAdminUser(user) ? (
            <li>
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Admin Dashboard
              </NavLink>
            </li>
          ) : null}
        </ul>
        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/profile" className="nav-btn btn-ghost">
                {user.username}
              </Link>
              <button type="button" className="nav-btn btn-solid" onClick={logoutUser}>
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
          <button
            type="button"
            className={`nav-hamburger${mobileMenuOpen ? ' is-open' : ''}`}
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="nav-mobile-menu" role="dialog" aria-label="Navigation menu">
          <ul className="nav-mobile-links">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={closeMobileMenu}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/shop"
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={closeMobileMenu}
              >
                Shop
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/customize"
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={closeMobileMenu}
              >
                Customize
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/trade"
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={closeMobileMenu}
              >
                Trade Marketplace
              </NavLink>
            </li>
            {isAdminUser(user) ? (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                  onClick={closeMobileMenu}
                >
                  Admin Dashboard
                </NavLink>
              </li>
            ) : null}
          </ul>
          <div className="nav-mobile-auth">
            {user ? (
              <>
                <Link to="/profile" className="nav-btn btn-ghost" onClick={closeMobileMenu}>
                  {user.username}
                </Link>
                <button
                  type="button"
                  className="nav-btn btn-solid"
                  onClick={() => { logoutUser(); closeMobileMenu(); }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn btn-ghost" onClick={closeMobileMenu}>
                  Sign In
                </Link>
                <Link to="/register" className="nav-btn btn-solid" onClick={closeMobileMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
