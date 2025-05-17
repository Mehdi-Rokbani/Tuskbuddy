import React, { useContext, useState, useEffect } from "react";

import "../assets/style/Login.css";
import Header from "../components/Header";
import "../assets/style/Header.css"
import { useLogin } from "../hooks/useLogin";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, Error, Loading } = useLogin();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        // Display error toast when Error state changes
        if (Error) {
            toast.error(Error, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }
    }, [Error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div>
            <div className="header">
                <Header />
            </div>
           
            <div className="login-container">
                <form className="login-box" onSubmit={handleSubmit}>
                    <h2>Log In</h2>
                    <p className="subtitle">Welcome back! Log in to stay on top of your task</p>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={Loading}>
                        {Loading ? "Logging in..." : "Log In"}
                    </button>

                    <p className="signup-text">
                        Don't have an account? <Link to='/Sign-up'>Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;