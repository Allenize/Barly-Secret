import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FeedPage from './pages/FeedPage';
import AdminPage from './pages/AdminPage';

const BarlyLogo = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9d8fff"/>
        <stop offset="100%" stopColor="#6b5fff"/>
      </linearGradient>
    </defs>
    {/* Triangular knot shape inspired by the logo */}
    <path d="M50 8 C54 8 57 11 57 15 L72 70 C74 76 70 82 64 82 L36 82 C30 82 26 76 28 70 L43 15 C43 11 46 8 50 8Z"
      fill="url(#lg1)" opacity="0.9"/>
    <path d="M50 8 C46 8 40 12 38 18 L18 60 C14 68 18 78 26 80 L50 85 L74 80 C82 78 86 68 82 60 L62 18 C60 12 54 8 50 8Z"
      fill="none" stroke="url(#lg1)" strokeWidth="4" opacity="0.5"/>
    <ellipse cx="50" cy="52" rx="12" ry="16" fill="#0a0a0f" opacity="0.8"/>
    <ellipse cx="50" cy="52" rx="7" ry="10" fill="url(#lg1)" opacity="0.6"/>
  </svg>
);

const LoadingScreen = ({ onDone }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 2000);
    const t2 = setTimeout(() => onDone(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0a0f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px',
      transition: 'opacity 0.5s ease',
      opacity: fade ? 0 : 1,
      pointerEvents: fade ? 'none' : 'all',
    }}>
      {/* Logo */}
      <div style={{
        animation: 'logoPulse 1.5s ease-in-out infinite',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        filter: 'drop-shadow(0 0 20px rgba(124,107,255,0.5))',
      }}>
        <BarlyLogo size={80} />
      </div>

      {/* App name */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          margin: 0, fontSize: '1.8rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #9d8fff, #6b5fff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}>
          Barly Secret
        </h1>
        <p style={{ margin: '6px 0 0', color: '#6b6b8a', fontSize: '0.82rem', letterSpacing: '0.5px' }}>
          Secrets Shared, Knowledge Gained
        </p>
      </div>

      {/* Loading bar */}
      <div style={{
        width: 160, height: 3, borderRadius: 99,
        background: 'rgba(42,42,61,0.8)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg, #7c6bff, #9d8fff)',
          animation: 'loadbar 2s ease forwards',
        }} />
      </div>

      <style>{`
        @keyframes loadbar { from { width: 0% } to { width: 100% } }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(124,107,255,0.5)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 35px rgba(124,107,255,0.8)); }
        }
      `}</style>
    </div>
  );
};

function App() {
  const [showCreate, setShowCreate] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
      <div style={{ minHeight: '100vh', background: '#0a0a0f', opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }}>
        <Navbar onCreatePost={() => setShowCreate(true)} />
        <Routes>
          <Route path="/" element={<FeedPage showCreate={showCreate} onCreateClose={() => setShowCreate(false)} />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;