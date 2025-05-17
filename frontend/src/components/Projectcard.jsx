import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { Link } from 'react-router-dom';
import UpdateProjectModal from './UpdateProjectModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/style/Projectcard.css';

const ProjectCard = ({ project, onUpdated }) => {
    const [owner, setOwner] = useState(null);
    const { user } = useAuthContext();
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    useEffect(() => {
        const fetchOwner = async () => {
            try {
                const res = await fetch(`/users/Getuser/${project.client}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to fetch owner details');
                }
                const data = await res.json();
                setOwner(data);
            } catch (err) {
                console.error('Error fetching user:', err);
                toast.error(err.message || 'Failed to fetch owner details');
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
    
            const responseData = await res.json();
    
            if (!res.ok) {
                // Handle specific error cases from backend
                if (responseData.error === "Invalid project ID.") {
                    toast.error('Invalid project ID format');
                } else if (responseData.error.includes("Cannot delete project with active team")) {
                    toast.error(
                        <div>
                            <strong>Cannot delete project</strong>
                            <p>Please delete the associated team first</p>
                        </div>,
                        { autoClose: 5000 }
                    );
                } else if (responseData.error.includes("Cannot delete project with existing tasks")) {
                    toast.error(
                        <div>
                            <strong>Cannot delete project</strong>
                            <p>Please delete all associated tasks first</p>
                        </div>,
                        { autoClose: 5000 }
                    );
                } else if (responseData.error === "Project not found.") {
                    toast.error('Project not found in database');
                } else {
                    // Generic error fallback
                    toast.error(responseData.error || 'Failed to delete project');
                }
                return;
            }
    
            // Success case
            toast.success(
                <div>
                    <strong>Success!</strong>
                    <p>{responseData.message}</p>
                </div>
            );
            
            if (onUpdated) onUpdated();
            
        } catch (error) {
            console.error('Error deleting project:', error);
            // Network errors or other unexpected errors
            toast.error(
                <div>
                    <strong>Operation failed</strong>
                    <p>{error.message || 'Please try again later'}</p>
                </div>,
                { autoClose: false }
            );
        }
    };
    return (
        <>
            <div className="card">
                <div className="card-details">
                    <p className="text-title">{project.title}</p>
                    <p className="text-body">{project.description}</p>

                    {user?.user?._id === project.client && (
                        <div className="card-actions">
                            <button 
                                onClick={() => setShowUpdateModal(true)} 
                                className="update-btn"
                            >
                                Update
                            </button>
                            <button 
                                onClick={handleDelete} 
                                className="delete-btn"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
                <Link to={`/project/${project._id}`}>
                    <button className="card-button">More info</button>
                </Link>
            </div>

            {showUpdateModal && (
                <UpdateProjectModal
                    project={project}
                    onClose={() => setShowUpdateModal(false)}
                    onUpdate={() => {
                        if (onUpdated) onUpdated();
                        toast.success('Project updated successfully!');
                    }}
                />
            )}
        </>
    );
};

export default ProjectCard;