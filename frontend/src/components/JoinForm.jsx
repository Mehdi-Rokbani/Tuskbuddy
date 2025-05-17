import React, { useState } from 'react';
import '../assets/style/JoinForm.css';

const JoinForm = ({ projectId, userId, ownerId }) => {
  const [email, setEmail] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Predefined list of web development skills
  const skillOptions = [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
    "Node.js", "Express", "MongoDB", "SQL", "Python", "Django", "Flask",
    "PHP", "Laravel", "Ruby", "Ruby on Rails", "Java", "Spring Boot",
    "C#", ".NET", "AWS", "Docker", "Kubernetes", "GraphQL", "REST API"
  ];

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleAboutChange = (e) => setAbout(e.target.value);

  const handleSkillSelect = (e) => {
    const selectedSkill = e.target.value;
    if (selectedSkill && !selectedSkills.includes(selectedSkill) && selectedSkill !== "default") {
      setSelectedSkills([...selectedSkills, selectedSkill]);
    }
  };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/requests/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          userId,
          ownerId,
          email,
          skills: selectedSkills, // Send skills as an array
          about
        }),
      });

      const data = await response.json();
      console.log(data)
      if (!response.ok) {
        throw new Error(data.message || 'Error submitting the request.');
      }

      setSuccessMessage('Join request sent successfully!');
      // Reset form
      setEmail('');
      setSelectedSkills([]);
      setAbout('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-form-container">
      <h2>Join the Project</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          required
        />

        <div className="skills-selector">
          <label htmlFor="skills">Skills</label>
          <select
            id="skills"
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
            {selectedSkills.length > 0 ? (
              selectedSkills.map(skill => (
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
              <span className="no-skills">No skills selected</span>
            )}
          </div>
        </div>

        <textarea
          name="about"
          placeholder="Talk about yourself"
          value={about}
          onChange={handleAboutChange}
          required
        ></textarea>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Submitting...' : 'Join'}
        </button>
      </form>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default JoinForm;