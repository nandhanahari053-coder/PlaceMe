import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('enter'); // enter -> stay -> exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('stay'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2200);
    const t3 = setTimeout(() => onFinish(), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      opacity: phase === 'exit' ? 0 : 1,
      transform: phase === 'exit' ? 'scale(1.05)' : 'scale(1)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    }}>
      {/* Glowing backdrop */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,161,57,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        transform: phase === 'stay' ? 'scale(1)' : 'scale(0.5)',
        transition: 'transform 1s ease',
      }} />

      {/* Logo */}
      <div style={{
        position: 'relative',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(30px) scale(0.85)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <img
          src="/chanakya-logo.jpg"
          alt="Chanakya University"
          style={{
            width: '340px',
            maxWidth: '80vw',
            borderRadius: '16px',
            boxShadow: '0 0 60px rgba(196,161,57,0.3), 0 20px 60px rgba(0,0,0,0.6)',
          }}
        />
      </div>

      {/* Tagline */}
      <p style={{
        marginTop: '28px',
        color: 'rgba(196,161,57,0.85)',
        fontSize: '14px',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(10px)' : 'translateY(0)',
        transition: 'opacity 1s ease 0.4s, transform 1s ease 0.4s',
      }}>
        Student Placement Platform
      </p>

      {/* Loader bar */}
      <div style={{
        marginTop: '40px',
        width: '200px', height: '3px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '99px',
        overflow: 'hidden',
        opacity: phase === 'enter' ? 0 : 1,
        transition: 'opacity 0.5s ease 0.6s',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #c4a139, #f0c84a)',
          borderRadius: '99px',
          animation: 'splashProgress 2s ease forwards',
        }} />
      </div>

      <style>{`
        @keyframes splashProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
