import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ProjectCard from '../components/Projectcard';
import '../assets/style/ownerProjects.css';
import '../assets/style/Header.css'
import { useNavigate } from 'react-router-dom';

const UserProjectsPage = () => {
    const { user } = useAuthContext();
    const [projects, setProjects] = useState([]);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const navigate=useNavigate()
    if(user?.user?.role==='freelancer'){
navigate('/')
    }
    const fetchUserProjects = async () => {
        try {
          const response = await fetch(`/projects/get/${user.user._id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user projects');
          }
          const json = await response.json();
          setProjects(json);
          console.log(json);
        } catch (err) {
          console.error('Error fetching user projects:', err);
          setError(err.message);
        }
      };
    
      useEffect(() => {
        if (user) {
          fetchUserProjects();
        }
      }, [user]);

    const fetchreq = async () => {
        try {
            const response = await fetch(`/requests/${user.user._id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user requests');
            }
            const json = await response.json();
            setRequests(json);
            console.log('req :', json);
        } catch (err) {
            console.error('Error fetching user requests:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        if (user) {
            fetchreq();
        }
    }, [user]);


    const handleAccept = async (requestId) => {

        try {
            const response = await fetch(`/requests/accept/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);

                fetchreq();
            } else {
                console.error('Error:', data.message);
            }
        } catch (error) {
            console.error('Error accepting request:', error.message);
        }
    };

    const handleRefuse = async (requestId) => {
        console.log("Refused request:", requestId);

    };

    return (
        <>
            <div className='header'><Header /></div>
            <section className="projects-section">
                <div className="projects-header">
                    <h1 className='H1'>My Projects</h1>
                    {projects.length>0 ?(
                    <Link to="/projectfrom" className="create-project-btn">
                        <p>+ Create New Project</p>
                    </Link>):
                    (<Link to="/projectfrom" className="create-project-btn">
                        <p>+ Create Your First Project</p>
                    </Link>)}
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div className="projects-container">
                    {projects.length > 0 && (
                        projects.map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                onUpdated={fetchUserProjects}
                            />
                        ))
                    )}
                
                </div>
                <ul className="request-list">
                    <h1 className="request-title">Requests</h1>
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <li key={req._id} className="request-item">
                                <div className="request-info">
                                    
                                    <p><strong>Skills:</strong> {req.skills}</p>
                                    <p><strong>Email:</strong> {req.userId.email}</p>
                                    <p><strong>Status:</strong> {req.status}</p>
                                </div>
                                <div className="request-actions">
                                    <button className="accept-btn" onClick={() => handleAccept(req._id)}>Accept</button>
                                    <button className="refuse-btn" onClick={() => handleRefuse(req._id)}>Refuse</button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <div className="no-requests">
                            <p>You have no requests yet.</p>
                        </div>
                    )}
                </ul>


            </section>


        </>
    );
};

export default UserProjectsPage;
