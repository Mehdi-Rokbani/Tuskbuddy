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
    const [skills, setSkills] = useState([]);
    const [password, setPassword] = useState("");
    const [editingField, setEditingField] = useState(null);
    
    useEffect(() => {
        if (user) {
            setUsername(user?.user?.username || '');
            setEmail(user?.user?.email || '');
            setSkills(user?.user?.skills ? user?.user?.skills.join(', ') : '');
        }
    }, [user]);

    const handleSave = async (field, value) => {
        const updatedValue = field === "skills"
            ? value.split(",").map((s) => s.trim())
            : value;

        try {
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
        if (editingField === "skills") setSkills(user?.user?.skills ? user?.user?.skills.join(', ') : '');
        if (editingField === "password") setPassword("");
        setEditingField(null);
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
                                    <input
                                        type="text"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        placeholder="Enter skills (comma separated)"
                                    />
                                    <div className="button-group">
                                        <button className="save-btn" onClick={() => handleSave("skills", skills)}>Save</button>
                                        <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <span className="skills-display">
                                        
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