import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faCircleUser,
  faBell,
  faEnvelope,
  faSearch,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import "../assets/style/Acceuil.css";
import React, { useState, useRef, useEffect } from 'react';
import PopupInfo from "./popupInfo";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";

export default function Header() {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [showCardMenu, setShowCardMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const popupRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close popups when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // For user menu popup
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        if (!event.target.classList.contains('user-icon') &&
          !event.target.closest('.user-icon')) {
          setShowCardMenu(false);
        }
      }

      // For mobile menu
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        if (!event.target.classList.contains('mobile-menu-toggle') &&
          !event.target.closest('.mobile-menu-toggle')) {
          setShowMobileMenu(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef, mobileMenuRef]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleCardMenu = () => {
    setShowCardMenu(!showCardMenu);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo and Mobile Menu Toggle */}
        <div className="header-left">
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <Link to='/' className="logo">
            <span className="logo-primary">Task</span>
            <span className="logo-secondary">Buddy</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {user ? (
            <>
              <div className="nav-links">
                {user.user.role === 'freelancer' && (
                  <Link to='/freereq' className="nav-link">
                    My Requests
                  </Link>
                )}
                {user.user.role === 'client' && (
                  <Link to='/myproject' className="nav-link">
                    My Projects
                  </Link>
                )}
                {user.user.role === 'freelancer' && (
                  <Link to='/tasks' className="nav-link">
                    Tasks
                  </Link>
                )}
                {user.user.role === 'client' && (
                  <Link to='/tt' className="nav-link">
                    Teams
                  </Link>
                )}
                {user.user.role === 'client' && (
                  <Link to='/projectfrom' className="nav-link highlight">
                    Add Project
                  </Link>
                )}
                <Link to='/allprojects' className="nav-link">
                  Browse
                </Link>
              </div>
            </>
          ) : (
            <div className="nav-links">
              <Link to='/allprojects' className="nav-link">
                Browse Projects
              </Link>
              <Link to='/about' className="nav-link">
                About
              </Link>
            </div>
          )}
        </nav>

        {/* Search Bar */}
        <div className="header-search">
          <form onSubmit={handleSearch}>
            <div className="search-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search projects or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        {/* User Controls */}
        <div className="header-right">
          {user ? (
            <>
              <div className="user-controls">
                <button className="icon-button" aria-label="Notifications">
                  <FontAwesomeIcon icon={faBell} />
                  <span className="notification-badge">3</span>
                </button>

                <button className="icon-button" aria-label="Messages">
                  <FontAwesomeIcon icon={faEnvelope} />
                </button>

                <div className="user-menu">
                  <div
                    className="user-profile"
                    onClick={toggleCardMenu}
                  >
                    <div className="user-avatar">
                      {user.user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">{user.user.username}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`dropdown-icon ${showCardMenu ? 'open' : ''}`}
                    />
                  </div>

                  {showCardMenu && (
                    <div className="" ref={popupRef}>
                      <PopupInfo />

                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to='/login' className="auth-button login">
                Log In
              </Link>
              <Link to='/Sign-up' className="auth-button signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <nav className="mobile-nav">
            {user ? (
              <>
                {user.user.role === 'freelancer' && (
                  <Link to='/freereq' className="mobile-nav-link">
                    My Requests
                  </Link>
                )}
                {user.user.role === 'client' && (
                  <Link to='/myproject' className="mobile-nav-link">
                    My Projects
                  </Link>
                )}
                {user.user.role === 'freelancer' && (
                  <Link to='/tasks' className="mobile-nav-link">
                    Tasks
                  </Link>
                )}
                {user.user.role === 'client' && (
                  <Link to='/tt' className="mobile-nav-link">
                    Teams
                  </Link>
                )}
                {user.user.role === 'client' && (
                  <Link to='/projectfrom' className="mobile-nav-link highlight">
                    Add Project
                  </Link>
                )}
                <Link to='/allprojects' className="mobile-nav-link">
                  Browse Projects
                </Link>
                <Link to='/profile' className="mobile-nav-link">
                  My Profile
                </Link>
                <button
                  className="mobile-nav-link logout"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to='/allprojects' className="mobile-nav-link">
                  Browse Projects
                </Link>
                <Link to='/about' className="mobile-nav-link">
                  About
                </Link>
                <Link to='/login' className="mobile-nav-link">
                  Log In
                </Link>
                <Link to='/Sign-up' className="mobile-nav-link highlight">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}