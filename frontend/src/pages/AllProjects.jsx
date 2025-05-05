import React, { useEffect, useState } from 'react';
import ProjectCard from '../components/Projectcard';
import Header from '../components/Header';
import '../assets/style/Header.css';
import '../assets/style/AllProjects.css';

const AllProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/projects/allProjects');
            const data = await res.json();
            if (res.ok) {
                setProjects(data.projet);
            } else {
                console.error('Failed to fetch projects');
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <>
            <div className="header">
                <Header />
            </div>
            <div className="all-projects-container">
                <h2 className='white'> All Projects</h2>
                {loading ? (
                    <p className='white'>Loading projects...</p>
                ) : projects.length === 0 ? (
                    <p>No projects found.</p>
                ) : (
                    <div className="projects-grid">
                        {projects.map((projet) => (
                           <ProjectCard
                           key={projet._id}
                               project={projet}
                               onUpdated={fetchProjects}
                           />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default AllProjects;
