
import React from "react";
import "../assets/style/Acceuil.css";

export default function Header() {
  return (
    <header className="homepage-header">
      <div className="logo">TaskBuddy</div>

      <div className="header-right">
        <input
          type="text"
          placeholder="Search"
          className="search-input"
        />
        <button className="login-button">Login</button>
        <button className="signup-button">Sign up</button>
      </div>
    </header>
  );
}
