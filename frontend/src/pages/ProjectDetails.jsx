import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import JoinForm from '../components/JoinForm';
import '../assets/style/ProjectDetails.css';
import Header from '../components/Header';
import '../assets/style/Header.css';
import { AuthContext } from '../context/AuthContext';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [owner, setOwner] = useState(null);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [isMember, setIsMember] = useState(false);

    const { user } = useContext(AuthContext);
    const userId = user?.user?._id;
    const userRole = user?.user?.role;

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`/projects/getProject/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setProject(data);
                    fetchOwner(data.client);
                    checkMembership(data._id, userId);
                }
            } catch (err) {
                console.error('Error fetching project:', err);
            }
        };

        const fetchOwner = async (ownerId) => {
            try {
                const response = await fetch(`/users/Getuser/${ownerId}`);
                const data = await response.json();
                if (response.ok) {
                    setOwner(data);
                }
            } catch (err) {
                console.error('Error fetching owner:', err);
            }
        };

        const checkMembership = async (projectId, userId) => {
            try {
                const res = await fetch(`/teams/projects/${userId}`);
                const data = await res.json();
                const isInProject = data.some(p => p._id === projectId);
                setIsMember(isInProject);
            } catch (err) {
                console.error('Error checking membership:', err);
            }
        };

        if (userId) {
            fetchProject();
        }
    }, [id, userId]);

    const handleJoinClick = () => {
        setShowJoinForm(true);
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    if (!project || !owner) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading project details...</p>
        </div>
    );

    // Check if user can join (not a client, not the owner, not already a member, and there are spots available)
    const canJoin = userRole !== 'client' && owner._id !== userId && !isMember && project.nbmembers > 0;

    return (
        <>
            <div className='header'>
                <Header />
            </div>
            <div className='project-details-page'>
                <div className="project-details-container">
                    <div className="project-header">
                        <h1>{project.title}</h1>
                        <div className="project-status">
                            <span className={`status-badge ${project.nbmembers > 0 ? 'open' : 'full'}`}>
                                {project.nbmembers > 0 ? 'Recruiting' : 'Team Full'}
                            </span>
                        </div>
                    </div>

                    <div className="project-content">
                        <div className="project-info">
                            <div className="info-card">
                                <h2>Project Details</h2>
                                <div className="info-item">
                                    <span className="label">Description</span>
                                    <p className="value">{project.description}</p>
                                </div>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Technologies</span>
                                        <div className="tech-tags">
                                            {project?.techused?.map((tech, index) => (
                                                <span key={index} className="tech-tag">{tech.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Members Needed</span>
                                        <span className="value highlight">{project.nbmembers}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Deadline</span>
                                        <span className="value">{formatDate(project.deadline)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="owner-info">
                            <div className="info-card">
                                <h2>Project Owner</h2>
                                <div className="owner-profile">
                                    <div className="avatar">
                                        {owner.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="owner-details">
                                        <h3>{owner.username}</h3>
                                        <p><i className="far fa-envelope"></i> {owner.email}</p>
                                        <p><i className="fas fa-user-tag"></i> {owner.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {canJoin && !showJoinForm && (
                        <div className="action-container">
                            <button className="join-project-button" onClick={handleJoinClick}>
                                Join the Project
                            </button>
                        </div>
                    )}

                    {showJoinForm && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <button className="close-button" onClick={() => setShowJoinForm(false)}>×</button>
                                <JoinForm
                                    projectId={project._id}
                                    userId={userId}
                                    ownerId={owner._id}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProjectDetails;