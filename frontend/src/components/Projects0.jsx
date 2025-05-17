import React, { useEffect, useState } from 'react';
import ProjectCard0 from './Projectcard0';
import '../assets/style/Projects.css'
import { Link } from 'react-router-dom';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);

    const fetchProjects = async () => {
        try {
          const response = await fetch('/projects/allProjects');
          if (!response.ok) {
            throw new Error('Failed to fetch projects');
          }
          const json = await response.json();
          setProjects(json);
          console.log(json);
        } catch (err) {
          console.error('Error fetching projects:', err);
          setError(err.message);
        }
      };
    
      useEffect(() => {
        fetchProjects(); 
      }, []);

    return (
        <section className="projects-section0">
            <h1 className='H10'>Projects</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="projects-container0">
                {projects.slice(0, 4).map((projet) => (
                    <ProjectCard0
                    key={projet._id}
                        project={projet}
                        onUpdated={fetchProjects}
                    />
                ))}
            </div>
            <Link to="/allprojects">
    <button className="all-projects-button">
        View All Projects
    </button>
</Link>
        </section>
    );
};

export default Projects;
