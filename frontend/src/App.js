import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FeedPage from './pages/FeedPage';
import AdminPage from './pages/AdminPage';

const LoadingScreen = ({ onDone }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1800);
    const t2 = setTimeout(() => onDone(), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0a0a0f',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '24px',
        transition: 'opacity 0.5s ease',
        opacity: fade ? 0 : 1,
        pointerEvents: fade ? 'none' : 'all',
      }}
    >
      {/* Logo */}
      <div style={{
        animation: 'pulse 1.5s ease-in-out infinite',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <img
          src="/logo.png"
          alt="Barly Secret"
          style={{ height: 72, width: 'auto', filter: 'drop-shadow(0 0 20px rgba(124,107,255,0.4))' }}
        />
      </div>

      {/* Tagline */}
      <p style={{ margin: 0, color: '#6b6b8a', fontSize: '0.85rem' }}>
        Secrets Shared, Knowledge Gained
      </p>

      {/* Loading bar */}
      <div style={{
        width: 160, height: 3, borderRadius: 99,
        background: 'rgba(42,42,61,0.8)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg, #7c6bff, #9d8fff)',
          animation: 'loadbar 1.8s ease forwards',
        }} />
      </div>

      <style>{`
        @keyframes loadbar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(124,107,255,0.2); }
          50% { box-shadow: 0 0 60px rgba(124,107,255,0.4); }
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
          <Route
            path="/"
            element={
              <FeedPage
                showCreate={showCreate}
                onCreateClose={() => setShowCreate(false)}
              />
            }
          />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;