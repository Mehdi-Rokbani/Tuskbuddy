import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import UpdateProjectModal from './UpdateProjectModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/style/Projectcard.css';

const ProjectCard = ({ project, onUpdated }) => {
    const [owner, setOwner] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const { user } = useAuthContext();

    useEffect(() => {
        const fetchOwner = async () => {
            try {
                const res = await fetch(`/users/Getuser/${project.client}`);
                const data = await res.json();
                setOwner(data);
            } catch (err) {
                console.error('Error fetching user:', err);
                toast.error('Error fetching project owner');
            }
        };

        if (project.client) {
            fetchOwner();
        }
    }, [project.client]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/projects/deleteProject/${project._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            const responseData = await res.json();

            if (!res.ok) {
                if (responseData.error.includes("Cannot delete project with active team")) {
                    toast.error(<><strong>Cannot delete project</strong><p>Please delete the associated team first</p></>, { autoClose: 5000 });
                } else if (responseData.error.includes("Cannot delete project with existing tasks")) {
                    toast.error(<><strong>Cannot delete project</strong><p>Please delete all associated tasks first</p></>, { autoClose: 5000 });
                } else {
                    toast.error(responseData.error || 'Failed to delete project');
                }
                return;
            }

            toast.success(<><strong>Success!</strong><p>{responseData.message}</p></>);
            if (onUpdated) onUpdated();
        } catch (err) {
            toast.error(<><strong>Operation failed</strong><p>{err.message || 'Please try again later'}</p></>, { autoClose: false });
        }
    };

    return (
        <>
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
                            {project.createdAt && formatDate(project.createdAt)}
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
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </Link>

                    {user?.user?._id === project.client && (
                        <div className="project-actions">
                            <button
                                className="update-btn"
                                onClick={() => setShowUpdateModal(true)}
                            >
                                Update
                            </button>
                            <button
                                className="delete-btn"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
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
