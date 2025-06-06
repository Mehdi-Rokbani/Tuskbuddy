import React from "react";
import { FaGithub, FaTwitter, FaLinkedin, FaRegEnvelope } from "react-icons/fa";
import "../assets/style/Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <h2 className="logo">TaskBuddy</h2>
                    <p className="tagline">Helping teams get stuff done, smarter.</p>
                    
                    <div className="social-links">
                        <a href="https://github.com" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                            <FaGithub className="social-icon" />
                        </a>
                        <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                            <FaTwitter className="social-icon" />
                        </a>
                        <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                            <FaLinkedin className="social-icon" />
                        </a>
                        <a href="mailto:contact@taskbuddy.com" aria-label="Email">
                            <FaRegEnvelope className="social-icon" />
                        </a>
                    </div>
                </div>

                <div className="footer-grid">
                    <div className="footer-column">
                        <h4 className="column-title">Product</h4>
                        <ul className="footer-menu">
                            <li><a href="#" className="footer-link">Features</a></li>
                            <li><a href="#" className="footer-link">Pricing</a></li>
                            <li><a href="#" className="footer-link">Documentation</a></li>
                            <li><a href="#" className="footer-link">Changelog</a></li>
                        </ul>
                    </div>
                    
                    <div className="footer-column">
                        <h4 className="column-title">Company</h4>
                        <ul className="footer-menu">
                            <li><a href="#" className="footer-link">About Us</a></li>
                            <li><a href="#" className="footer-link">Careers</a></li>
                            <li><a href="#" className="footer-link">Blog</a></li>
                            <li><a href="#" className="footer-link">Contact</a></li>
                        </ul>
                    </div>
                    
                    <div className="footer-column">
                        <h4 className="column-title">Resources</h4>
                        <ul className="footer-menu">
                            <li><a href="#" className="footer-link">Help Center</a></li>
                            <li><a href="#" className="footer-link">Community</a></li>
                            <li><a href="#" className="footer-link">Webinars</a></li>
                            <li><a href="#" className="footer-link">Tutorials</a></li>
                        </ul>
                    </div>
                    
                    <div className="footer-column">
                        <h4 className="column-title">Legal</h4>
                        <ul className="footer-menu">
                            <li><a href="#" className="footer-link">Privacy Policy</a></li>
                            <li><a href="#" className="footer-link">Terms of Service</a></li>
                            <li><a href="#" className="footer-link">Cookie Policy</a></li>
                            <li><a href="#" className="footer-link">GDPR</a></li>
                        </ul>
                    </div>
                </div>

                <div className="newsletter">
                    <h4 className="newsletter-title">Stay Updated</h4>
                    <form className="newsletter-form">
                        <input 
                            type="email" 
                            placeholder="Your email address" 
                            className="newsletter-input"
                            required
                        />
                        <button type="submit" className="newsletter-button">
                            Subscribe
                        </button>
                    </form>
                    <p className="newsletter-note">We'll never spam you. Unsubscribe anytime.</p>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p className="copyright">
                        © {new Date().getFullYear()} TaskBuddy. All rights reserved.
                    </p>
                    <div className="legal-links">
                        <a href="#" className="legal-link">Privacy</a>
                        <span className="divider">•</span>
                        <a href="#" className="legal-link">Terms</a>
                        <span className="divider">•</span>
                        <a href="#" className="legal-link">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}