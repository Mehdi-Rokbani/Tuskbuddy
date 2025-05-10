// TeamTable.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import '../assets/style/TeamTable.css';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
const TeamTable = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const userId = user?.user?._id;
    if (user?.user?.role === 'freelancer') { navigate('/teams') }
    const [ownedTeams, setOwnedTeams] = useState([]);
    const [showTaskFormFor, setShowTaskFormFor] = useState(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'pending',
        githubUrl: '' // Initialize with empty GitHub URL
    });
    const [memberTasks, setMemberTasks] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Status options for tasks - matching your backend options
    const taskStatusOptions = ['pending', 'in progress', 'completed'];

    // fetchTeams wrapped in useCallback so it's stable across renders
    const fetchTeams = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/teams/find/${userId}`);
            if (!res.ok) throw new Error('Failed to fetch teams');
            const data = await res.json();

            // only teams where current user is owner
            const userOwned = data.filter(team => team.ownerId._id === userId);
            setOwnedTeams(userOwned);

            // Fetch tasks for each team member
            const tasksPromises = [];
            userOwned.forEach(team => {
                team.members.forEach(member => {
                    if (member._id !== team.ownerId._id) {
                        tasksPromises.push(fetchMemberTasks(member._id));
                    }
                });
            });

            await Promise.all(tasksPromises);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    }, [userId]);

    // Fetch tasks for a specific member - updated to match your controller
    const fetchMemberTasks = async (memberId) => {
        try {
            const res = await fetch(`/tasks/user/${memberId}`);
            if (!res.ok) throw new Error('Failed to fetch member tasks');
            const data = await res.json();

            // Check data structure and store tasks in state
            if (data.success && Array.isArray(data.data)) {
                setMemberTasks(prev => ({
                    ...prev,
                    [memberId]: data.data
                }));
                return data.data;
            } else {
                console.error("Unexpected response format:", data);
                return [];
            }
        } catch (err) {
            console.error(`Error fetching tasks for member ${memberId}:`, err);
            return [];
        }
    };

    // now safe to put fetchTeams in dependencies
    useEffect(() => {
        if (userId) {
            fetchTeams();
        }
    }, [userId, fetchTeams]);

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

    const toggleTaskForm = (memberId) => {
        setShowTaskFormFor(prev => (prev === memberId ? null : memberId));
        setNewTask({ title: '', description: '', status: 'pending', githubUrl: '' });
    };

    const handleTaskSubmit = async (memberId, projectId) => {
        try {
            // Using the correct endpoint from your controller
            const res = await fetch('/tasks/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    status: newTask.status,
                    assignedTo: memberId,
                    createdBy: userId,
                    projectId,
                    githubUrl: newTask.githubUrl // Add GitHub URL to task creation
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to assign task');
            }

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || 'Failed to assign task');
            }

            // Refresh tasks for this member to ensure we have the latest data
            await fetchMemberTasks(memberId);
            setShowTaskFormFor(null);

            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'success-notification';
            notification.textContent = 'Task assigned successfully!';
            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);

        } catch (err) {
            console.error(err);
            alert(`Error assigning task: ${err.message}`);
        }
    };

    // New function to update GitHub URL
    const updateGithubUrl = async (taskId, githubUrl, memberId) => {
        try {
            const res = await fetch(`/tasks/${taskId}/github-url`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUrl })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update GitHub URL');
            }

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || 'Failed to update GitHub URL');
            }

            // Update local state with the updated task
            setMemberTasks(prev => ({
                ...prev,
                [memberId]: prev[memberId].map(task =>
                    task._id === taskId ? { ...task, githubUrl } : task
                )
            }));

            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'success-notification';
            notification.textContent = 'GitHub URL updated successfully!';
            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);

        } catch (err) {
            console.error('Error updating GitHub URL:', err);
            alert(`Failed to update GitHub URL: ${err.message}`);
        }
    };

    // New function to verify task
    const verifyTask = async (taskId, isApproved, memberId) => {
        try {
            const res = await fetch(`/tasks/${taskId}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified: isApproved })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to verify task');
            }

            const response = await res.json();

            if (!response.success) {
                throw new Error(response.message || 'Failed to verify task');
            }

            // Update local state with the updated task
            setMemberTasks(prev => ({
                ...prev,
                [memberId]: prev[memberId].map(task =>
                    task._id === taskId ? {
                        ...task,
                        verified: {
                            status: isApproved,
                            verifiedAt: new Date()
                        }
                    } : task
                )
            }));

            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'success-notification';
            notification.textContent = isApproved ? 'Task approved successfully!' : 'Task rejected!';
            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);

        } catch (err) {
            console.error('Error verifying task:', err);
            alert(`Failed to verify task: ${err.message}`);
        }
    };

    // Get status class for styling
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'status-completed';
            case 'in progress':
                return 'status-in-progress';
            case 'pending':
            default:
                return 'status-pending';
        }
    };

    // Get verification status class
    const getVerificationClass = (verified) => {
        if (!verified || verified.status === null) return '';
        return verified.status ? 'verification-approved' : 'verification-rejected';
    };

    return (
        <>
            <div className='header'> <Header /></div>

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
                                {/* Owner */}
                                <tr className="owner-row">
                                    <td className="username-cell">{team.ownerId.username}</td>
                                    <td>Owner</td>
                                    <td>{team.ownerId.email}</td>
                                    <td>{team.ownerId.skills || 'N/A'}</td>
                                    <td>—</td>
                                    <td>—</td>
                                    <td>—</td>
                                    <td>—</td>
                                    <td>—</td>
                                </tr>

                                {/* Members */}
                                {team.members.map((member, idx) => {
                                    if (member._id === team.ownerId._id) return null;
                                    const memberTaskList = memberTasks[member._id] || [];

                                    return (
                                        <React.Fragment key={member._id}>
                                            {memberTaskList.length > 0 ? (
                                                // If member has tasks, render a row for each task
                                                memberTaskList.map((task, taskIdx) => (
                                                    <tr key={task._id} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                                                        {/* Only show member details in the first task row */}
                                                        {taskIdx === 0 ? (
                                                            <>
                                                                <td className="username-cell" rowSpan={memberTaskList.length}>
                                                                    {member.username}
                                                                </td>
                                                                <td rowSpan={memberTaskList.length}>{member.role || 'Member'}</td>
                                                                <td rowSpan={memberTaskList.length}>{member.email}</td>
                                                                <td rowSpan={memberTaskList.length}>{member.skills || 'N/A'}</td>
                                                            </>
                                                        ) : null}
                                                        <td className="task-title-cell">{task.title}</td>
                                                        <td className="task-status-cell">
                                                            <div className="task-status-display">
                                                                <span className={`status-badge ${getStatusClass(task.status)}`}>
                                                                    {task.status?.charAt(0).toUpperCase() + task.status?.slice(1) || 'pending'}
                                                                </span>
                                                                {/* Owner should NOT update status anymore */}
                                                            </div>
                                                        </td>
                                                        <td className="github-url-cell">
                                                            {task.githubUrl ? (
                                                                <a
                                                                    href={task.githubUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="github-link"
                                                                >
                                                                    View Code
                                                                </a>
                                                            ) : (
                                                                <span className="no-github">Not submitted</span>
                                                            )}
                                                        </td>
                                                        <td className={`verification-cell ${getVerificationClass(task.verified)}`}>
                                                            {task.status === 'completed' ? (
                                                                <>
                                                                    {!task.verified || task.verified.status === null ? (
                                                                        <div className="verification-actions">
                                                                            <button
                                                                                className="verify-approve-btn"
                                                                                onClick={() => verifyTask(task._id, true, member._id)}
                                                                            >
                                                                                Approve
                                                                            </button>
                                                                            <button
                                                                                className="verify-reject-btn"
                                                                                onClick={() => verifyTask(task._id, false, member._id)}
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className={`verification-status ${task.verified.status ? 'verified-approved' : 'verified-rejected'}`}>
                                                                            {task.verified.status ? 'Approved' : 'Rejected'}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="not-ready">Not ready</span>
                                                            )}
                                                        </td>
                                                        {/* Show assign task button only in the first row */}
                                                        {taskIdx === 0 ? (
                                                            <td rowSpan={memberTaskList.length}>
                                                                <button
                                                                    className="assign-btn"
                                                                    onClick={() => toggleTaskForm(member._id)}
                                                                >
                                                                    Assign Task
                                                                </button>
                                                            </td>
                                                        ) : null}
                                                    </tr>
                                                ))
                                            ) : (
                                                // If member has no tasks, render a single row
                                                <tr className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                                                    <td className="username-cell">{member.username}</td>
                                                    <td>{member.role || 'Member'}</td>
                                                    <td>{member.email}</td>
                                                    <td>{member.skills || 'N/A'}</td>
                                                    <td className="tasks-cell">
                                                        <span className="no-tasks">No tasks assigned</span>
                                                    </td>
                                                    <td>—</td>
                                                    <td>—</td>
                                                    <td>—</td>
                                                    <td>
                                                        <button
                                                            className="assign-btn"
                                                            onClick={() => toggleTaskForm(member._id)}
                                                        >
                                                            Assign Task
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}

                                            {showTaskFormFor === member._id && (
                                                <tr className="task-form-row">
                                                    <td colSpan="9">
                                                        <form
                                                            className="task-form"
                                                            onSubmit={e => {
                                                                e.preventDefault();
                                                                handleTaskSubmit(member._id, team.projectId._id);
                                                            }}
                                                        >
                                                            <div className="form-group">
                                                                <label>Task Title:</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Task title"
                                                                    value={newTask.title}
                                                                    onChange={e =>
                                                                        setNewTask(prev => ({ ...prev, title: e.target.value }))
                                                                    }
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="form-group">
                                                                <label>Description:</label>
                                                                <textarea
                                                                    placeholder="Description"
                                                                    value={newTask.description}
                                                                    onChange={e =>
                                                                        setNewTask(prev => ({ ...prev, description: e.target.value }))
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="form-group">
                                                                <label>Initial Status:</label>
                                                                <select
                                                                    value={newTask.status}
                                                                    onChange={e =>
                                                                        setNewTask(prev => ({ ...prev, status: e.target.value }))
                                                                    }
                                                                >
                                                                    {taskStatusOptions.map(option => (
                                                                        <option key={option} value={option}>
                                                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div className="form-group">
                                                                <label>GitHub URL (Optional):</label>
                                                                <input
                                                                    type="url"
                                                                    placeholder="GitHub repository URL"
                                                                    value={newTask.githubUrl}
                                                                    onChange={e =>
                                                                        setNewTask(prev => ({ ...prev, githubUrl: e.target.value }))
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="form-actions">
                                                                <button type="submit" className="submit-btn">Assign Task</button>
                                                                <button
                                                                    type="button"
                                                                    className="cancel-btn"
                                                                    onClick={() => setShowTaskFormFor(null)}
                                                                >
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