import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FeedPage from './pages/FeedPage';
import AdminPage from './pages/AdminPage';
import GhostLogo from './components/GhostLogo';

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
      <div style={{
        animation: 'logoPulse 1.5s ease-in-out infinite',
        filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.6))',
      }}>
        <GhostLogo size={100} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          margin: 0, fontSize: '1.8rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}>
          Barly Secret
        </h1>
        <p style={{ margin: '6px 0 0', color: '#6b6b8a', fontSize: '0.82rem', letterSpacing: '0.5px' }}>
          Secrets Shared, Knowledge Gained
        </p>
      </div>

      <div style={{
        width: 160, height: 3, borderRadius: 99,
        background: 'rgba(42,42,61,0.8)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
          animation: 'loadbar 2s ease forwards',
        }} />
      </div>

      <style>{`
        @keyframes loadbar { from { width: 0% } to { width: 100% } }
        @keyframes logoPulse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
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