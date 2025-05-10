import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { Link } from 'react-router-dom';
import UpdateProjectModal from './UpdateProjectModal';
import '../assets/style/Projectcard.css';

const ProjectCard = ({ project, onUpdated }) => {
    const [owner, setOwner] = useState(null);
    const { user } = useAuthContext();
    const [showUpdateModal, setShowUpdateModal] = useState(false);

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

    const handleDelete = async () => {
        try {
            const res = await fetch(`/projects/deleteProject/${project._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok) {
                if (onUpdated) {
                    onUpdated(); // Refresh project list
                }
            } else {
                console.error('Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    return (
        <>

            <div class="card">
                <div class="card-details">
                    <p class="text-title">{project.title}</p>
                    <p class="text-body">{project.description}</p>


                    {user?.user?._id === project.client && (
                        <div className="card-actions">
                            <button onClick={() => setShowUpdateModal(true)} className="update-btn">Update</button>
                            <button onClick={handleDelete} className="delete-btn">Delete</button>

                        </div>
                    )}
                </div>
                <Link to={`/project/${project._id}`}><button class="card-button">More info</button></Link>
            </div>

            {showUpdateModal && (
                <UpdateProjectModal
                    project={project}
                    onClose={() => setShowUpdateModal(false)}
                    onUpdate={onUpdated}
                />
            )}




        </>
    );
};

export default ProjectCard;
