import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer0";
import "../assets/style/Acceuil.css";
import hero from '../assets/images/hero.svg'
// Import icons (you'll need to install react-icons or use your own)
import { FiArrowRight, FiCheckCircle, FiUsers, FiTrendingUp, FiClock } from "react-icons/fi";

export default function Acceuil() {
  const { user } = useAuthContext();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <Header />

      <div className="homepage-container">
        {/* Hero Section */}
        <section className="hero-section">


          <div className="hero-content">
            <div className="hero-text">
              <h1>Streamline Your Projects with <span>TaskBuddy</span></h1>
              <p className="hero-subtitle">
                The collaborative platform that connects clients with skilled freelancers
                to bring projects to life efficiently and effectively.
              </p>

              <div className="hero-cta">
                {user?.user?.role === 'freelancer' && (
                  <Link to='/allprojects' className="cta-button primary">
                    Browse Projects <FiArrowRight className="cta-icon" />
                  </Link>
                )}

                {user?.user?.role === 'client' && (
                  <Link to='/projectfrom' className="cta-button primary">
                    Start a Project <FiArrowRight className="cta-icon" />
                  </Link>
                )}

                {!user && (
                  <div className="auth-buttons">
                    <Link to='/login' className="cta-button primary">
                      Sign In
                    </Link>
                    <Link to='/register' className="cta-button secondary">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="hero-image">
              <img src={hero} alt="No teams" className="empty-teams-image" />
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="value-section">
          <div className="section-header">
            <h2>Why Choose TaskBuddy?</h2>
            <p>Our platform is designed to make project management seamless for both clients and freelancers</p>
          </div>

          <div className="value-cards">
            <div className="value-card">
              <FiCheckCircle className="value-icon" />
              <h3>Simple Task Management</h3>
              <p>Easily create, assign, and track tasks with our intuitive interface.</p>
            </div>

            <div className="value-card">
              <FiUsers className="value-icon" />
              <h3>Skilled Professionals</h3>
              <p>Connect with vetted freelancers who have the skills you need.</p>
            </div>

            <div className="value-card">
              <FiTrendingUp className="value-icon" />
              <h3>Progress Tracking</h3>
              <p>Real-time updates and visual progress indicators keep everyone aligned.</p>
            </div>

            <div className="value-card">
              <FiClock className="value-icon" />
              <h3>Time Efficiency</h3>
              <p>Reduce project timelines with streamlined communication and workflows.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <div className="section-header">
            <h2>How TaskBuddy Works</h2>
            <p>Get your project started in just a few simple steps</p>
          </div>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Post Your Project</h3>
                <p>Clients create projects with clear requirements and deadlines.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Find Talent</h3>
                <p>Freelancers apply with their proposals and portfolios.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Collaborate</h3>
                <p>Manage tasks, share files, and communicate in one place.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Deliver Success</h3>
                <p>Complete projects efficiently and build lasting partnerships.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Success stories from clients and freelancers</p>
          </div>

          <div className="testimonial-cards">
            <div className="testimonial-card">
              <div className="testimonial-content">
                "TaskBuddy helped me find the perfect developer for my app. The platform made collaboration effortless."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Startup Founder</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                "As a freelancer, I've found consistent work through TaskBuddy. The task management tools are fantastic."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <h4>Michael Chen</h4>
                  <p>Web Developer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="final-cta">
          <h2>Ready to Transform Your Workflow?</h2>
          <p>Join thousands of clients and freelancers already using TaskBuddy</p>

          <div className="cta-buttons">
            {user ? (
              user.user.role === 'client' ? (
                <Link to="/projectfrom" className="cta-button primary">
                  Start a New Project
                </Link>
              ) : (
                <Link to="/allprojects" className="cta-button primary">
                  Browse Available Projects
                </Link>
              )
            ) : (
              <>
                <Link to="/register" className="cta-button primary">
                  Sign Up Free
                </Link>
                <Link to="/login" className="cta-button secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}