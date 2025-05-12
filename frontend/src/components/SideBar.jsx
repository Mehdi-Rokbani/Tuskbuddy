import React, { useContext } from 'react';
import '../assets/style/SideBar.css'; // create this file
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
const Sidebar = ({ onClose }) => {
    const { user } = useContext(AuthContext)
    return (
        <div className="sidebar">

            <h1 className="logo" onClick={onClose}> <FontAwesomeIcon icon={faBars} onClick={onClose} className="bar" />TaskBuddy</h1>
            <ul className="menu">
                <Link to='/'><li>Home</li></Link>
                {user?.user?.role === 'freelancer' && (<Link to='/freereq'><li>My requests</li></Link>)}
                {user?.user?.role === 'client' && (<Link to='/myproject'><li>My Projects</li></Link>)}
                {user?.user?.role === 'freelancer' && (<Link to='/tasks'><li>tasks</li></Link>)}
                {user?.user?.role === 'client' && (<Link to='/tt'><li>Teams</li></Link>)}
                {user?.user?.role === 'client' && (<Link to='/projectfrom'><li>Add Project</li></Link>)}
            </ul>

        </div>
    );
};

export default Sidebar;
