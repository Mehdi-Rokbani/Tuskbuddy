import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../assets/style/freelancerreq.css';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const FreelancerRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Custom confirmation toast
    const confirmAction = (message, onConfirm) => {
        toast.dismiss(); // Dismiss any existing toasts
        toast.info(
            <div>
                <p>{message}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        className="toast-confirm-btn"
                        onClick={() => {
                            toast.dismiss();
                            onConfirm();
                        }}
                    >
                        Confirm
                    </button>
                    <button
                        className="toast-cancel-btn"
                        onClick={() => toast.dismiss()}
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeButton: false,
                position: 'top-center',
                className: 'confirmation-toast'
            }
        );
    };


    useEffect(() => {
        if (user?.user?.role === 'client') {
            toast.warning('Clients cannot access freelancer requests');
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user?.user?._id) return;

            try {
                setIsLoading(true);
                const response = await fetch(`/requests/freelancer/${user.user._id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                }

                const data = await response.json();
                setRequests(data);

            } catch (err) {
                setError(err.message);
                console.error('Error fetching requests:', err);

            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [user]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return 'status-pending';
            case 'accepted':
                return 'status-accepted';
            case 'rejected':
                return 'status-rejected';
            default:
                return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const deleteRequest = async (requestId) => {
        confirmAction('Are you sure you want to delete this request?', async () => {
            try {
                const response = await fetch(`/requests/${requestId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete request');
                }

                setRequests(requests.filter(request => request._id !== requestId));
                toast.success('Request deleted successfully');
            } catch (err) {
                setError(err.message);
                console.error('Error deleting request:', err);
                toast.error(`Failed to delete request: ${err.message}`);
            }
        });
    };

    const getProjectData = (request, field) => {
        if (request.projectId && typeof request.projectId === 'object' && request.projectId[field] !== undefined) {
            return request.projectId[field];
        }
        return 'N/A';
    };

    const getOwnerData = (request, field) => {
        if (request.projectOwnerId && typeof request.projectOwnerId === 'object' && request.projectOwnerId[field] !== undefined) {
            return request.projectOwnerId[field];
        }
        return 'N/A';
    };

    if (isLoading) {
        return (
            <div className="requests-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="requests-container">
                <div className="error-message">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button
                        className="retry-btn"
                        onClick={() => {
                            setError(null);
                            setIsLoading(true);
                            window.location.reload();
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='header'><Header /></div>
            <div className="requests-container">
                <h1>My Project Requests</h1>

                {requests.length === 0 ? (
                    <div className="no-requests">
                        <p>You haven't made any requests to join projects yet.</p>
                    </div>
                ) : (
                    <div className="requests-list">
                        {requests.map((request) => (
                            <div className="request-card" key={request._id}>
                                <div className="request-header">
                                    <h3>{getProjectData(request, 'title')}</h3>
                                    <span className={`status-badge ${getStatusClass(request.status)}`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </div>

                                <div className="request-details">
                                    <div className="request-info">
                                        <p><strong>Project:</strong> {getProjectData(request, 'title')}</p>
                                        <p><strong>Description:</strong> {getProjectData(request, 'description')}</p>
                                        <p><strong>Project Owner:</strong> {getOwnerData(request, 'username')}</p>
                                        <p><strong>Owner Email:</strong> {getOwnerData(request, 'email')}</p>
                                        <p><strong>Skills:</strong> {request.skills}</p>
                                        <p><strong>Applied on:</strong> {formatDate(request.createdAt)}</p>
                                        {request.updatedAt !== request.createdAt && (
                                            <p><strong>Last Updated:</strong> {formatDate(request.updatedAt)}</p>
                                        )}
                                    </div>

                                    <div className="request-about">
                                        <h4>Your Application:</h4>
                                        <p>{request.about}</p>
                                    </div>
                                </div>

                                <div className="request-actions">
                                    {request.status === 'pending' && (
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteRequest(request._id)}
                                        >
                                            Cancel Request
                                        </button>
                                    )}

                                    {request.status === 'accepted' && (
                                        <a
                                            href={`/project/${request.projectId._id || request.projectId}`}
                                            className="view-project-btn"
                                        >
                                            View Project
                                        </a>
                                    )}

                                    {request.status === 'rejected' && (
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteRequest(request._id)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default FreelancerRequests;