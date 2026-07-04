import React, { useState } from 'react';

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const isValidUser = username === '6289652321' || username === 'vastavik_parth';
    const isValidPass = password === 'Vastavik1234Parth';

    if (isValidUser && isValidPass) {
      onLoginSuccess();
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg)',
      fontFamily: "'Poppins', sans-serif",
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '4px solid var(--border)',
        boxShadow: '8px 8px 0px var(--border)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1 style={{ 
          margin: '0', 
          fontSize: '2rem', 
          textTransform: 'uppercase', 
          fontFamily: "'Pathway Gothic One', sans-serif",
          letterSpacing: '1px',
          textAlign: 'center'
        }}>
          Admin Login
        </h1>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
            <div style={{
              background: 'var(--danger)',
              color: 'white',
              padding: '10px',
              border: '2px solid var(--border)',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>Username / Phone</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                padding: '12px',
                border: '2px solid var(--border)',
                background: 'var(--bg)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                padding: '12px',
                border: '2px solid var(--border)',
                background: 'var(--bg)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <button 
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '15px',
              fontSize: '1.2rem',
              marginTop: '10px'
            }}
          >
            LOGIN
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;
