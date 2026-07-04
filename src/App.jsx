import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import { StudentContext } from './context/StudentContext';
import DashboardPage from './pages/DashboardPage';
import StudentListPage from './pages/StudentListPage';
import LoginPage from './components/LoginPage';
import DesktopNotificationAlert from './components/DesktopNotificationAlert';
import InteractiveBackground from './components/InteractiveBackground';
import ThemeControls from './components/ThemeControls';
import { isAuthenticated, login } from './utils/auth';
import './index.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function MonthPicker() {
  const { selectedMonth, setSelectedMonth, currentMonthKey } = useContext(StudentContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [year, month] = selectedMonth.split('-').map(Number);

  const changeMonth = (delta) => {
    const date = new Date(year, month - 1 + delta, 1);
    const newKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newKey);
  };

  const isCurrentMonth = selectedMonth === currentMonthKey;

  const dropdownOptions = Array.from({ length: 5 }, (_, i) => {
    const delta = i - 2;
    const d = new Date(year, month - 1 + delta, 1);
    const mYear = d.getFullYear();
    const mNum = String(d.getMonth() + 1).padStart(2, '0');
    return {
      key: `${mYear}-${mNum}`,
      label: `${MONTH_NAMES[d.getMonth()]} ${mYear}`,
      isNow: `${mYear}-${mNum}` === currentMonthKey
    };
  });

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.month-picker__label')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

      <div 
        className="month-picker__label" 
        style={{ position: 'relative', cursor: 'pointer' }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className="month-picker__name">{MONTH_NAMES[month - 1]}</span>
        <span className="month-picker__year">{year}</span>
        {isCurrentMonth && <span className="month-picker__badge">NOW</span>}
        <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>▼</span>

        {isDropdownOpen && (
          <div className="month-dropdown" style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface)',
            border: 'var(--border-width) solid var(--border)',
            zIndex: 100,
            width: '220px',
            marginTop: '0.5rem',
            boxShadow: '4px 4px 0px var(--border)'
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {dropdownOptions.map((opt, idx) => (
                <li 
                  key={opt.key}
                  style={{
                    padding: '0.75rem',
                    borderBottom: idx === 4 ? 'none' : '2px solid var(--border)',
                    background: opt.key === selectedMonth ? 'var(--warning)' : 'transparent',
                    textAlign: 'center',
                    fontWeight: opt.key === selectedMonth ? 'bold' : 'normal',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMonth(opt.key);
                    setIsDropdownOpen(false);
                  }}
                >
                  {opt.label} {opt.isNow && <span className="month-picker__badge" style={{ transform: 'scale(0.8)' }}>NOW</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
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
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());
  
  // Theme State
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme-dark') === 'true';
  });
  const [themeColor, setThemeColor] = useState('#facc15'); // Default to yellow

  // Apply Theme
  useEffect(() => {
    // 1. Update the primary accent color across the app
    document.documentElement.style.setProperty('--warning', themeColor);

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      // Mix the chosen color with 85% dark off-black for dark mode
      document.documentElement.style.setProperty('--background', `color-mix(in srgb, ${themeColor} 15%, #050500)`);
    } else {
      document.documentElement.removeAttribute('data-theme');
      // Mix the chosen color with 80% white to create a pale pastel background for light mode
      document.documentElement.style.setProperty('--background', `color-mix(in srgb, ${themeColor} 20%, #ffffff)`);
    }
    
    // Persist ONLY dark mode to local storage (Color reverts on refresh)
    localStorage.setItem('theme-dark', isDark);
    localStorage.removeItem('theme-color'); // Clean up old saved color
  }, [isDark, themeColor]);

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => {
      login();
      setIsLoggedIn(true);
    }} />;
  }

  return (
    <StudentProvider>
      <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
        <ThemeControls 
          isDark={isDark} 
          setIsDark={setIsDark} 
          themeColor={themeColor} 
          setThemeColor={setThemeColor} 
        />
        <InteractiveBackground />
        <DesktopNotificationAlert />
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
