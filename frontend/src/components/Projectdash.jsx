import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../assets/style/Projectdash.css';

const ProjectsList = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [teams, setTeams] = useState([]);
    const [teamsLoading, setTeamsLoading] = useState(false);
    const [teamsError, setTeamsError] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberTasks, setMemberTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksError, setTasksError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                if (!user?.user?._id) return;

                const response = await fetch(`/projects/get/${user.user._id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data = await response.json();
                setProjects(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user]);

    const handleProjectClick = async (projectId) => {
        setSelectedProject(projectId);
        setSelectedMember(null);
        setMemberTasks([]);
        setTeamsLoading(true);
        setTeamsError(null);

        try {
            const response = await fetch(`/teams/findt/${projectId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch teams');
            }
            const data = await response.json();
            setTeams(Array.isArray(data) ? data : []);
        } catch (err) {
            setTeamsError(err.message);
        } finally {
            setTeamsLoading(false);
        }
    };

    const handleMemberClick = async (memberId) => {
        if (!selectedProject) return;

        setSelectedMember(memberId);
        setTasksLoading(true);
        setTasksError(null);

        try {
            const response = await fetch(`/tasks/user/${memberId}/project/${selectedProject}`);
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const data = await response.json();
            setMemberTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            setTasksError(err.message);
            setMemberTasks([]);
        } finally {
            setTasksLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getProjectProgress = (startDate, deadline) => {
        if (!startDate || !deadline) return 0;

        const start = new Date(startDate).getTime();
        const end = new Date(deadline).getTime();
        const now = Date.now();

        if (now >= end) return 100;
        if (now <= start) return 0;

        return Math.round(((now - start) / (end - start)) * 100);
    };

    if (loading) {
        return <div className="loading">Loading projects...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="projects-container">
            <h2>My Projects</h2>
            {projects.length === 0 ? (
                <p className="no-projects">You don't have any projects yet.</p>
            ) : (
                <div className="dashboard-layout">
                    <div className="projects-grid">
                        {projects.map((project) => (
                            <div
                                key={project._id}
                                className={`project-card ${selectedProject === project._id ? 'selected' : ''}`}
                                onClick={() => handleProjectClick(project._id)}
                            >
                                <div className="project-card-header">
                                    <h3>{project.title}</h3>
                                    <span className={`project-status ${project.status}`}>
                                        {project.status}
                                    </span>
                                </div>
                                <p className="project-description">{project.description}</p>

                                <div className="tech-used">
                                    {project.techused?.map((tech, index) => (
                                        <span key={index} className="tech-tag">{tech}</span>
                                    ))}
                                </div>

                                <div className="project-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${getProjectProgress(project.startDate, project.deadline)}%` }}
                                        ></div>
                                    </div>
                                    <span>{getProjectProgress(project.startDate, project.deadline)}%</span>
                                </div>

                                <div className="project-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">Team:</span>
                                        <span>{project.team ? "Assigned" : "Not assigned"}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">Members:</span>
                                        <span>{project.currentmembers}/{project.nbmembers}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">Deadline:</span>
                                        <span>{formatDate(project.deadline)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedProject && (
                        <div className="team-members-section">
                            <h3>Team Members</h3>
                            {teamsLoading ? (
                                <div className="loading">Loading team members...</div>
                            ) : teamsError ? (
                                <div className="error">Error: {teamsError}</div>
                            ) : teams.length === 0 ? (
                                <p className="no-teams">No teams found for this project.</p>
                            ) : (
                                teams.map((team) => (
                                    <div key={team._id} className="team-container">
                                        <div className="team-header">
                                            <h4>Team Owner: {team.ownerId?.username || 'Unknown'}</h4>
                                        </div>
                                        <div className="members-list">
                                            <h5>Members ({team.members?.length || 0}):</h5>
                                            {team.members?.length === 0 ? (
                                                <p>No members in this team</p>
                                            ) : (
                                                <ul>
                                                    {team.members?.map((member) => (
                                                        <li
                                                            key={member._id}
                                                            className={`member-item ${selectedMember === member._id ? 'selected' : ''}`}
                                                            onClick={() => handleMemberClick(member._id)}
                                                        >
                                                            <div className="member-info">
                                                                <span className="member-name">{member.username}</span>
                                                                <span className="member-role">{member.role}</span>
                                                                {member.role === 'freelancer' && member.skills?.length > 0 && (
                                                                    <div className="member-skills">
                                                                        <span>Skills: </span>
                                                                        {member.skills.join(', ')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {selectedMember && (
                        <div className="member-tasks-section">
                            <h3>Assigned Tasks</h3>
                            {tasksLoading ? (
                                <div className="loading">Loading tasks...</div>
                            ) : tasksError ? (
                                <div className="error">Error: {tasksError}</div>
                            ) : memberTasks.length === 0 ? (
                                <p className="no-tasks">No tasks assigned to this member.</p>
                            ) : (
                                <div className="tasks-list">
                                    {memberTasks.map((task) => (
                                        <div key={task._id} className="task-item">
                                            <div className="task-header">
                                                <h4 className="task-title">{task.title}</h4>
                                                <span className={`task-status ${task.status.replace(' ', '-')}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <p className="task-description">{task.description || 'No description'}</p>

                                            {task.githubUrl && (
                                                <div className="task-github">
                                                    <a href={task.githubUrl} target="_blank" rel="noopener noreferrer">
                                                        View on GitHub
                                                    </a>
                                                </div>
                                            )}

                                            <div className="task-dates">
                                                <div className="date-item">
                                                    <span className="date-label">Start:</span>
                                                    <span>{formatDate(task.startdate)}</span>
                                                </div>
                                                <div className="date-item">
                                                    <span className="date-label">Deadline:</span>
                                                    <span>{formatDate(task.deadline)}</span>
                                                </div>
                                            </div>

                                            {task.verified?.status !== null && (
                                                <div className={`task-verification ${task.verified.status ? 'verified' : 'rejected'}`}>
                                                    {task.verified.status ? '✓ Verified' : '✗ Rejected'}
                                                    {task.verified.verifiedAt && (
                                                        <span> on {formatDate(task.verified.verifiedAt)}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectsList;