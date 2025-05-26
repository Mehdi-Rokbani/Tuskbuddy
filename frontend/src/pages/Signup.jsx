import { useState } from "react";
import { useSingup } from "../hooks/useSignup";
import "../assets/style/Signup.css";
import "../assets/style/Header.css";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [role, setRole] = useState("");
    const { signup, error, isLoading } = useSingup();
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const skillOptions = [
        "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
        "Node.js", "Express", "MongoDB", "SQL", "Python", "Django", "Flask",
        "PHP", "Laravel", "Ruby", "Ruby on Rails", "Java", "Spring Boot",
        "C#", ".NET", "AWS", "Docker", "Kubernetes", "GraphQL", "REST API"
    ];
    const [selectedSkills, setSelectedSkills] = useState([]);

    // Redirect if user is already logged in
    if (user) {
        navigate('/');
    }

    // Show error toast when error from useSignup changes
    if (error) {
        toast.error(error);
    }

    const handleSkillChange = (skill) => {
        setSelectedSkills(prevSkills => {
            if (prevSkills.includes(skill)) {
                return prevSkills.filter(s => s !== skill);
            } else {
                return [...prevSkills, skill];
            }
        });
    };

    const removeSkill = (skillToRemove) => {
        setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !username || !password || !passwordCheck || !role) {
            toast.warning("Please fill in all required fields");
            return;
        }

        if (password !== passwordCheck) {
            toast.error("Password confirmation doesn't match");
            return;
        }

        if (role === "freelancer" && selectedSkills.length === 0) {
            toast.warning("Please select at least one skill");
            return;
        }

        const userData = {
            email,
            username,
            password,
            role,
            ...(role === "freelancer" && { skills: selectedSkills }) // Only add skills if freelancer
        };

        await signup(userData);
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

                    {role === "freelancer" && (
                        <div className="skills-section">
                            <div className="skills-selector">
                                <select 
                                    onChange={(e) => {
                                        const selectedSkill = e.target.value;
                                        if (selectedSkill && selectedSkill !== "default") {
                                            handleSkillChange(selectedSkill);
                                            e.target.value = "default";
                                        }
                                    }}
                                    defaultValue="default"
                                >
                                    <option value="default" disabled>Select your skills</option>
                                    {skillOptions
                                        .filter(skill => !selectedSkills.includes(skill))
                                        .map(skill => (
                                            <option key={skill} value={skill}>
                                                {skill}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="selected-skills">
                                {selectedSkills.map(skill => (
                                    <div key={skill} className="skill-tag">
                                        {skill}
                                        <button 
                                            type="button"
                                            className="remove-skill-btn"
                                            onClick={() => removeSkill(skill)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Signing up..." : "Sign up"}
                    </button>

                    <p className="signin-text">
                        Already Have An Account? <Link to='/login'>Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignupForm;