import { useState } from "react";
import { useSingup } from "../hooks/useSignup";
import "../assets/style/Signup.css";
import "../assets/style/Header.css";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [role, setRole] = useState("");
    const { signup, Error, Loading } = useSingup();
    const { user } = useAuthContext();
    const navigate = useNavigate();

    // Redirect if user is already logged in
    if (user) {
        navigate('/');
    }

    // Show error toast when Error from useSignup changes
    if (Error) {
        toast.error(Error);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !username || !password || !passwordCheck || !role) {
            toast.warning("Please fill in all required fields");
            return;
        }

        if (password !== passwordCheck) {
            toast.error("Password confirmation doesn't match");
        } else {
            let user = {
                email: email,
                username: username,
                password: password,
                role: role
            };

            await signup(user);
        }
    };

    return (
        <div>
            <div className="header">
                <Header />
            </div>

            <div className="signup-container">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <h2>Create An Account</h2>
                    <p>Create an account to enjoy all the services</p>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password check"
                        value={passwordCheck}
                        onChange={(e) => setPasswordCheck(e.target.value)}
                        required
                    />

                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                value="freelancer"
                                checked={role === "freelancer"}
                                onChange={() => setRole("freelancer")}
                            />
                            I'm a Freelancer, looking for work
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="client"
                                checked={role === "client"}
                                onChange={() => setRole("client")}
                            />
                            I'm a client, hiring for a project
                        </label>
                    </div>

                    <button type="submit" disabled={Loading}>
                        {Loading ? "Signing up..." : "Sign up"}
                    </button>

                    <p className="signin-text">
                        Already Have An Account? <Link to='/login'>Sign in</Link>
                    </p>
                </form>
            </div>

            {/* Toast Container */}
           
        </div>
    );
};

export default SignupForm;