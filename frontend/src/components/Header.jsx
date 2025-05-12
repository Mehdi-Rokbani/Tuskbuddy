import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import "../assets/style/Acceuil.css";
import React, { useState, useRef, useEffect } from 'react';
import PopupInfo from "./popupInfo";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";


export default function Header() {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  
  const [showCardMenu, setShowCardMenu] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !event.target.classList.contains('user-icon')
      ) {
        setShowCardMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);



  const handleLogout = () => {
    logout();
  };

  const toggleCardMenu = () => {
    setShowCardMenu(!showCardMenu);
  };

  return (
    <header className="homepage-header">


      <Link to='/' className="logo">TaskBuddy</Link>

      <div className="header-right">
        {user ? (
          <>
            {user.user.role === 'freelancer' && <Link to='/freereq'><li>My requests</li></Link>}
            {user.user.role === 'client' && <Link to='/myproject'><li>My Projects</li></Link>}
            {user.user.role === 'freelancer' && <Link to='/tasks'><li>Tasks</li></Link>}
            {user.user.role === 'client' && <Link to='/tt'><li>Teams</li></Link>}
            {user.user.role === 'client' && <Link to='/projectfrom'><li>Add Project</li></Link>}
            <Link to='/allprojects'><li>All Projects</li></Link>

            <div className="user-menu">
              <span className="user-name">{user?.user?.username}</span>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon
                  icon={faCircleUser}
                  className="user-icon icon0"
                  onClick={toggleCardMenu}
                  style={{ cursor: 'pointer' }}
                />
                {showCardMenu && (
                  <div ref={popupRef}>
                    <PopupInfo />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to='/login'>
              <button className="login-button">Login</button>
            </Link>
            <Link to='/Sign-up'>
              <button className="signup-button">Sign up</button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
