import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/Projectcard.css';

const ProjectCard0 = ({ project, onUpdated }) => {
  const [owner, setOwner] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const res = await fetch(`/users/Getuser/${project.client}`);
        const data = await res.json();
        setOwner(data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    if (project.client) {
      fetchOwner();
    }
  }, [project.client]);

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div
      className={`project-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-header">
        <div className="project-meta">
          {owner && (
            <div className="project-owner">
              <div className="owner-avatar">
                {owner.username?.charAt(0).toUpperCase()}
              </div>
              <span className="owner-name">{owner.username}</span>
            </div>
          )}
          <div className="project-date">
            {project.createdAt && formatDate(project.startDate)}
          </div>
        </div>

        <h3 className="project-title">{project.title}</h3>
        <p className="project-description">{project.description}</p>
      </div>

      <div className="card-footer">
        <div className="project-tech">
          {project.techused?.slice(0, 3).map((tech, index) => (
            <span key={index} className="tech-tag">{tech}</span>
          ))}
          {project.techused?.length > 3 && (
            <span className="tech-tag-more">+{project.techused.length - 3}</span>
          )}
        </div>

        <div className="project-team">
          <span className="team-size">
            {project.nbmembers || 1} member{project.nbmembers !== 1 ? 's' : ''} needed
          </span>
        </div>

        <Link
          to={`/project/${project._id}`}
          className="project-link"
          aria-label={`View details of ${project.title}`}
        >
          <button className="view-button">
            View Project
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard0;