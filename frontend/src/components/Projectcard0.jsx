import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import '../assets/style/Projectcard.css';

const ProjectCard0 = ({ project ,key,onUpdated}) => {
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const res = await fetch(`users/Getuser/${project.client}`);
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
  

  return (
    <>
      <div className="project-card">
        <Link to={`/project/${project._id}`}>
        <div className="quote-title-container">
  <div className="quote">❝</div>
  <div className='title'>{project.title}</div>
</div>
          <p className="description">{project.description}</p>
          <hr />
          {owner ? (
            <>
              <h3 className="author">{owner.username}</h3>
              <p className="role">{owner.role}</p>
            </>
          ) : (
            <p>Loading user...</p>
          )}
        </Link>

        
      </div>

      
    </>
  );
};

export default ProjectCard0;
