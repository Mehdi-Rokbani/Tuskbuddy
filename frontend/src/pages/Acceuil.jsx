import React, { useEffect } from "react";
import "../assets/style/Acceuil.css";
import Footer from "../components/Footer0";
import Header from "../components/Header";
import Projects0 from "../components/Projects0";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

export default function Acceuil() {
  const { user } = useAuthContext();

  // Add smooth scroll effect
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <div className="homepage">
        <Header />

        <main className="homepage-main">
          <div className="main-text">
            <h1>Get work Done with TaskBuddy</h1>
            <p>
              Project management software that enables your teams to collaborate,
              plan, analyze and manage everyday tasks.
            </p>

            {user?.user?.role === 'freelancer' && (
              <Link to='/allprojects'>
                <button className="start-button">look for a project →</button>
              </Link>
            )}

            {user?.user?.role === 'client' && (
              <Link to='/projectfrom'>
                <button className="start-button">start a project →</button>
              </Link>
            )}

            {!user && (
              <Link to='/login'>
                <button className="start-button">log in First →</button>
              </Link>
            )}
          </div>

          <div className="main-image" data-aos="fade-left">
            <img
              src="tswra2.png"
              alt="Team collaboration illustration"
            />
          </div>
        </main>

        <Projects0 />
      </div>

      <Footer />
    </>
  );
}