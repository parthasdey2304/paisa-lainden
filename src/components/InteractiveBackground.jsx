import React, { useEffect, useRef } from 'react';

const InteractiveBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let dots = [];
    let mouse = { x: -1000, y: -1000, active: false };

    // Configuration
    const spacing = 20; // 20px grid to match original
    const baseSize = 1; // 1px radius
    const interactionRadius = 80;
    const repulsionStrength = 20;
    const maxScale = 2.5;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    const initDots = () => {
      dots = [];
      const cols = Math.floor(canvas.width / spacing) + 1;
      const rows = Math.floor(canvas.height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          dots.push({
            originX: x,
            originY: y,
            x: x,
            y: y,
            size: baseSize,
            vx: 0,
            vy: 0
          });
        }
      }
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get CSS variable for text color so it matches the theme perfectly
      const dotColor = getComputedStyle(document.body).getPropertyValue('--text-main').trim() || '#000000';
      ctx.fillStyle = dotColor;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        
        let targetX = dot.originX;
        let targetY = dot.originY;
        let targetSize = baseSize;

        if (mouse.active) {
          const dx = mouse.x - dot.originX;
          const dy = mouse.y - dot.originY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < interactionRadius) {
            // Calculate repulsion
            const force = (interactionRadius - dist) / interactionRadius; // 0 to 1
            const angle = Math.atan2(dy, dx);
            
            // Push away from mouse
            targetX = dot.originX - Math.cos(angle) * (force * repulsionStrength);
            targetY = dot.originY - Math.sin(angle) * (force * repulsionStrength);
            
            // Scale up based on proximity
            targetSize = baseSize + (force * maxScale);
          }
        }

        // Spring physics to return to original position / reach target
        // Lower tension and higher dampening makes the flow last longer and feel more fluid
        const tension = 0.02;
        const dampening = 0.92;

        const ax = (targetX - dot.x) * tension;
        const ay = (targetY - dot.y) * tension;

        dot.vx = (dot.vx + ax) * dampening;
        dot.vy = (dot.vy + ay) * dampening;

        dot.x += dot.vx;
        dot.y += dot.vy;

        // Simple lerp for size - slower transition
        dot.size += (targetSize - dot.size) * 0.05;

        // Draw the dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(0.1, dot.size), 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Keep it strictly in the background
        pointerEvents: 'none' // Do not block any clicks on the UI
      }}
    />
  );
};

export default InteractiveBackground;
