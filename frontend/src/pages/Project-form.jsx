import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../assets/style/Project-form.css';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        setIsSubmitting(true);
        setError(null);

        // Validation
        if (formData.selectedSkills.length === 0) {
            setError("Please select at least one technology");
            setIsSubmitting(false);
            return;
        }

        if (formData.nbmembers < 1 || formData.nbmembers > 20) {
            setError("Number of members must be between 1 and 20");
            setIsSubmitting(false);
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
                navigate('/myproject');
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <div className="project-form-page">
                <div className="form-container">
                    <div className="form-header">
                        <h1>Create New Project</h1>
                        <p className="subtitle">Turn your ideas into action—start by filling out the form below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="project-form">
                        {/* Project Name */}
                        <div className="form-group">
                            <label htmlFor="title">Project Name</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. E-commerce Website Redesign"
                                required
                            />
                        </div>

                        {/* Project Description */}
                        <div className="form-group">
                            <label htmlFor="description">Project Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your project goals, requirements, and any other relevant details..."
                                rows="5"
                                required
                            />
                        </div>

                        {/* Team Size */}
                        <div className="form-group">
                            <label htmlFor="nbmembers">Team Members Needed</label>
                            <div className="range-container">
                                <input
                                    type="range"
                                    id="nbmembers"
                                    name="nbmembers"
                                    min="1"
                                    max="20"
                                    value={formData.nbmembers}
                                    onChange={handleChange}
                                />
                                <span className="range-value">{formData.nbmembers}</span>
                            </div>
                        </div>

                        {/* Project Timeline */}
                        <div className="form-group dual-inputs">
                            <div className="date-input">
                                <label htmlFor="startDate">Start Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    //min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="date-input">
                                <label htmlFor="deadline">Deadline</label>
                                <input
                                    type="date"
                                    id="deadline"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        </div>

                        {/* Required Technologies */}
                        <div className="form-group">
                            <label>Required Technologies</label>
                            <div className="skills-selector">
                                <select
                                    onChange={handleSkillSelect}
                                    value="default"
                                    className="skills-dropdown"
                                >
                                    <option value="default" disabled>Select technologies</option>
                                    {skillOptions.filter(skill => !formData.selectedSkills.includes(skill)).map(skill => (
                                        <option key={skill} value={skill}>{skill}</option>
                                    ))}
                                </select>
                                <div className="selected-skills">
                                    {formData.selectedSkills.length > 0 ? (
                                        formData.selectedSkills.map(skill => (
                                            <div key={skill} className="skill-tag">
                                                {skill}
                                                <button
                                                    type="button"
                                                    className="remove-skill"
                                                    onClick={() => removeSkill(skill)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="no-skills">No technologies selected</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Creating...
                                    </>
                                ) : (
                                    "Create Project"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateProjectForm;