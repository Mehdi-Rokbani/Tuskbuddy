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
                fetchUserProjects(); // Refresh projects in case team changed
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

    // Add this to ProjectCard's onDelete/onUpdate props
    const showProjectToast = (message, type = 'success') => {
        toast[type](message);
    };

    return (
        <>
            <div className='header'><Header /></div>
            <section className="projects-section">
                <div className="projects-header">
                    <h1 className='H1'>My Projects</h1>
                    <Link 
                        to="/projectfrom" 
                        className="create-project-btn"
                        onClick={() => toast.info('Redirecting to project creation')}
                    >
                        <p>{projects.length > 0 ? '+ Create New Project' : '+ Create Your First Project'}</p>
                    </Link>
                </div>

                {error && (
                    <div className="error-message">
                        {toast.error(error)}
                    </div>
                )}

                <div className="projects-container">
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

                <div className="request-list">
                    <h1 className="request-title">Requests</h1>
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <div key={req._id} className="request-item">
                                <div className="request-info">
                                    <p><strong>Project:</strong> {req.projectId.title}</p>
                                    <p><strong>Skills:</strong> {req.skills}</p>
                                    <p><strong>Username:</strong> {req.freelancerId.username}</p>
                                    <p><strong>Email:</strong> {req.freelancerId.email}</p>
                                    <p><strong>Status:</strong> 
                                        <span className={`status-${req.status.toLowerCase()}`}>
                                            {req.status}
                                        </span>
                                    </p>
                                </div>
                                {req.status === 'pending' && (
                                    <div className="request-actions">
                                        <button 
                                            className="accept-btn" 
                                            onClick={() => handleAccept(req._id)}
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            className="refuse-btn" 
                                            onClick={() => handleRefuse(req._id)}
                                        >
                                            Refuse
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-requests">
                            <p>You have no requests yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default UserProjectsPage;