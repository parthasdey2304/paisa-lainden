import React, { useEffect, useState } from 'react';

const DesktopNotificationAlert = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Only show if notifications are supported, currently not granted, and not dismissed
    if ('Notification' in window && Notification.permission === 'default' && !hasDismissed) {
      const showTimer = setTimeout(() => setIsVisible(true), 500);
      
      // Auto-hide after 7 seconds as requested
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 7500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [hasDismissed]);

  const handleEnable = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
    setIsVisible(false);
    setHasDismissed(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    setHasDismissed(true);
  };

  if (!isVisible && hasDismissed) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '400px',
        transform: isVisible ? 'translateY(0)' : 'translateY(150%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fontFamily: "'Poppins', system-ui, sans-serif"
      }}
    >
      <div className="text-sm" style={{ padding: '1.5rem', backgroundColor: 'white', color: 'black', border: '4px solid black', boxShadow: '8px 8px 0px black' }} role="alert">
        <div className="flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
            <svg style={{ width: '1rem', height: '1rem', flexShrink: 0, marginRight: '0.5rem' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
            <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>Info</span>
            <h3 style={{ fontWeight: 800, margin: 0, fontSize: '1.1rem', textTransform: 'uppercase' }}>Desktop Notifications</h3>
          </div>
          <button onClick={handleClose} type="button" aria-label="Close" style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'black', cursor: 'pointer', padding: '0.25rem' }}>
            <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>Close</span>
            <svg style={{ width: '1rem', height: '1rem' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
            </svg>
          </button>
        </div>
        <div style={{ marginTop: '0.5rem', marginBottom: '1rem', color: '#333', fontSize: '0.9rem', fontWeight: 500 }}>
          Enable desktop notifications to get instant alerts on your device when it's time to collect pending monthly fees from your students.
        </div>
        <button onClick={handleEnable} type="button" className="btn" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'white', color: 'black', border: '2px solid black', boxShadow: '2px 2px 0px black', fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem 1rem', cursor: 'pointer', textTransform: 'uppercase' }}>
          <svg style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.375rem' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
            <path stroke="currentColor" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
          </svg>
          Enable Now
        </button>
      </div>
    </div>
  );
};

export default DesktopNotificationAlert;
