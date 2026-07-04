import React, { useContext, useEffect, useState } from 'react';
import { StudentContext } from '../context/StudentContext';

const ColorSplash = () => {
  const { loading } = useContext(StudentContext);
  const [showSplash, setShowSplash] = useState(false);
  const [prevLoading, setPrevLoading] = useState(true);

  useEffect(() => {
    // When loading transitions from TRUE to FALSE, trigger the splash!
    if (prevLoading && !loading) {
      setShowSplash(true);
      // The animation takes about 1.5s for the GIF to play, remove it from DOM after it finishes
      setTimeout(() => setShowSplash(false), 1500);
    }
    setPrevLoading(loading);
  }, [loading, prevLoading]);

  if (!showSplash) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999, // Extremely high to cover everything
        pointerEvents: 'none', // Don't block clicks
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.8)' // Slight fade to background
      }}
    >
      <img 
        src="https://cdn.dribbble.com/userupload/22569723/file/original-a121107ab8231c9e9be60c6593ee33f9.gif" 
        alt="Loading transition"
        style={{ width: '300px', height: 'auto', borderRadius: '12px', border: '4px solid black', boxShadow: '8px 8px 0px black' }}
      />
    </div>
  );

  /* 
  // PRESERVED ORIGINAL COLOR SPLASH:
  // "just keep that thing over there so taht i can use it if required."
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        // A vibrant multi-color radial gradient
        background: 'radial-gradient(circle, #ff007f 0%, #00f0ff 40%, #ffeb3b 80%, rgba(255,255,255,0) 100%)',
        zIndex: 9999, // Extremely high to cover everything
        pointerEvents: 'none', // Don't block clicks
        animation: 'colorSplash 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        transformOrigin: 'center center'
      }}
    />
  );
  */
};

export default ColorSplash;
