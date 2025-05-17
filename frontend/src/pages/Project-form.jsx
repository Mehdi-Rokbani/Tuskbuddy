import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../assets/style/Project-form.css';
import '../assets/style/Header.css';

const CreateProjectForm = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        nbmembers: 1,
        startDate: '',
        deadline: '',
        selectedSkills: [],
        description: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const skillOptions = [
        "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
        "Node.js", "Express", "MongoDB", "SQL", "Python", "Django", "Flask",
        "PHP", "Laravel", "Ruby", "Ruby on Rails", "Java", "Spring Boot",
        "C#", ".NET", "AWS", "Docker", "Kubernetes", "GraphQL", "REST API"
    ];

    if (user?.user?.role === 'freelancer') { navigate('/login'); }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillSelect = (e) => {
        const selectedSkill = e.target.value;
        if (selectedSkill && !formData.selectedSkills.includes(selectedSkill)) {
            setFormData(prev => ({
                ...prev,
                selectedSkills: [...prev.selectedSkills, selectedSkill]
            }));
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            selectedSkills: prev.selectedSkills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.selectedSkills.length === 0) {
            setError("Please select at least one technology");
            return;
        }

        if (formData.nbmembers < 1 || formData.nbmembers > 20) {
            setError("Number of members must be between 1 and 20");
            return;
        }

        const projectData = {
            ...formData,
            techused: formData.selectedSkills,
            client: user?.user?._id || '',
            nbmembers: Number(formData.nbmembers)
        };

        try {
            const response = await fetch('/projects/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(projectData)
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.error || "Something went wrong");
            } else {
                setError(null);
                navigate('/myproject');
            }
        } catch (err) {
            setError("Network error. Please try again.");
        }
    };

    return (
        <>
            <div className='header'>
                <Header />
            </div>
            <div className="page-container">
                <div className="form-wrapper">
                    <div className="project-form-container">
                        <h1>Create your project</h1>
                        <p>Turn your ideas into action—create your project now!</p>
                        <form onSubmit={handleSubmit}>
                            {/* Title Field */}
                            <div className="form-field">
                                <label>Project Name</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Members Field */}
                            <div className="form-field">
                                <label>Members Needed (1-20)</label>
                                <input
                                    type="number"
                                    name="nbmembers"
                                    min="1"
                                    max="20"
                                    value={formData.nbmembers}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Dates Fields */}
                            <div className="dates-container">
                                <div className="form-field">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Deadline</label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Skills Field */}
                            <div className="form-field">
                                <label>Technologies Needed</label>
                                <div className="skills-selector">
                                    <select
                                        onChange={handleSkillSelect}
                                        value="default"
                                    >
                                        <option value="default" disabled>Select skills</option>
                                        {skillOptions.filter(skill => !formData.selectedSkills.includes(skill)).map(skill => (
                                            <option key={skill} value={skill}>{skill}</option>
                                        ))}
                                    </select>
                                    <div className="selected-skills">
                                        {formData.selectedSkills.map(skill => (
                                            <div key={skill} className="skill-tag">
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Description Field */}
                            <div className="form-field">
                                <label>Project Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="submit-btn">Create Project</button>
                            {error && <div className="error-message">{error}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateProjectForm;