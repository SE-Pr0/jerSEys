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
            <li><a href="#">Football Kits</a></li>
            <li><a href="#">Basketball Jerseys</a></li>
            <li><a href="#">Club Teams</a></li>
            <li><a href="#">National Teams</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Account</div>
          <ul className="footer-links">
            <li><Link to="/register">Register</Link></li>
            <li><a href="#">Sign In</a></li>
            <li><a href="#">My Orders</a></li>
            <li><a href="#">Trade Offers</a></li>
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
