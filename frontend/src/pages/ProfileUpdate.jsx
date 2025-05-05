import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useEffect } from "react";
import Header from "../components/Header";
import '../assets/style/Header.css';
import '../assets/style/Profile.css';
import { toast } from "react-toastify";

const ProfileUpdate = () => {
    const { user } = useContext(AuthContext);
    const { dispatch } = useContext(AuthContext)

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

    return (
        <>
            <div className="header">
                <Header />
            </div>

            <div className="profile">
                <h2>Your Profile</h2>

                {/* Username Field */}
                <div className="field-row">
                    <label>Username:</label>
                    {editingField === "username" ? (
                        <>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <button onClick={() => handleSave("username", username)}>Save</button>
                        </>
                    ) : (
                        <>
                            <span>{username}</span>
                            <button onClick={() => setEditingField("username")}>Edit</button>
                        </>
                    )}
                </div>

                {/* Email Field */}
                <div className="field-row">
                    <label>Email:</label>
                    {editingField === "email" ? (
                        <>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button onClick={() => handleSave("email", email)}>Save</button>
                        </>
                    ) : (
                        <>
                            <span>{email}</span>
                            <button onClick={() => setEditingField("email")}>Edit</button>
                        </>
                    )}
                </div>

                {/* Skills Field */}
                <div className="field-row">
                    <label>Skills:</label>
                    {editingField === "skills" ? (
                        <>
                            <input
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                            />
                            <button onClick={() => handleSave("skills", skills)}>Save</button>
                        </>
                    ) : (
                        <>
                            <span>{skills}</span>
                            <button onClick={() => setEditingField("skills")}>Edit</button>
                        </>
                    )}
                </div>

                {/* Password Field */}
                <div className="field-row">
                    <label>Password:</label>
                    {editingField === "password" ? (
                        <>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button onClick={() => handleSave("password", password)}>Save</button>
                        </>
                    ) : (
                        <>
                            <span>••••••</span>
                            <button onClick={() => setEditingField("password")}>Edit</button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProfileUpdate;
