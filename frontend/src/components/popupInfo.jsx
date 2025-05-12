import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLogout } from "../hooks/useLogout"; // Make sure this path is correct

const PopupInfo = ({ onClose }) => {
    const navigate = useNavigate();
    const { logout } = useLogout();
    const [isDeleting, setIsDeleting] = useState(false);
    const [userId, setUserId] = useState(null);

    // Fetch user ID when component mounts
    useEffect(() => {
        // Get user ID from local storage or context
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser.id) {
            setUserId(currentUser.id);
        }
    }, []);

    // Handle logout
    const handleLogout = () => {
        logout();
        if (onClose) onClose(); // Close the popup after logout
    };

    // Navigate to settings page
    const goToSettings = () => {
        navigate('/info');
        if (onClose) onClose(); // Close the popup after navigation
    };

    // Navigate to account switching page or functionality
    const switchAccount = () => {
        // Implement account switching or navigate to account selection page
        // navigate('/accounts');
        if (onClose) onClose();
    };

    // Handle account deletion with the specified endpoint using fetch
    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");

        if (confirmDelete) {
            if (!userId) {
                alert("Unable to delete account: User ID not found");
                if (onClose) onClose();
                return;
            }

            try {
                setIsDeleting(true);
                // Use the specific endpoint as requested with fetch API
                const response = await fetch(`/users/DeleteUser/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        // Include authorization header if required by your API
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    // Successfully deleted account
                    logout(); // Log out after successful deletion
                    alert("Your account has been successfully deleted");
                } else {
                    // Try to get error message from response
                    let errorMsg = "There was an issue deleting your account. Please try again.";
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.message || errorMsg;
                    } catch (e) {
                        // If response can't be parsed as JSON, use default error message
                    }
                    alert(errorMsg);
                }
            } catch (error) {
                console.error("Delete account error:", error);
                alert("Failed to delete account: " + error.message);
            } finally {
                setIsDeleting(false);
                if (onClose) onClose();
            }
        } else {
            if (onClose) onClose();
        }
    };

    return (
        <StyledWrapper>
            <div className="card">
                <ul className="list">
                    <li className="element" onClick={switchAccount}>
                        <svg className="lucide lucide-user-round-plus" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#7e8590" fill="none" viewBox="0 0 24 24" height={20} width={20} xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 21a8 8 0 0 1 13.292-6" />
                            <circle r={5} cy={8} cx={10} />
                            <path d="M19 16v6" />
                            <path d="M22 19h-6" />
                        </svg>
                        <p className="label">Switch Account</p>
                    </li>
                </ul>
                <div className="separator" />
                <ul className="list">
                    <li className="element" onClick={goToSettings}>
                        <svg className="lucide lucide-settings" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#7e8590" fill="none" viewBox="0 0 24 24" height={20} width={20} xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle r={3} cy={12} cx={12} />
                        </svg>
                        <p className="label">Settings</p>
                    </li>
                    <li className="element delete" onClick={handleDelete} disabled={isDeleting}>
                        <svg className="lucide lucide-trash-2" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#7e8590" fill="none" viewBox="0 0 24 24" height={20} width={20} xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line y2={17} y1={11} x2={10} x1={10} />
                            <line y2={17} y1={11} x2={14} x1={14} />
                        </svg>
                        <p className="label">{isDeleting ? "Deleting..." : "Delete"}</p>
                    </li>
                </ul>
                <div className="separator" />
                <ul className="list">
                    <li className="element team-access" onClick={handleLogout}>
                        <svg className="lucide lucide-users-round" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#7e8590" fill="none" viewBox="0 0 24 24" height={20} width={20} xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 21a8 8 0 0 0-16 0" />
                            <circle r={5} cy={8} cx={10} />
                            <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
                        </svg>
                        <p className="label">Log out</p>
                    </li>
                </ul>
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  .card {
    width: 200px;
    height: auto;
    background-color: #fff;
    border-radius: 10px;
    padding: 10px 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .card .separator {
    border-top: 1px solid #e1e4e8;
    margin: 5px 0;
  }

  .card .list {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 0 10px;
    margin: 0;
  }

  .card .list .element {
    display: flex;
    align-items: center;
    color: #7e8590;
    gap: 10px;
    transition: all 0.2s ease-out;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  }

  .card .list .element svg {
    width: 18px;
    height: 18px;
    transition: all 0.2s ease-out;
  }

  .card .list .element .label {
    font-weight: 500;
    margin: 0;
  }

  .card .list .element:hover {
    background-color: #5353ff;
    color: #ffffff;
  }
  
  .card .list .delete:hover {
    background-color: #e53935;
  }

  .card .list .element:hover svg {
    stroke: #ffffff;
  }

  .card .list .team-access {
    color: #6a6fc9;
  }
  
  .card .list .team-access svg {
    stroke: #6a6fc9;
  }

  .card .list .team-access:hover {
    background-color: rgba(106, 111, 201, 0.1);
    color: #6a6fc9;
  }
  
  .card .list .team-access:hover svg {
    stroke: #6a6fc9;
  }
`;

export default PopupInfo;