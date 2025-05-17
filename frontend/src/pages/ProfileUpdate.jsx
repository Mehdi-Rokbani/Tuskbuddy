import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import { toast } from "react-toastify";
import '../assets/style/Header.css';
import '../assets/style/Profile.css';

const ProfileUpdate = () => {
    const { user, dispatch } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [password, setPassword] = useState("");
    const [editingField, setEditingField] = useState(null);

    // Predefined list of web development skills
    const skillOptions = [
        "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
        "Node.js", "Express", "MongoDB", "SQL", "Python", "Django", "Flask",
        "PHP", "Laravel", "Ruby", "Ruby on Rails", "Java", "Spring Boot",
        "C#", ".NET", "AWS", "Docker", "Kubernetes", "GraphQL", "REST API"
    ];

    useEffect(() => {
        if (user) {
            setUsername(user?.user?.username || '');
            setEmail(user?.user?.email || '');
            setSelectedSkills(user?.user?.skills || []);
        }
    }, [user]);

    const handleSave = async (field, value) => {
        try {
            const updatedValue = field === "skills" ? selectedSkills : value;

            const res = await fetch(`/users/UpdateUser/${user.user._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: updatedValue }),
            });

            if (!res.ok) throw new Error("Update failed");

            const updatedUser = await res.json();
            const newUser = { user: updatedUser };

            localStorage.setItem('user', JSON.stringify(newUser));
            dispatch({ type: 'LOGIN', payload: newUser });
            setEditingField(null);
            toast.success(`${field} updated successfully`, {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (err) {
            console.error(err);
            toast.error(`${field} update failed`, {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const cancelEdit = () => {
        // Reset to original values when canceling edit
        if (editingField === "username") setUsername(user?.user?.username || '');
        if (editingField === "email") setEmail(user?.user?.email || '');
        if (editingField === "skills") setSelectedSkills(user?.user?.skills || []);
        if (editingField === "password") setPassword("");
        setEditingField(null);
    };

    const handleSkillChange = (skill) => {
        setSelectedSkills(prevSkills => {
            if (prevSkills.includes(skill)) {
                return prevSkills.filter(s => s !== skill);
            } else {
                return [...prevSkills, skill];
            }
        });
    };

    const handleSkillSelect = (e) => {
        const selectedSkill = e.target.value;
        if (selectedSkill && !selectedSkills.includes(selectedSkill) && selectedSkill !== "default") {
            setSelectedSkills([...selectedSkills, selectedSkill]);
        }
    };

    const removeSkill = (skillToRemove) => {
        setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
    };

    return (
        <div className="profile-page">
            <Header />

            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <h1>Your Profile</h1>
                </div>

                <div className="profile-card">
                    <div className="profile-field">
                        <div className="field-label">Username</div>
                        <div className="field-content">
                            {editingField === "username" ? (
                                <div className="edit-mode">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter username"
                                    />
                                    <div className="button-group">
                                        <button className="save-btn" onClick={() => handleSave("username", username)}>Save</button>
                                        <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <span>{username}</span>
                                    <button className="edit-btn" onClick={() => setEditingField("username")}>Edit</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-field">
                        <div className="field-label">Email</div>
                        <div className="field-content">
                            {editingField === "email" ? (
                                <div className="edit-mode">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email"
                                    />
                                    <div className="button-group">
                                        <button className="save-btn" onClick={() => handleSave("email", email)}>Save</button>
                                        <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <span>{email}</span>
                                    <button className="edit-btn" onClick={() => setEditingField("email")}>Edit</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-field">
                        <div className="field-label">Skills</div>
                        <div className="field-content">
                            {editingField === "skills" ? (
                                <div className="edit-mode">
                                    <div className="skills-selector">
                                        <select
                                            onChange={handleSkillSelect}
                                            value="default"
                                            className="skills-dropdown"
                                        >
                                            <option value="default" disabled>Select skills</option>
                                            {skillOptions.filter(skill => !selectedSkills.includes(skill)).map(skill => (
                                                <option key={skill} value={skill}>{skill}</option>
                                            ))}
                                        </select>

                                        <div className="selected-skills">
                                            {selectedSkills.map(skill => (
                                                <div key={skill} className="skill-tag">
                                                    {skill}
                                                    <button
                                                        className="remove-skill"
                                                        onClick={() => removeSkill(skill)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="button-group">
                                        <button className="save-btn" onClick={() => handleSave("skills")}>Save</button>
                                        <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <span className="skills-display">
                                        {selectedSkills.length > 0 ? (
                                            <div className="skills-tags">
                                                {selectedSkills.map(skill => (
                                                    <span key={skill} className="skill-tag read-only">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="no-skills">No skills added</span>
                                        )}
                                    </span>
                                    <button className="edit-btn" onClick={() => setEditingField("skills")}>Edit</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-field">
                        <div className="field-label">Password</div>
                        <div className="field-content">
                            {editingField === "password" ? (
                                <div className="edit-mode">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                    <div className="button-group">
                                        <button className="save-btn" onClick={() => handleSave("password", password)}>Save</button>
                                        <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <span>••••••••</span>
                                    <button className="edit-btn" onClick={() => setEditingField("password")}>Change</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileUpdate;