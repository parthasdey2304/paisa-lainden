import React, { useContext } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import { StudentContext } from './context/StudentContext';
import DashboardPage from './pages/DashboardPage';
import StudentListPage from './pages/StudentListPage';
import './index.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function MonthPicker() {
  const { selectedMonth, setSelectedMonth, currentMonthKey } = useContext(StudentContext);

  const [year, month] = selectedMonth.split('-').map(Number);

  const changeMonth = (delta) => {
    const date = new Date(year, month - 1 + delta, 1);
    const newKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newKey);
  };

  const isCurrentMonth = selectedMonth === currentMonthKey;

  return (
    <div className="month-picker">
      <button
        id="month-prev-btn"
        className="month-picker__arrow"
        onClick={() => changeMonth(-1)}
        title="Previous month"
        aria-label="Previous month"
      >
        ‹
      </button>

      <div className="month-picker__label">
        <span className="month-picker__name">{MONTH_NAMES[month - 1]}</span>
        <span className="month-picker__year">{year}</span>
        {isCurrentMonth && <span className="month-picker__badge">NOW</span>}
      </div>

      <button
        id="month-next-btn"
        className="month-picker__arrow"
        onClick={() => changeMonth(1)}
        disabled={isCurrentMonth}
        title="Next month"
        aria-label="Next month"
        style={{ opacity: isCurrentMonth ? 0.35 : 1, cursor: isCurrentMonth ? 'not-allowed' : 'pointer' }}
      >
        ›
      </button>
    </div>
  );
}

function App() {
  const location = useLocation();

  return (
    <StudentProvider>
      <div className="app-container">
        <header className="header">
          <h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            StudentManager
          </h1>
          <nav className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
            <Link to="/students" className={location.pathname === '/students' ? 'active' : ''}>Students</Link>
          </nav>
          <MonthPicker />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/students" element={<StudentListPage />} />
          </Routes>
        </main>
      </div>
    </StudentProvider>
  );
}

export default App;
