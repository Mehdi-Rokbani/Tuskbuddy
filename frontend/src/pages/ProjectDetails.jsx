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

    if (!project || !owner) return <p>Loading...</p>;

    return (
        <>
            <div className='header'>
                <Header />
            </div>
            <div className='container0'>
                <div className="project-details-container">
                    <div className="project-info">
                        <h2>{project.title}</h2>
                        <p><strong>Description:</strong> {project.description}</p>
                        <p><strong>Technologies Used:</strong> {project.techused}</p>
                        <p><strong>Members Needed:</strong> {project.nbmembers}</p>
                        <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
                    </div>
                    <div className="owner-info">
                        <h3>Owner Info</h3>
                        <p><strong>Name:</strong> {owner.username}</p>
                        <p><strong>Email:</strong> {owner.email}</p>
                        <p><strong>Role:</strong> {owner.role}</p>
                    </div>
                </div>

                {(owner._id !== userId && !showJoinForm && project.nbmembers > 0 && !isMember) && (
                    <button className="join-project-button" onClick={handleJoinClick}>
                        Join the Project
                    </button>
                )}

                {showJoinForm && !isMember && (
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
        </>
    );
};

export default ProjectDetails;
