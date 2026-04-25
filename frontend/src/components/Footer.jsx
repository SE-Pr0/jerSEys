import React from 'react';
import { Link } from 'react-router-dom';
import sizeGuideImage from '../../assets/images/SizeGuide.png';
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
        </div>
        <div>
          <div className="footer-col-title">Shop</div>
          <ul className="footer-links">
            <li><Link to="/shop?sport=football#shop-catalog">Football Kits</Link></li>
            <li><Link to="/shop?sport=basketball#shop-catalog">Basketball Jerseys</Link></li>
            <li><Link to="/shop?category=club#shop-catalog">Club Teams</Link></li>
            <li><Link to="/shop?category=national#shop-catalog">National Teams</Link></li>
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
            <li>
              <a href={sizeGuideImage} download="SizeGuide.png">
                Size Guide
              </a>
            </li>
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

