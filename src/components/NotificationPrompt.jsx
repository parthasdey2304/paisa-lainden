import React, { useEffect, useState } from 'react';

const NotificationPrompt = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow the slide-in animation to trigger after mounting
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // Auto-remove after 8 seconds
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for slide-out animation to finish before unmounting
    }, 8000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  const handleEnable = () => {
    // In a real PWA/Push scenario, you'd request Notification.requestPermission() here
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '80px', // Just below the header
      right: '20px', // On the right side
      background: 'var(--surface)',
      border: '4px solid var(--border)',
      boxShadow: '6px 6px 0px var(--border)',
      padding: '20px',
      width: '320px',
      zIndex: 1000,
      transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: "'Pathway Gothic One', sans-serif", textTransform: 'uppercase' }}>
          Enhance Your Experience
        </h3>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
          aria-label="Close"
        >
          ✖
        </button>
      </div>
      
      <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>
        Install this webapp on your device and enable notifications to never miss an update!
      </p>

      <button 
        onClick={handleEnable}
        className="btn btn-primary"
        style={{ width: '100%', padding: '10px', fontSize: '0.95rem' }}
      >
        Enable Notifications
      </button>
    </div>
  );
};

export default NotificationPrompt;
