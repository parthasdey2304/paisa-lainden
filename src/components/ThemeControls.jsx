import React from 'react';

const ThemeControls = ({ isDark, setIsDark, themeColor, setThemeColor }) => {
  const presetColors = ['#facc15', '#f472b6', '#22d3ee', '#4ade80'];

  return (
    <div 
      className="desktop-only"
      style={{
        position: 'fixed',
        top: '6rem',
        right: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 1000
      }}
    >
      {/* Background Color Picker */}
      <div 
        className="card"
        style={{ 
          padding: '0.25rem', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: '0.5rem',
          background: 'var(--surface)',
          marginBottom: '0'
        }}
        title="Change Background Color"
      >
        <input 
          type="color" 
          value={themeColor}
          onChange={(e) => setThemeColor(e.target.value)}
          style={{
            width: '32px',
            height: '32px',
            padding: '0',
            border: '2px solid var(--border)',
            cursor: 'pointer',
            background: 'transparent'
          }}
        />
        
        {/* Preset Swatches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '2px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
          {presetColors.map(color => (
            <button
              key={color}
              onClick={() => setThemeColor(color)}
              title={`Set to ${color}`}
              style={{
                width: '24px',
                height: '24px',
                background: color,
                border: themeColor === color ? '2px solid var(--text-main)' : '2px solid var(--border)',
                cursor: 'pointer',
                padding: 0
              }}
            />
          ))}
        </div>
      </div>

      {/* Light / Dark Mode Toggle */}
      <button 
        className="btn"
        onClick={() => setIsDark(!isDark)}
        title={isDark ? "Light mode" : "Dark mode"}
        style={{ 
          padding: '0.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--surface)',
          width: '46px',
          height: '46px'
        }}
      >
        {isDark ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>
    </div>
  );
};

export default ThemeControls;
