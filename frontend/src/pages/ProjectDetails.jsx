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
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useContext(AuthContext);
    const userId = user?.user?._id;
    const userRole = user?.user?.role;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [projectRes, ownerRes, membershipRes] = await Promise.all([
                    fetch(`/projects/getProject/${id}`),
                    user?.user?._id && fetch(`/users/Getuser/${user.user._id}`),
                    userId && fetch(`/teams/projects/${userId}`)
                ]);

                const projectData = await projectRes.json();
                if (projectRes.ok) {
                    setProject(projectData);
                    
                    const ownerData = await (await fetch(`/users/Getuser/${projectData.client}`)).json();
                    setOwner(ownerData);

                    if (membershipRes) {
                        const membershipData = await membershipRes.json();
                        setIsMember(membershipData.some(p => p._id === projectData._id));
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
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

    if (isLoading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading project details...</p>
        </div>
    );

    if (!project || !owner) return (
        <div className="error-container">
            <h2>Project Not Found</h2>
            <p>The project you're looking for doesn't exist or may have been removed.</p>
        </div>
    );

    const canJoin = userRole !== 'client' && owner._id !== userId && !isMember && project.nbmembers-project.currentmembers > 0;

    return (
        <>
            <Header />
            <div className="project-details-page">
                <div className="project-details-container">
                    <div className="project-header">
                        <div className="title-section">
                            <h1>{project.title}</h1>
                            <div className="project-meta">
                                <span className={`status-badge ${project.nbmembers > 0 ? 'open' : 'full'}`}>
                                    {project.nbmembers > 0 ? 'Recruiting' : 'Team Full'}
                                </span>
                                <span className="post-date">
                                    Posted on {formatDate(project.createdAt || new Date())}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="project-content">
                        <div className="main-content">
                            <div className="project-card">
                                <h2 className="section-title">Project Details</h2>
                                <div className="project-description">
                                    <p>{project.description}</p>
                                </div>

                                <div className="details-grid">
                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <i className="fas fa-users"></i>
                                        </div>
                                        <div className="detail-content">
                                            <h3>Members Needed</h3>
                                            <p className="highlight">{project.nbmembers-project.currentmembers} position{project.nbmembers !== 1 ? 's' : ''} available</p>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <i className="fas fa-code"></i>
                                        </div>
                                        <div className="detail-content">
                                            <h3>Technologies</h3>
                                            <div className="tech-tags">
                                                {project.techused?.map((tech, index) => (
                                                    <span key={index} className="tech-tag">{tech.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <i className="fas fa-calendar-alt"></i>
                                        </div>
                                        <div className="detail-content">
                                            <h3>Timeline</h3>
                                            <p><strong>Start:</strong> {formatDate(project.startDate)}</p>
                                            <p><strong>Deadline:</strong> {formatDate(project.deadline)}</p>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <i className="fas fa-project-diagram"></i>
                                        </div>
                                        <div className="detail-content">
                                            <h3>Project Status</h3>
                                            <p className={`status-text ${project.status.replace(' ', '-')}`}>
                                                {project.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar">
                            <div className="owner-card">
                                <h2 className="section-title">Project Owner</h2>
                                <div className="owner-profile">
                                    <div className="avatar">
                                        {owner.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="owner-info">
                                        <h3>{owner.username}</h3>
                                        <p className="owner-email">
                                            <i className="fas fa-envelope"></i> {owner.email}
                                        </p>
                                        <p className="owner-role">
                                            <i className="fas fa-user-tag"></i> {owner.role.charAt(0).toUpperCase() + owner.role.slice(1)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {canJoin && !showJoinForm && (
                                <div className="action-card">
                                    <button 
                                        className="join-button"
                                        onClick={handleJoinClick}
                                    >
                                        <i className="fas fa-user-plus"></i> Join Project
                                    </button>
                                    <p className="action-note">
                                        {project.nbmembers} spot{project.nbmembers !== 1 ? 's' : ''} remaining
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showJoinForm && (
                    <div className="modal-overlay">
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button 
                                className="close-button" 
                                onClick={() => setShowJoinForm(false)}
                            >
                                &times;
                            </button>
                            <JoinForm
                                projectId={project._id}
                                userId={userId}
                                ownerId={owner._id}
                                onClose={() => setShowJoinForm(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProjectDetails;