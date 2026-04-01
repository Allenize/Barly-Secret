import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Rss, PenSquare } from 'lucide-react';
import GhostLogo from './GhostLogo';

const Navbar = ({ onCreatePost }) => {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(42,42,61,0.8)',
    }}>
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo + Name */}
        <Link to="/" className="flex items-center gap-2 group no-underline">
          <GhostLogo size={32} />
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-white leading-none">
              Barly <span style={{ color: '#7c3aed' }}>Secret</span>
            </span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <>
              <button
                onClick={onCreatePost}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7c6bff, #4a3fa0)', color: 'white', boxShadow: '0 0 16px rgba(124,107,255,0.3)' }}
              >
                <PenSquare size={14} />
                <span className="hidden sm:inline">Post</span>
              </button>
              <Link to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 no-underline"
                style={{ color: location.pathname === '/' ? '#7c6bff' : '#6b6b8a', background: location.pathname === '/' ? 'rgba(124,107,255,0.1)' : 'transparent' }}
              >
                <Rss size={14} />
                <span className="hidden sm:inline">Feed</span>
              </Link>
            </>
          )}
          <Link to={isAdmin ? '/' : '/admin'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 no-underline"
            style={{ color: isAdmin ? '#7c6bff' : '#6b6b8a', background: isAdmin ? 'rgba(124,107,255,0.1)' : 'transparent' }}
            title="Moderation Panel"
          >
            <Shield size={14} />
            <span className="hidden sm:inline">{isAdmin ? 'Back to Feed' : 'Moderate'}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;