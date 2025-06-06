import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ProjectCard from '../components/Projectcard';
import '../assets/style/ownerProjects.css';
import '../assets/style/Header.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserProjectsPage = () => {
    const { user } = useAuthContext();
    const [projects, setProjects] = useState([]);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Redirect if user is a freelancer
    useEffect(() => {
        if (user?.user?.role === 'freelancer') {
            toast.warn('Only clients can access this page');
            navigate('/');
        }
    }, [user, navigate]);

    const fetchUserProjects = async () => {
        try {
            const response = await fetch(`/projects/get/${user.user._id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user projects');
            }
            const json = await response.json();
            setProjects(json);
        } catch (err) {
            console.error('Error fetching user projects:', err);
            setError(err.message);
            toast.error('Failed to load projects');
        }
    };

    const fetchreq = async () => {
        try {
            const response = await fetch(`/requests/${user.user._id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user requests');
            }
            const json = await response.json();
            setRequests(json);
        } catch (err) {
            console.error('Error fetching user requests:', err);
            setError(err.message);
            toast.error('Failed to load requests');
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserProjects();
            fetchreq();
        }
    }, [user]);

    const handleAccept = async (requestId) => {
        toast.info('Processing request...');
        try {
            const response = await fetch(`/requests/accept/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Request accepted successfully');
                fetchreq();
                fetchUserProjects();
            } else {
                toast.error(data.message || 'Failed to accept request');
                console.error('Error:', data.message);
            }
        } catch (error) {
            toast.error('Error accepting request');
            console.error('Error accepting request:', error.message);
        }
    };

    const handleRefuse = async (requestId) => {
        toast.info('Processing request...');
        try {
            const response = await fetch(`/requests/reject/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Request rejected successfully');
                fetchreq();
            } else {
                toast.error(data.message || 'Failed to reject request');
                console.error('Error:', data.message);
            }
        } catch (error) {
            toast.error('Error rejecting request');
            console.error('Error rejecting request:', error.message);
        }
    };

    return (
        <>
            <Header />
            <div className="user-projects-container">
                <div className="projects-section">
                    <div className="projects-header">

                        <Link
                            to="/projectfrom"
                            className="create-project-btn"
                        >
                            {projects.length     > 0 ? '+ Create New Project' : '+ Create Your First Project'}
                        </Link>
                    </div>

                    

                    <div className="projects-grid">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    onUpdated={() => {
                                        fetchUserProjects();
                                        toast.success('Project updated successfully');
                                    }}
                                    onDeleted={() => {
                                        fetchUserProjects();
                                        toast.success('Project deleted successfully');
                                    }}
                                />
                            ))
                        ) : (
                            <div className="no-projects">
                                <p>You have no projects yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="requests-section">
                    <h2 className="section-title">Project Requests</h2>
                    {requests.length > 0 ? (
                        <div className="requests-table-container">
                            <table className="requests-table">
                                <thead>
                                    <tr>
                                        <th className="col-project">Project</th>
                                        <th className="col-freelancer">Freelancer</th>
                                        <th className="col-skills">Skills</th>
                                        <th className="col-email">Email</th>
                                        <th className="col-status">Status</th>
                                        <th className="col-actions">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((req) => (
                                        <tr key={req._id} className="request-row">
                                            <td>
                                                <div className="project-title">{req.projectId.title}</div>
                                            </td>
                                            <td>
                                                <div className="freelancer-info">
                                                    <span className="username">{req.freelancerId.username}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="skills-container">
                                                    <div className="skills-tooltip">
                                                        {req.skills.slice(0, 2).join(', ')}
                                                        {req.skills.length > 2 && (
                                                            <span className="skills-more">+{req.skills.length - 2}</span>
                                                        )}
                                                    </div>
                                                    <div className="skills-full-tooltip">
                                                        {req.skills.join(', ')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <a href={`mailto:${req.freelancerId.email}`} className="email-link">
                                                    {req.freelancerId.email}
                                                </a>
                                            </td>
                                            <td>
                                                <span className={`status-pill status-${req.status.toLowerCase()}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td>
                                                {req.status === 'pending' && (
                                                    <div className="action-buttons">
                                                        <button
                                                            className="action-btn accept-btn"
                                                            onClick={() => handleAccept(req._id)}
                                                            title="Accept request"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            className="action-btn refuse-btn"
                                                            onClick={() => handleRefuse(req._id)}
                                                            title="Reject request"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-requests-message">
                            <div className="empty-state">
                                <svg className="empty-icon" viewBox="0 0 24 24">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                </svg>
                                <h3>No pending requests</h3>
                                <p>You don't have any project requests at this time</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserProjectsPage;