import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import '../assets/style/TeamTable.css';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TeamTable = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const userId = user?.user?._id;
    const [ownedTeams, setOwnedTeams] = useState([]);
    const [showTaskFormFor, setShowTaskFormFor] = useState(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'pending',
        githubUrl: '',
        startdate: '',
        deadline: ''
    });
    const [memberTasks, setMemberTasks] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [confirmRemove, setConfirmRemove] = useState(null);

    const taskStatusOptions = ['pending', 'in progress', 'completed'];

    const fetchTeams = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/teams/find/${userId}`);
            if (!res.ok) throw new Error('Failed to fetch teams');
            const data = await res.json();

            // Filter for teams owned by the current user
            const userOwned = data.filter(team => team.ownerId._id === userId);
            setOwnedTeams(userOwned);

            // Fetch tasks for each member in each team
            const tasksPromises = [];
            userOwned.forEach(team => {
                team.members.forEach(member => {
                    if (member._id !== team.ownerId._id) {
                        tasksPromises.push(fetchMemberTasks(member._id, team.projectId._id));
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

    // Redirect freelancers
    if (user?.user?.role === 'freelancer') {
        navigate('/');
        return null;
    }

    const formatSkills = (skills) => {
        if (!skills) return 'N/A';
        if (Array.isArray(skills)) {
            return skills.length > 0 ? skills.join(', ') : 'N/A';
        }
        return skills || 'N/A';
    };

    const fetchMemberTasks = async (memberId, projectId) => {
        try {
            const res = await fetch(`/tasks/user/${memberId}/project/${projectId}`);
            if (!res.ok) throw new Error('Failed to fetch member tasks');
            const data = await res.json();

            // Check for data format from the API
            if (data.success && data.data) {
                // Store tasks with the unique key for this member-project pair
                setMemberTasks(prev => ({
                    ...prev,
                    [`${memberId}-${projectId}`]: data.data
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

    const toggleTaskForm = (memberId) => {
        setShowTaskFormFor(prev => (prev === memberId ? null : memberId));
        setNewTask({
            title: '',
            description: '',
            status: 'pending',
            githubUrl: '',
            startdate: '',
            deadline: ''
        });
    };

    const handleTaskSubmit = async (memberId, projectId) => {
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
                    status: newTask.status,
                    githubUrl: newTask.githubUrl,
                    startdate: newTask.startdate,
                    deadline: newTask.deadline,
                    assignedTo: memberId,
                    createdBy: userId,
                    projectId
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to assign task');
            }

            // Refresh tasks after assigning a new one
            await fetchMemberTasks(memberId, projectId);
            setShowTaskFormFor(null);
            toast.success('Task assigned successfully!');
        } catch (err) {
            console.error(err);
            toast.error(`Error assigning task: ${err.message}`);
        }
    };

    const updateGithubUrl = async (taskId, githubUrl, memberId, projectId) => {
        try {
            const res = await fetch(`/tasks/${taskId}/github-url`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUrl })
            });

            if (!res.ok) throw new Error('Failed to update GitHub URL');

            // Refresh tasks after updating
            await fetchMemberTasks(memberId, projectId);
            toast.success('GitHub URL updated successfully!');
        } catch (err) {
            console.error('Error updating GitHub URL:', err);
            toast.error(`Failed to update GitHub URL: ${err.message}`);
        }
    };

    const verifyTask = async (taskId, isApproved, memberId, projectId) => {
        try {
            const res = await fetch(`/tasks/${taskId}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified: isApproved })
            });

            if (!res.ok) throw new Error('Failed to verify task');

            // Refresh tasks after verification
            await fetchMemberTasks(memberId, projectId);
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
        return <div className="no-teams-message">You don't own any teams.</div>;
    }

    return (
        <>
            <div className='header'><Header /></div>

            <div className="user-table-container">
                {ownedTeams.map(team => (
                    <div key={team._id} className="team-section">
                        <h3 className="team-title">{team.projectId?.title || 'Untitled Project'}</h3>
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>User Name</th>
                                    <th>Role</th>
                                    <th>Email</th>
                                    <th>Skills</th>
                                    <th>Current Tasks</th>
                                    <th>Task Status</th>
                                    <th>GitHub URL</th>
                                    <th>Verification</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Owner Row */}
                                <tr className="owner-row">
                                    <td>{team.ownerId.username}</td>
                                    <td>Owner</td>
                                    <td>{team.ownerId.email}</td>
                                    <td>{formatSkills(team.ownerId.skills)}</td>
                                    <td>—</td>
                                    <td>—</td>
                                    <td>—</td>
                                    <td>—</td>
                                    <td>—</td>
                                </tr>

                                {/* Members */}
                                {team.members.map((member, idx) => {
                                    if (member._id === team.ownerId._id) return null;
                                    const taskKey = `${member._id}-${team.projectId._id}`;
                                    const memberTaskList = memberTasks[taskKey] || [];

                                    return (
                                        <React.Fragment key={`${member._id}-${team._id}`}>
                                            {memberTaskList.length > 0 ? (
                                                memberTaskList.map((task, taskIdx) => (
                                                    <tr key={`${team._id}-${task._id}`} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                                                        {taskIdx === 0 && (
                                                            <>
                                                                <td rowSpan={memberTaskList.length}>{member.username}</td>
                                                                <td rowSpan={memberTaskList.length}>{member.role || 'Member'}</td>
                                                                <td rowSpan={memberTaskList.length}>{member.email}</td>
                                                                <td rowSpan={memberTaskList.length}>{formatSkills(member.skills)}</td>
                                                            </>
                                                        )}
                                                        <td>{task.title}</td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusClass(task.status)}`}>
                                                                {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {task.githubUrl ? (
                                                                <a href={task.githubUrl} target="_blank" rel="noopener noreferrer">
                                                                    View Code
                                                                </a>
                                                            ) : 'Not submitted'}
                                                        </td>
                                                        <td className={getVerificationClass(task.verified)}>
                                                            {task.status === 'completed' ? (
                                                                !task.verified || task.verified.status === null ? (
                                                                    <div className="verification-actions">
                                                                        <button onClick={() => verifyTask(task._id, true, member._id, team.projectId._id)}>
                                                                            Approve
                                                                        </button>
                                                                        <button onClick={() => verifyTask(task._id, false, member._id, team.projectId._id)}>
                                                                            Reject
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span>{task.verified.status ? 'Approved' : 'Rejected'}</span>
                                                                )
                                                            ) : 'Not ready'}
                                                        </td>
                                                        {taskIdx === 0 && (
                                                            <td rowSpan={memberTaskList.length}>
                                                                <div className="action-buttons">
                                                                    <button onClick={() => toggleTaskForm(member._id)}>
                                                                        Assign Task
                                                                    </button>
                                                                    {confirmRemove === `${member._id}-${team._id}` ? (
                                                                        <div className="remove-confirmation">
                                                                            <p>Are you sure?</p>
                                                                            <button onClick={() => removeMember(team._id, member._id, member.username)}>
                                                                                Yes
                                                                            </button>
                                                                            <button onClick={() => setConfirmRemove(null)}>
                                                                                No
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button onClick={() => setConfirmRemove(`${member._id}-${team._id}`)}>
                                                                            Remove
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                                                    <td>{member.username}</td>
                                                    <td>{member.role || 'Member'}</td>
                                                    <td>{member.email}</td>
                                                    <td>{formatSkills(member.skills)}</td>
                                                    <td>No tasks assigned</td>
                                                    <td>—</td>
                                                    <td>—</td>
                                                    <td>—</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button onClick={() => toggleTaskForm(member._id)}>
                                                                Assign Task
                                                            </button>
                                                            {confirmRemove === `${member._id}-${team._id}` ? (
                                                                <div className="remove-confirmation">
                                                                    <p>Are you sure?</p>
                                                                    <button onClick={() => removeMember(team._id, member._id, member.username)}>
                                                                        Yes
                                                                    </button>
                                                                    <button onClick={() => setConfirmRemove(null)}>
                                                                        No
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => setConfirmRemove(`${member._id}-${team._id}`)}>
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}

                                            {showTaskFormFor === member._id && (
                                                <tr className="task-form-row">
                                                    <td colSpan="9">
                                                        <form onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handleTaskSubmit(member._id, team.projectId._id);
                                                        }}>
                                                            <div className="form-group">
                                                                <label>Task Title*</label>
                                                                <input
                                                                    type="text"
                                                                    value={newTask.title}
                                                                    onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Description</label>
                                                                <textarea
                                                                    value={newTask.description}
                                                                    onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Status</label>
                                                                <select
                                                                    value={newTask.status}
                                                                    onChange={e => setNewTask(prev => ({ ...prev, status: e.target.value }))}
                                                                >
                                                                    {taskStatusOptions.map(option => (
                                                                        <option key={option} value={option}>
                                                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                                                        </option>
                                                                    ))}
                                                                </select>
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
                                                            <div className="form-group">
                                                                <label>GitHub URL</label>
                                                                <input
                                                                    type="url"
                                                                    value={newTask.githubUrl}
                                                                    onChange={e => setNewTask(prev => ({ ...prev, githubUrl: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="form-actions">
                                                                <button type="submit">Assign Task</button>
                                                                <button type="button" onClick={() => setShowTaskFormFor(null)}>
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </>
    );
};

export default TeamTable;