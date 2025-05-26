import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/style/FreelancerTasks.css';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const FreelancerTasks = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  if (user?.user?.role === 'client') {
    navigate('/')
  }
  const userId = user?.user?._id;

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [githubUrls, setGithubUrls] = useState({});

  // Fetch tasks assigned to the freelancer
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/tasks/user/${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();

        if (data.success) {
          // Filter out deleted tasks
          const activeTasks = data.data.filter(task => !task.isDeleted);
          setTasks(activeTasks);

          // Initialize githubUrls state with existing values
          const initialUrls = {};
          activeTasks.forEach(task => {
            initialUrls[task._id] = task.githubUrl || '';
          });
          setGithubUrls(initialUrls);
        } else {
          throw new Error(data.message || 'Failed to fetch tasks');
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  // Handle input change for GitHub URL
  const handleGithubUrlChange = (taskId, value) => {
    const task = tasks.find(t => t._id === taskId);
    // Only allow changes if task hasn't been verified
    if (!task.verified || task.verified.status === null) {
      setGithubUrls(prev => ({
        ...prev,
        [taskId]: value
      }));
    }
  };

  // Submit GitHub URL
  const submitGithubUrl = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    // Don't allow submission if task has been verified
    if (task.verified && task.verified.status !== null) {
      toast.warning('Cannot update GitHub URL for verified tasks', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      return;
    }

    try {
      const response = await fetch(`/tasks/${taskId}/github-url`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ githubUrl: githubUrls[taskId] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update GitHub URL');
      }

      const data = await response.json();

      if (data.success) {
        // Update local state to reflect the change
        setTasks(prev => prev.map(task =>
          task._id === taskId ? { ...task, githubUrl: githubUrls[taskId] } : task
        ));

        // Show success toast notification
        toast.success('GitHub URL submitted successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } else {
        throw new Error(data.message || 'Failed to update GitHub URL');
      }
    } catch (err) {
      console.error('Error submitting GitHub URL:', err);
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    const task = tasks.find(t => t._id === taskId);
    // Don't allow status changes if task has been verified
    if (task.verified && task.verified.status !== null) {
      toast.warning('Cannot update status for verified tasks', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      return;
    }

    try {
      const response = await fetch(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task status');
      }

      const data = await response.json();

      if (data.success) {
        // Update local state to reflect the change
        setTasks(prev => prev.map(task =>
          task._id === taskId ? { ...task, status: newStatus } : task
        ));

        // Show success toast notification
        toast.success('Task status updated!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } else {
        throw new Error(data.message || 'Failed to update task status');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  };

  // Get task status class
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

  // Get verification status badge
  const getVerificationBadge = (verified) => {
    if (!verified || verified.status === null) {
      return <span className="verification-pending">Pending Verification</span>;
    }

    return verified.status ?
      <span className="verification-approved">Approved</span> :
      <span className="verification-rejected">Rejected</span>;
  };

  // Check if task is editable (not verified)
  const isTaskEditable = (task) => {
    return !task.verified || task.verified.status === null;
  };

  // Render empty state component
  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="empty-state-title">No Tasks Assigned Yet</h2>
      <p className="empty-state-description">
        You don't have any tasks assigned to you at the moment. Tasks will appear here once a project manager assigns work to you.
      </p>
      <div className="empty-state-actions">
        <button className="refresh-btn" onClick={() => window.location.reload()}>
          Refresh
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <div className='header'>
          <Header />
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your tasks...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className='header'>
          <Header />
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>Error: {error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className='header'>
        <Header />
      </div>

      <div className="my-tasks-container">
        <h1 className='white'>My Tasks</h1>

        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="task-list">
            {tasks.map(task => {
              const isEditable = isTaskEditable(task);
              return (
                <div
                  key={task._id}
                  className={`task-card ${getStatusClass(task.status)}`}
                >
                  <div className="task-header">
                    <h2 className="task-title">{task.title}</h2>
                    <div className="task-status">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                        className={getStatusClass(task.status)}
                        disabled={!isEditable}
                      >
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="task-description">
                    {task.description}
                  </div>

                  <div className="task-details">
                    <div className="task-project">
                      <strong>Project:</strong> {task.projectId?.title || 'N/A'}
                    </div>
                    <div className="task-due-date">
                      <strong>Due:</strong> {new Date(task.deadline || task.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="task-footer">
                    <div className="github-url-section">
                      <input
                        type="url"
                        placeholder="Enter GitHub URL for this task..."
                        value={githubUrls[task._id] || ''}
                        onChange={(e) => handleGithubUrlChange(task._id, e.target.value)}
                        disabled={!isEditable}
                      />
                      <button
                        className="submit-btn"
                        onClick={() => submitGithubUrl(task._id)}
                        disabled={!isEditable}
                      >
                        Submit
                      </button>
                    </div>

                    {task.verified && (
                      <div className="verification-status">
                        {getVerificationBadge(task.verified)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default FreelancerTasks;