import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/style/TeamTable.css';
import { Link } from 'react-router-dom';
import emptyTeamsImage from '../assets/images/empty-teams.svg';
import {
    FiGithub,
    FiTrash2,
    FiUserX,
    FiPlus,
    FiCheck,
    FiX,
    FiEdit2
} from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';

const TeamTable = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const userId = user?.user?._id;
    const [ownedTeams, setOwnedTeams] = useState([]);
    const [showTaskFormFor, setShowTaskFormFor] = useState(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        startdate: '',
        deadline: ''
    });
    const [memberTasks, setMemberTasks] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [confirmRemove, setConfirmRemove] = useState(null);
    const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [editTaskData, setEditTaskData] = useState({
        title: '',
        description: '',
        startdate: '',
        deadline: ''
    });

    const fetchTeams = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/teams/find/${userId}`);
            if (!res.ok) throw new Error('Failed to fetch teams');
            const data = await res.json();

            const userOwned = data.filter(team => team.ownerId._id === userId);
            setOwnedTeams(userOwned);
            console.log(userOwned)

            const tasksPromises = [];
            userOwned.forEach(team => {
                team.members.forEach(member => {
                    if (member._id !== team.ownerId._id) {
                        tasksPromises.push(fetchMemberTasks(member._id, team.projectId._id, team._id));
                    }
                });
            });

            await Promise.all(tasksPromises);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching teams:', err);
            setIsLoading(false);
            toast.error('Failed to load teams');
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchTeams();
        }
    }, [userId, fetchTeams]);

    const formatSkills = (skills) => {
        if (!skills) return 'N/A';
        if (Array.isArray(skills)) {
            return skills.length > 0 ? skills.join(', ') : 'N/A';
        }
        return skills || 'N/A';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    const fetchMemberTasks = async (memberId, projectId, teamId) => {
        try {
            const res = await fetch(`/tasks/user/${memberId}/project/${projectId}`);
            if (!res.ok) throw new Error('Failed to fetch member tasks');
            const data = await res.json();

            if (data.success && data.data) {
                setMemberTasks(prev => ({
                    ...prev,
                    [`${teamId}-${memberId}-${projectId}`]: data.data.filter(task => !task.isDeleted)
                }));
            } else {
                console.error("Unexpected response format:", data);
                throw new Error('Invalid tasks data format');
            }
        } catch (err) {
            console.error(`Error fetching tasks for member ${memberId}:`, err);
            toast.error(`Failed to load tasks for team member`);
        }
    };

    const deleteTask = async (taskId, memberId, projectId, teamId) => {
        try {
            const res = await fetch(`/tasks/delete/${taskId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete task');

            await fetchMemberTasks(memberId, projectId, teamId);
            setConfirmDeleteTask(null);
            toast.success('Task deleted successfully!');
        } catch (err) {
            console.error('Error deleting task:', err);
            toast.error(`Failed to delete task: ${err.message}`);
        }
    };

    const toggleTaskForm = (memberId) => {
        setShowTaskFormFor(prev => (prev === memberId ? null : memberId));
        setNewTask({
            title: '',
            description: '',
            startdate: '',
            deadline: ''
        });
    };

    const handleTaskSubmit = async (memberId, projectId, teamId) => {
        try {
            if (!newTask.startdate || !newTask.deadline) {
                throw new Error('Start date and deadline are required');
            }

            const res = await fetch('/tasks/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    status: 'pending',
                    startdate: newTask.startdate,
                    deadline: newTask.deadline,
                    assignedTo: memberId,
                    createdBy: userId,
                    projectId: projectId
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to assign task');
            }

            await fetchMemberTasks(memberId, projectId, teamId);
            setShowTaskFormFor(null);
            toast.success('Task assigned successfully!');
        } catch (err) {
            console.error(err);
            toast.error(`Error assigning task: ${err.message}`);
        }
    };

    const updateGithubUrl = async (taskId, githubUrl, memberId, projectId, teamId) => {
        try {
            const res = await fetch(`/tasks/${taskId}/github-url`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUrl })
            });

            if (!res.ok) throw new Error('Failed to update GitHub URL');

            await fetchMemberTasks(memberId, projectId, teamId);
            toast.success('GitHub URL updated successfully!');
        } catch (err) {
            console.error('Error updating GitHub URL:', err);
            toast.error(`Failed to update GitHub URL: ${err.message}`);
        }
    };

    const verifyTask = async (taskId, isApproved, memberId, projectId, teamId) => {
        try {
            const res = await fetch(`/tasks/${taskId}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified: isApproved })
            });

            if (!res.ok) throw new Error('Failed to verify task');

            await fetchMemberTasks(memberId, projectId, teamId);
            toast.success(isApproved ? 'Task approved!' : 'Task rejected');
        } catch (err) {
            console.error('Error verifying task:', err);
            toast.error(`Failed to verify task: ${err.message}`);
        }
    };

    const removeMember = async (teamId, memberId, memberName) => {
        try {
            const res = await fetch(`/teams/remove/${teamId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId })
            });

            if (!res.ok) throw new Error('Failed to remove member');

            setOwnedTeams(prevTeams =>
                prevTeams.map(team =>
                    team._id === teamId
                        ? { ...team, members: team.members.filter(member => member._id !== memberId) }
                        : team
                )
            );
            setConfirmRemove(null);
            toast.success(`${memberName} removed from team`);
        } catch (err) {
            console.error('Error removing member:', err);
            toast.error(`Failed to remove member: ${err.message}`);
        }
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'status-completed';
            case 'in progress': return 'status-in-progress';
            default: return 'status-pending';
        }
    };

    const getVerificationClass = (verified) => {
        if (!verified || verified.status === null) return '';
        return verified.status ? 'verification-approved' : 'verification-rejected';
    };

    if (!user) {
        return <Navigate to="/login" />;
    }
    if (!userId) {
        return <div className="loading-container">Loading user...</div>;
    }
    if (isLoading) {
        return <div className="loading-container">Loading teams and tasks...</div>;
    }

    if (ownedTeams.length === 0) {
        return (
            <>
                <Header />
                <div className="empty-teams-container">
                    <img src={emptyTeamsImage} alt="No teams" className="empty-teams-image" />
                    <h2>You don't have any teams yet</h2>
                    <p>Get started by creating a new project or waiting for freelancers</p>
                    <div className="empty-teams-actions">
                        <button
                            className="primary-btn"
                            onClick={() => navigate('/myproject')}
                        >
                            Create New Project
                        </button>
                        <button
                            className="secondary-btn"
                            onClick={() => navigate('/')}
                        >
                            Browse Projects
                        </button>
                    </div>
                    <p className="empty-teams-help">
                        Need help? <Link to="/">Visit our help center</Link>
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="team-management-container">
                <div className="dashboard-header">
                    <h1>Team Management Dashboard</h1>
                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <h3>Total Teams</h3>
                            <p>{ownedTeams.length}</p>
                        </div>
                        
                        <div className="stat-card">
                            <h3>Active Tasks</h3>
                            <p>{Object.values(memberTasks).flat().length}</p>
                        </div>
                    </div>
                </div>

                {ownedTeams.map(team => (
                    <div key={team._id} className="team-section">
                        <div className="team-header">
                            <div className="team-title-section">
                                <h2>{team.projectId?.title || 'Untitled Project'}</h2>
                                <div className="team-meta">
                                    <span className="team-id">ID: {team._id.slice(-6)}</span>
                                    <span className="team-members">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <Link to={`/projects/${team.projectId?._id}`} className="view-project-btn">
                                View Project
                            </Link>
                        </div>

                        <div className="team-members-container">
                            <div className="member-card owner-card">
                                <div className="member-avatar">
                                    {team.ownerId.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="member-details">
                                    <h3>{team.ownerId.username}</h3>
                                    <p className="member-email">{team.ownerId.email}</p>
                                    <span className="role-badge owner">Owner</span>
                                </div>
                            </div>

                            {team.members.map((member, idx) => {
                                if (member._id === team.ownerId._id) return null;
                                const taskKey = `${team._id}-${member._id}-${team.projectId._id}`;
                                const memberTaskList = memberTasks[taskKey] || [];

                                return (
                                    <div key={member._id} className="member-card">
                                        <div className="member-info">
                                            <div className="member-avatar">
                                                {member.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="member-details">
                                                <h3>{member.username}</h3>
                                                <p className="member-email">{member.email}</p>
                                                <p className="member-skills">{formatSkills(member.skills)}</p>
                                                <span className="role-badge">{member.role || 'Member'}</span>
                                            </div>
                                        </div>

                                        <div className="member-tasks">
                                            {memberTaskList.length > 0 ? (
                                                memberTaskList.map(task => (
                                                    <div key={task._id} className="task-card">
                                                        <div className="task-header">
                                                            <h4>{task.title}</h4>
                                                            <span className={`status-badge ${getStatusClass(task.status)}`}>
                                                                {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
                                                            </span>
                                                        </div>

                                                        <div className="task-dates">
                                                            <span>Start: {formatDate(task.startdate)}</span>
                                                            <span>Deadline: {formatDate(task.deadline)}</span>
                                                        </div>

                                                        {task.description && (
                                                            <p className="task-description">{task.description}</p>
                                                        )}

                                                        <div className="task-footer">
                                                            <div className="github-section">
                                                                {task.githubUrl ? (
                                                                    <a
                                                                        href={task.githubUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="github-link"
                                                                    >
                                                                        <FiGithub /> View on GitHub
                                                                    </a>
                                                                ) : (
                                                                    <span className="no-github">No GitHub link</span>
                                                                )}
                                                            </div>

                                                            <div className={`verification-status ${getVerificationClass(task.verified)}`}>
                                                                {task.status === 'completed' ? (
                                                                    !task.verified || task.verified.status === null ? (
                                                                        <div className="verification-actions">
                                                                            <button
                                                                                className="approve-btn"
                                                                                onClick={() => verifyTask(task._id, true, member._id, team.projectId._id, team._id)}
                                                                                title="Approve"
                                                                            >
                                                                                <FiCheck />
                                                                            </button>
                                                                            <button
                                                                                className="reject-btn"
                                                                                onClick={() => verifyTask(task._id, false, member._id, team.projectId._id, team._id)}
                                                                                title="Reject"
                                                                            >
                                                                                <FiX />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <span>{task.verified.status ? '✓ Approved' : '✕ Rejected'}</span>
                                                                    )
                                                                ) : '—'}
                                                            </div>
                                                        </div>

                                                        <div className="task-actions">
                                                            {confirmDeleteTask === task._id ? (
                                                                <div className="confirmation-dialog">
                                                                    <p>Delete this task?</p>
                                                                    <div>
                                                                        <button
                                                                            className="confirm-btn"
                                                                            onClick={() => deleteTask(task._id, member._id, team.projectId._id, team._id)}
                                                                        >
                                                                            Yes
                                                                        </button>
                                                                        <button
                                                                            className="cancel-btn"
                                                                            onClick={() => setConfirmDeleteTask(null)}
                                                                        >
                                                                            No
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="dropdown-actions">
                                                                    <button className="dropdown-toggle">
                                                                        <BsThreeDotsVertical />
                                                                    </button>
                                                                    <div className="dropdown-menu">
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() => setConfirmDeleteTask(task._id)}
                                                                        >
                                                                            <FiTrash2 /> Delete Task
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-tasks">
                                                    <p>No tasks assigned</p>
                                                    <button
                                                        className="assign-task-btn"
                                                        onClick={() => toggleTaskForm(member._id)}
                                                    >
                                                        <span className="plus-icon"></span> Assign Task
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="member-actions">
                                            {confirmRemove === `${member._id}-${team._id}` ? (
                                                <div className="confirmation-dialog">
                                                    <p>Remove {member.username}?</p>
                                                    <div>
                                                        <button
                                                            className="confirm-btn"
                                                            onClick={() => removeMember(team._id, member._id, member.username)}
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            className="cancel-btn"
                                                            onClick={() => setConfirmRemove(null)}
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    className="remove-member-btn"
                                                    onClick={() => setConfirmRemove(`${member._id}-${team._id}`)}
                                                    title="Remove member"
                                                >
                                                    <FiUserX /> Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {team.members.some(member => showTaskFormFor === member._id && member._id !== team.ownerId._id) && (
                            <div className="task-form-modal">
                                <div className="task-form-container">
                                    <div className="form-header">
                                        <h3>Assign New Task</h3>
                                        <button
                                            className="close-form-btn"
                                            onClick={() => setShowTaskFormFor(null)}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const member = team.members.find(m => m._id === showTaskFormFor);
                                        handleTaskSubmit(member._id, team.projectId._id, team._id);
                                    }}>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Task Title*</label>
                                                <input
                                                    type="text"
                                                    value={newTask.title}
                                                    onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                                    required
                                                    placeholder="Enter task title"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Start Date*</label>
                                                <input
                                                    type="date"
                                                    value={newTask.startdate}
                                                    onChange={e => setNewTask(prev => ({ ...prev, startdate: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Deadline*</label>
                                                <input
                                                    type="date"
                                                    value={newTask.deadline}
                                                    onChange={e => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group full-width">
                                                <label>Description</label>
                                                <textarea
                                                    value={newTask.description}
                                                    onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Task details..."
                                                    rows="3"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="submit-btn">
                                                Assign Task
                                            </button>
                                            <button
                                                type="button"
                                                className="cancel-btn"
                                                onClick={() => setShowTaskFormFor(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default TeamTable;