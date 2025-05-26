import React from 'react';
import ProjectsList from '../components/Projectdash';
import '../assets/style/Dash.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Project Dashboard</h1>
      </header>
      <main className="dashboard-content">
        <ProjectsList />
      </main>
    </div>
  );
};

export default Dashboard;