import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProjectCard0 from '../components/Projectcard0';
import '../assets/style/ProjectList.css';
import Header from '../components/Header';
import '../assets/style/Header.css'
const MyTeamProjects = () => {
    const { user } = useContext(AuthContext);
    const userId = user?.user?._id;
    const [projects, setProjects] = useState([]);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`/teams/projects/${userId}`);
            if (!res.ok) throw new Error('Failed to fetch team projects');
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (userId) fetchProjects();
    }, [userId]);

    if (!userId) return <p>Loading user...</p>;

    return (
        <>
            <div className='header'>
                <Header></Header>
            </div>
            <div className="project-list-container">
                <h2 className='white'>My Team Projects</h2>
                {projects.length === 0 ? (
                    <p className='white'>No team projects found.</p>
                ) : (
                    <div className="project-grid">
                        {projects.map((projet) => (
                            <ProjectCard0
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

export default MyTeamProjects;
