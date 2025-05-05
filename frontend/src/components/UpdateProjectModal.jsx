import React, { useState } from 'react';
import '../assets/style/UpdateProjectModal.css';

const UpdateProjectModal = ({ project, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    nbmembers: project.nbmembers,
    techused: project.techused,
    deadline: project.deadline.slice(0, 10), // Ensure format for input type="date"
    status: project.status,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/projects/updateProject/${project._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          nbmembers: formData.nbmembers,
          techused: formData.techused,
          deadline: formData.deadline,
          status: formData.status,
        }),
      });

      if (response.ok) {
        await onUpdate(); // ✅ Re-fetches projects
        onClose();        // ✅ Closes modal
      } else {
        console.error('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content0">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Update Project</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input name="title" value={formData.title} onChange={handleChange} required />
          </label>
          <label>
            Description:
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </label>
          <label>
            Members Needed:
            <input
              type="number"
              name="nbmembers"
              value={formData.nbmembers}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Technologies Used:
            <input name="techused" value={formData.techused} onChange={handleChange} required />
          </label>
          <label>
            Deadline:
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Status:
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <div className="form-buttons">
  <button type="submit">Update Project</button>
  <button type="button" onClick={onClose} className="cancel-button">
    Cancel
  </button>
</div>

        </form>
      </div>
    </div>
  );
};

export default UpdateProjectModal;
