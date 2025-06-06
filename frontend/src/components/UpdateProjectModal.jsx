import React, { useState } from 'react';
import '../assets/style/UpdateProjectModal.css';

const skillOptions = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
  "Node.js", "Express", "MongoDB", "SQL", "Python", "Django", "Flask",
  "PHP", "Laravel", "Ruby", "Ruby on Rails", "Java", "Spring Boot",
  "C#", ".NET", "AWS", "Docker", "Kubernetes", "GraphQL", "REST API"
];

const UpdateProjectModal = ({ project, onClose, onUpdate }) => {
  // Initialize techused as an array, ensuring it's always an array
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    nbmembers: project.nbmembers,
    techused: Array.isArray(project.techused) ? project.techused : [project.techused].filter(Boolean),
    deadline: project.deadline.slice(0, 10),
    startDate: project.startDate.slice(0, 10),
    status: project.status,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTechUsedChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return { ...prev, techused: [...prev.techused, value] };
      } else {
        return { ...prev, techused: prev.techused.filter(tech => tech !== value) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/projects/updateProject/${project._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          techused: formData.techused.filter(tech => tech) // Remove any empty values
        }),
      });

      if (response.ok) {
        await onUpdate();
        onClose();
      } else {
        console.error('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Project</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nbmembers">Members Needed</label>
              <input
                type="number"
                id="nbmembers"
                name="nbmembers"
                value={formData.nbmembers}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Technologies Used</label>
              <div className="techused-container">
                {skillOptions.map((skill) => (
                  <div key={skill} className="techused-option">
                    <input
                      type="checkbox"
                      id={`tech-${skill}`}
                      value={skill}
                      checked={formData.techused.includes(skill)}
                      onChange={handleTechUsedChange}
                    />
                    <label htmlFor={`tech-${skill}`}>{skill}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Deadline</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="secondary-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProjectModal;