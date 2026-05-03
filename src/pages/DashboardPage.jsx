import React from 'react';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase' }}>Overview</h2>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
