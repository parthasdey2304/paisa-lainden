import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentContext } from '../context/StudentContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    students,
    totalStudents,
    totalExpectedFees,
    collectedThisMonth,
    pendingFees,
    pendingStudents,
    showFeeNotification,
    currentMonthKey,
    selectedMonth,
    totalRevenue,
    loading
  } = useContext(StudentContext);

  const [notificationStatus, setNotificationStatus] = useState(() => {
    try {
      return 'Notification' in window ? Notification.permission : 'denied';
    } catch (e) {
      return 'denied';
    }
  });

  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPDF = () => {
    exportToPDF(students, selectedMonth, totalExpectedFees, collectedThisMonth, pendingFees, totalStudents, pendingStudents);
    setIsExportMenuOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcel(students, selectedMonth, totalExpectedFees, collectedThisMonth, pendingFees, totalStudents, pendingStudents);
    setIsExportMenuOpen(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const selectedMonthIndex = selectedMonth ? parseInt(selectedMonth.split('-')[1], 10) - 1 : new Date().getMonth();
  const currentMonthName = monthNames[selectedMonthIndex];

  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission);
      }
    } catch (e) {
      console.error('Notification permission error:', e);
    }
  };

  useEffect(() => {
    try {
      if (showFeeNotification && notificationStatus === 'granted') {
        const lastNotified = localStorage.getItem(`fee-notified-${currentMonthKey}`);
        if (!lastNotified) {
          if ('Notification' in window) {
            new Notification("Fee Collection Reminder", {
              body: `It is past the 5th of the month. You have ${pendingStudents.length} students with pending fees.`,
              icon: '/vite.svg'
            });
          }
          localStorage.setItem(`fee-notified-${currentMonthKey}`, 'true');
        }
      }
    } catch (e) {
      console.error('Error showing notification:', e);
    }
  }, [showFeeNotification, notificationStatus, currentMonthKey, pendingStudents.length]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="nav-links">
          <a href="#" className={activeTab === 'list' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('list'); }}>Pending Students</a>
          <a href="#" className={activeTab === 'stats' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('stats'); }}>Statistics</a>
        </div>

        {/* Export Report dropdown — desktop only (hidden on mobile via CSS) */}
        <div className="desktop-only" style={{ position: 'relative' }} ref={exportMenuRef}>
          <button
            className="btn"
            style={{
              whiteSpace: 'nowrap',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              border: '4px solid var(--border)',
              boxShadow: '4px 4px 0px var(--border)',
              fontWeight: 800,
              padding: '0.5rem 1rem'
            }}
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
          >
            Export Report ▼
          </button>
          {isExportMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              border: '4px solid var(--border)',
              boxShadow: '4px 4px 0px var(--border)',
              zIndex: 100,
              minWidth: '200px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <button
                onClick={handleExportPDF}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  color: 'var(--text-main)',
                  border: 'none',
                  borderBottom: '4px solid var(--border)',
                  textAlign: 'left',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => { e.target.style.background = 'var(--warning)'; e.target.style.color = 'black'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-main)'; }}
              >
                📄 Download PDF
              </button>
              <button
                onClick={handleExportExcel}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  color: 'var(--text-main)',
                  border: 'none',
                  textAlign: 'left',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => { e.target.style.background = 'var(--warning)'; e.target.style.color = 'black'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-main)'; }}
              >
                📊 Download Excel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-layout" style={{ display: 'block' }}>
        {activeTab === 'list' && !loading && (
          <div className="dashboard-left" style={{ width: '100%' }}>
            {pendingStudents.length > 0 && (
          <div className="card notification-card mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Pending Students List
              </h3>
              <div className="desktop-search">
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    border: 'var(--border-width) solid var(--border)', 
                    fontFamily: 'inherit', 
                    fontSize: '0.9rem',
                    width: '250px'
                  }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-yellow-800" style={{ marginBottom: '1rem' }}>
              The following students have pending fees for {currentMonthName}:
            </p>
            {(() => {
              const filteredStudents = pendingStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
              if (filteredStudents.length === 0) {
                return (
                  <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface)', border: 'var(--border-width) solid var(--border)', fontWeight: 'bold' }}>
                    No student with that name is present.
                  </div>
                );
              }
              return (
                <ul className="notification-list">
                  {filteredStudents.map(student => {
                    const paidThisMonth = (student.payments || [])
                      .filter(p => p.monthKey === selectedMonth)
                      .reduce((sum, p) => sum + Number(p.amount), 0);
                    const pendingAmount = Number(student.monthlyFee || 0) - paidThisMonth;
                    return (
                      <li key={student.id}>
                        <span><strong>{student.name}</strong></span>
                        <button 
                          className="btn" 
                          style={{ background: 'var(--danger)', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          onClick={() => navigate('/students', { state: { openPaymentFor: student.id } })}
                        >
                          Pending: ₹{pendingAmount > 0 ? pendingAmount : student.monthlyFee}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </div>
        )}
      </div>
      )}

      {activeTab === 'list' && loading && (
        <div className="dashboard-left" style={{ width: '100%' }}>
          <div 
            style={{ 
              padding: '2rem', 
              minHeight: '350px', 
              background: 'var(--warning)', 
              border: '4px solid var(--border)',
              boxShadow: '6px 6px 0px var(--border)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <img 
              src="https://cdn.dribbble.com/userupload/22569723/file/original-a121107ab8231c9e9be60c6593ee33f9.gif" 
              alt="Loading data..."
              style={{ width: '200px', height: 'auto', borderRadius: '12px', border: '4px solid var(--border)', boxShadow: '6px 6px 0px var(--border)' }}
            />
          </div>
        </div>
      )}

      {activeTab === 'stats' && !loading && (
      <div className="dashboard-right" style={{ width: '100%' }}>
        <div className="dashboard-grid">
          {/* Row 1 */}
          <div className="card stat-card mb-0" style={{ background: 'var(--secondary)' }}>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>

          <div className="card stat-card mb-0" style={{ background: '#ea580c' }}>
            <div className="stat-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="stat-value">{pendingStudents.length}</div>
            <div className="stat-label">Unpaid Students ({currentMonthName})</div>
          </div>

          {/* Row 2 */}
          <div className="card stat-card mb-0" style={{ background: '#d8b4fe' }}>
            <div className="stat-icon" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <div className="stat-value">₹{totalExpectedFees}</div>
            <div className="stat-label">Total Expected (Monthly)</div>
          </div>

          <div className="card stat-card mb-0" style={{ background: 'var(--primary)' }}>
            <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="stat-value">₹{pendingFees}</div>
            <div className="stat-label">Pending ({currentMonthName})</div>
          </div>

          {/* Row 3 */}
          <div className="card stat-card mb-0" style={{ background: 'var(--success)' }}>
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div className="stat-value">₹{collectedThisMonth}</div>
            <div className="stat-label">Collected ({currentMonthName})</div>
          </div>

          <div className="card stat-card mb-0" style={{ background: '#bfdbfe' }}>
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
            </div>
            <div className="stat-value">{totalStudents - pendingStudents.length}</div>
            <div className="stat-label">Paid Students ({currentMonthName})</div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'stats' && loading && (
        <div className="dashboard-right" style={{ width: '100%' }}>
          <div className="dashboard-grid">
            <div className="skeleton-box"></div>
            <div className="skeleton-box"></div>
            <div className="skeleton-box"></div>
            <div className="skeleton-box"></div>
            <div className="skeleton-box"></div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;
