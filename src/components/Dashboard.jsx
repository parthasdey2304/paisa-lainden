import React, { useContext, useEffect, useState } from 'react';
import { StudentContext } from '../context/StudentContext';

const Dashboard = () => {
  const {
    totalStudents,
    totalExpectedFees,
    collectedThisMonth,
    pendingFees,
    pendingStudents,
    showFeeNotification,
    currentMonthKey
  } = useContext(StudentContext);

  const [notificationStatus, setNotificationStatus] = useState(Notification.permission);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[new Date().getMonth()];

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
    }
  };

  useEffect(() => {
    if (showFeeNotification && notificationStatus === 'granted') {
      const lastNotified = localStorage.getItem(`fee-notified-${currentMonthKey}`);
      if (!lastNotified) {
        new Notification("Fee Collection Reminder", {
          body: `It is past the 5th of the month. You have ${pendingStudents.length} students with pending fees.`,
          icon: '/vite.svg'
        });
        localStorage.setItem(`fee-notified-${currentMonthKey}`, 'true');
      }
    }
  }, [showFeeNotification, notificationStatus, currentMonthKey, pendingStudents.length]);

  return (
    <div className="mb-4">
      {showFeeNotification && (
        <div className="card notification-card mb-4">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Fee Collection Reminder!
          </h3>
          <p className="mt-4 text-sm text-yellow-800">
            It is past the 5th of the month. The following students have pending fees for {currentMonthName}:
          </p>
          <ul className="notification-list">
            {pendingStudents.map(student => (
              <li key={student.id}>
                <span><strong>{student.name}</strong> - {student.phone}</span>
                <span className="badge badge-danger">Pending: ₹{student.monthlyFee}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {notificationStatus === 'default' && (
        <div className="card mb-4 flex justify-between items-center" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div>
            <h3 style={{ color: '#1e40af', fontSize: '1rem', fontWeight: 600 }}>Enable Desktop Notifications</h3>
            <p style={{ color: '#1e3a8a', fontSize: '0.875rem' }}>Get alerted on your desktop when it's time to collect fees.</p>
          </div>
          <button className="btn btn-primary" onClick={requestNotificationPermission}>Enable</button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="stat-value">₹{collectedThisMonth}</div>
          <div className="stat-label">Collected ({currentMonthName})</div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="stat-value">₹{pendingFees}</div>
          <div className="stat-label">Pending ({currentMonthName})</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
