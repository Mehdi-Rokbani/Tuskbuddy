import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router
import Header from '../components/Header';
import '../assets/style/NotFound.css';

const NotFound = () => {
    return (
        <>
            <div className='header'>
                <Header />
            </div>

            <div className="not-found-container">
                <div className="not-found-content">
                    <div className="not-found-code">404</div>
                    <h1 className="not-found-title">Page Not Found</h1>
                    <p className="not-found-message">
                        Oops! The page you are looking for doesn't exist or has been moved.
                    </p>

                    <div className="not-found-illustration">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path className="path-anim" d="M 50,100 C 50,75 75,50 100,50 C 125,50 150,75 150,100 C 150,125 125,150 100,150 C 75,150 50,125 50,100" fill="none" stroke="#4a56e2" strokeWidth="2"></path>
                            <circle className="circle-anim" cx="100" cy="100" r="30" fill="none" stroke="#4a56e2" strokeWidth="2"></circle>
                            <path className="path-anim-2" d="M 50,75 L 150,125" fill="none" stroke="#ff5252" strokeWidth="2" strokeDasharray="5,5"></path>
                            <path className="path-anim-2" d="M 50,125 L 150,75" fill="none" stroke="#ff5252" strokeWidth="2" strokeDasharray="5,5"></path>
                        </svg>
                    </div>

                    <div className="not-found-actions">
                        <Link to="/" className="home-button">Go to Homepage</Link>
                        <button onClick={() => window.history.back()} className="back-button">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotFound;