import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import '../assets/style/Projectcard.css';

const ProjectCard0 = ({ project, key, onUpdated }) => {
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
      <div class="card">
        <div class="card-details">
          <p class="text-title">{project.title}</p>
          <p class="text-body">{project.description}</p>
        </div>
        <Link to={`/project/${project._id}`}><button class="card-button">More info</button></Link>
      </div>




    </>
  );
};

export default ProjectCard0;
