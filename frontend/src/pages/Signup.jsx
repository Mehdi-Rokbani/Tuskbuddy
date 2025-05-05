import { useState } from "react";
import { useSingup } from "../hooks/useSignup";
import "../assets/style/Signup.css";
import "../assets/style/Header.css"
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
const SignupForm = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [role, setRole] = useState("");
    const { signup, Error, Loading } = useSingup()
    const [fornerror,seterror]=useState(null)
    const {user}=useAuthContext()
    const navigate=useNavigate();
    if(user){
        navigate('/')
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordCheck) {
            seterror("password confirmation incorrect")
        }
        else {
            seterror(null)
            let user = {
                email: email,
                username: username,
                password: password,
                role: role
            }

            await signup(user);
        }
    };

    return (
        <div>

            <div className="header">
                < Header />
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
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password check"
                        value={passwordCheck}
                        onChange={(e) => setPasswordCheck(e.target.value)}
                    />

                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                value="freelancer"
                                checked={role === "freelancer"}
                                onChange={() => setRole("freelancer")}
                            />
                            I’m a Freelancer, looking for work
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="client"
                                checked={role === "client"}
                                onChange={() => setRole("client")}
                            />
                            I’m a client, hiring for a project
                        </label>
                    </div>

                    <button type="submit" disabled={Loading}>Sign up</button>
                    <p className="signin-text">
                        Already Have An Account?<Link to='/login'>Sign in</Link>
                    </p>
                    {Error && <div className="error"> {Error}</div>}
                    {fornerror && <div className="error"> {fornerror}</div>}
                </form>
            </div>
        </div>
    );
};

export default SignupForm;
