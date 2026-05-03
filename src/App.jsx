import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import DashboardPage from './pages/DashboardPage';
import StudentListPage from './pages/StudentListPage';
import './index.css';

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
