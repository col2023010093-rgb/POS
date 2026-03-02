import React from "react";
import "./Bottomnav.css";
import logo from "../../assets/logo.png";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

const Bottomnav = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <div className="footer-logo-section">
            <img src={logo} alt="Restaurant Logo" className="footer-logo" />
            <div className="footer-title">
              <span className="line1">Texas Joe's</span>
              <span className="line2">House of Ribs</span>
            </div>
          </div>
          <p className="footer-description">
            Authentic Texas-style BBQ with slow-smoked ribs, brisket, and all
            the fixings. Serving up the best flavors of the West since 1985.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">Menu</a>
            </li>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Contact</a>
            </li>
            <li>
              <a href="#">Reservations</a>
            </li>
          </ul>
        </div>

        {/* Menu Categories */}
        <div className="footer-links">
          <h3>Our Menu</h3>
          <ul>
            <li>
              <a href="#">Signature Ribs</a>
            </li>
            <li>
              <a href="#">Smoked Brisket</a>
            </li>
            <li>
              <a href="#">BBQ Platters</a>
            </li>
            <li>
              <a href="#">Sides & Fixings</a>
            </li>
            <li>
              <a href="#">Desserts</a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-contact">
          <h3>Contact Us</h3>
          <div className="contact-item">
            <FaMapMarkerAlt className="contact-icon" />
            <span>123 Rodeo Drive, Austin, TX 78701</span>
          </div>
          <div className="contact-item">
            <FaPhone className="contact-icon" />
            <span>(512) 555-RIBS</span>
          </div>
          <div className="contact-item">
            <FaEnvelope className="contact-icon" />
            <span>info@texasjoes.com</span>
          </div>
          <div className="contact-item">
            <FaClock className="contact-icon" />
            <div className="hours">
              <span>Mon-Thu: 11AM - 9PM</span>
              <span>Fri-Sat: 11AM - 11PM</span>
              <span>Sun: 12PM - 8PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 Texas Joe's House of Ribs. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <span className="divider">|</span>
            <a href="#">Terms of Service</a>
            <span className="divider">|</span>
            <a href="#">Careers</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Bottomnav;
