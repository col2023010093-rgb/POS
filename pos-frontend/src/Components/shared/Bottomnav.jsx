import React from "react";
import "./Bottomnav.css";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFire,
} from "react-icons/fa";

const Bottomnav = () => {
  return (
    <footer className="footer">

      {/* ── Barbed-wire top border ── */}
      <div className="footer-wire" aria-hidden="true" />

      <div className="footer-container">

        {/* ── Brand ── */}
        <div className="footer-brand">
          <div className="footer-logo-section">
            <img src={logo} alt="Texas Joe's logo" className="footer-logo" />
            <div className="footer-title">
              <span className="footer-title__main">Texas Joe's</span>
              <span className="footer-title__sub">House of Ribs</span>
            </div>
          </div>

          <p className="footer-description">
            Slow-smoked over real hickory wood since 1999 — never boiled,
            never rushed. Authentic Texas BBQ served the way it was meant to be.
          </p>

          <div className="footer-badge">
            <FaFire className="footer-badge__icon" />
            <span>EST. 1999 · HICKORY SMOKED · NEVER BOILED</span>
          </div>

          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="footer-links">
          <h3 className="footer-section-title">Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/reservations">Reservations</Link></li>
            <li><Link to="/login">Sign In</Link></li>
          </ul>
        </div>

        {/* ── Menu Categories ── */}
        <div className="footer-links">
          <h3 className="footer-section-title">Our Menu</h3>
          <ul>
            <li><Link to="/menu">Spare Ribs</Link></li>
            <li><Link to="/menu">Baby Back Ribs</Link></li>
            <li><Link to="/menu">BBQ Platters</Link></li>
            <li><Link to="/menu">Steaks</Link></li>
            <li><Link to="/menu">Sides &amp; Desserts</Link></li>
          </ul>
        </div>

        {/* ── Contact ── */}
        <div className="footer-contact">
          <h3 className="footer-section-title">Contact Us</h3>

          <div className="contact-item">
            <FaMapMarkerAlt className="contact-icon" aria-hidden="true" />
            <span>Texas Joe's, House of Ribs · Philippines</span>
          </div>

          <div className="contact-item">
            <FaPhone className="contact-icon" aria-hidden="true" />
            <span>+63 (0) 555-RIBS</span>
          </div>

          <div className="contact-item">
            <FaEnvelope className="contact-icon" aria-hidden="true" />
            <span>info@texasjoes.site</span>
          </div>

          <div className="contact-item">
            <FaClock className="contact-icon" aria-hidden="true" />
            <div className="contact-hours">
              <span>Mon – Thu: 11AM – 9PM</span>
              <span>Fri – Sat: 11AM – 11PM</span>
              <span>Sun: 12PM – 8PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} Texas Joe's House of Ribs. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <span className="footer-divider" aria-hidden="true">|</span>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Bottomnav;