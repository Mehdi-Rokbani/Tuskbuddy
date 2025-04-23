import React from "react";
import "../assets/style/Acceuil.css";
import Footer from "../components/Footer0";
import Header from "../components/Header";
export default function Acceuil() {
  return (
    <div className="homepage">
      < Header/>

      <main className="homepage-main">
        <div className="main-text">
          <h1>Get work Done with TaskBuddy</h1>
          <p>
            Project management software that enables your teams to collaborate,
            plan, analyze and manage everyday tasks.
          </p>
          <button className="start-button">Start a project →</button>
        </div>

        <div className="main-image">
          <img
            src="/taskbuddy-illustration.png.avif"
            alt="Team collaboration illustration"
          />
        </div>
      </main>
      <Footer />
    </div>

    
  );
}
