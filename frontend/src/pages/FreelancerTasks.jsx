import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/style/FreelancerTasks.css';
import Header from '../components/Header';

const FreelancerTasks = () => {
  const { user } = useContext(AuthContext);
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
          setTasks(data.data);
          console.log(data.data)

          // Initialize githubUrls state with existing values
          const initialUrls = {};
          data.data.forEach(task => {
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
    setGithubUrls(prev => ({
      ...prev,
      [taskId]: value
    }));
  };

  // Submit GitHub URL
  const submitGithubUrl = async (taskId) => {
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

  if (isLoading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (tasks.length === 0) {
    return <div className="no-tasks">No tasks assigned yet.</div>;
  }

  return (
    <>
      <div className='header'>
        <Header />
      </div>
      {/* Toast Container */}
      <ToastContainer />

      <div className="my-tasks-container">
        <h1 className='white'>My Tasks</h1>

        <div className="task-list">
          {tasks.map(task => (
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
                  <strong>Due:</strong> {new Date(task.dueDate || task.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="task-footer">
                <div className="github-url-section">
                  <input
                    type="url"
                    placeholder="Enter GitHub URL for this task..."
                    value={githubUrls[task._id] || ''}
                    onChange={(e) => handleGithubUrlChange(task._id, e.target.value)}
                  />
                  <button
                    className="submit-btn"
                    onClick={() => submitGithubUrl(task._id)}
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
          ))}
        </div>
      </div>
    </>
  );
};

export default FreelancerTasks;