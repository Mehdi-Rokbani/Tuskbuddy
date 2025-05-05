import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import "../assets/style/Acceuil.css";
import React, { useState } from 'react';

import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";

import Sidebar from "./SideBar";
export default function Header() {
  const { logout } = useLogout()
  const { user } = useAuthContext()
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogoClick = () => {
    setShowSidebar(!showSidebar);
  };
  const handleClick = () => {
    logout();
  }
  return (
    <header className="homepage-header">
      {showSidebar && <Sidebar onClose={handleLogoClick} />}
      <FontAwesomeIcon icon={faBars} onClick={handleLogoClick} className="bar" />
      <Link to='/' className="logo" >TaskBuddy</Link>


      <div className="header-right">
        

        {user && (
          <div className="user-menu">
            <span className="user-name">{user?.user?.username}</span>
            
            <Link to='/info'><FontAwesomeIcon icon={faCircleUser} className="icon0"/></Link>
            <button onClick={handleClick} className="logout-button">
              Logout
            </button>
          </div>


        )}
        {!user && (<>
          <Link to='/login'><button className="login-button">Login</button></Link>
          <Link to='/Sign-up'><button className="signup-button">Sign up</button></Link></>
        )}

      </div>
    </header>
  );
}
