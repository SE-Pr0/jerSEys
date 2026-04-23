import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <span className="footer-logo">jer<span>SE</span>ys</span>
          <div className="footer-tagline">
            The premier destination for authentic sports jerseys. Browse, customize, and trade with the community.
          </div>
          <div className="footer-socials">
            <a href="#" className="social-btn">X</a>
            <a href="#" className="social-btn">in</a>
            <a href="#" className="social-btn">📸</a>
            <a href="#" className="social-btn">▶</a>
          </div>
        </div>
        <div>
          <div className="footer-col-title">Shop</div>
          <ul className="footer-links">
            <li><Link to="/shop">Football Kits</Link></li>
            <li><Link to="/shop">Basketball Jerseys</Link></li>
            <li><Link to="/shop#shop-catalog">Club Teams</Link></li>
            <li><Link to="/shop#shop-catalog">National Teams</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Account</div>
          <ul className="footer-links">
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/order-history">My Orders</Link></li>
            <li><Link to="/trade/requests">Trade Offers</Link></li>
            <li><Link to="/trade">Trade Marketplace</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Support</div>
          <ul className="footer-links">
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">Size Guide</a></li>
            <li><a href="#">Authenticity</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2026 <span>jerSEys</span> · Sports Goods Department Store · All rights reserved</div>
        <div className="footer-team">SE Pro · CSC490 · LAU · Phase 4</div>
      </div>
    </footer>
  );
};

export default Footer;
