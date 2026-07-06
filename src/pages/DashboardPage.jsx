import React from 'react';
import Dashboard from '../components/Dashboard';
import ExportReportButton from '../components/ExportReportButton';

const DashboardPage = () => {
  return (
    <div>
      {/* Heading row: "OVERVIEW" on the left, Export button on the right (mobile only) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
          Overview
        </h2>

        {/* Mobile-only export button — hidden on desktop via CSS */}
        <div className="mobile-only">
          <ExportReportButton alignRight={true} />
        </div>
      </div>

      <Dashboard />
    </div>
  );
};

export default DashboardPage;
