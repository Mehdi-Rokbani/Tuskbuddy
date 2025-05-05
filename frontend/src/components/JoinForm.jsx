import React, { useState } from 'react';
import '../assets/style/JoinForm.css'; 

const JoinForm = ({ projectId, userId, ownerId }) => {
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleSkillsChange = (e) => setSkills(e.target.value);
  const handleAboutChange = (e) => setAbout(e.target.value);

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
          skills,
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
      setSkills('');
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
        <input
          type="text"
          name="skills"
          placeholder="Skills"
          value={skills}
          onChange={handleSkillsChange}
          required
        />
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
