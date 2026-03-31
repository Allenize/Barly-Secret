import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Rss, PenSquare } from 'lucide-react';

const Navbar = ({ onCreatePost }) => {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const [logoSrc, setLogoSrc] = useState(() => localStorage.getItem('bs_logo') || null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      setLogoSrc(src);
      localStorage.setItem('bs_logo', src);
    };
    reader.readAsDataURL(file);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(42,42,61,0.8)',
    }}>
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo + Name */}
        <Link to="/" className="flex items-center gap-3 group no-underline">
          <div className="relative">
            {logoSrc ? (
              <img src={logoSrc} alt="logo" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <label className="cursor-pointer" title="Click to upload logo">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #7c6bff, #4a3fa0)', boxShadow: '0 0 12px rgba(124,107,255,0.4)' }}>
                  <span className="text-white text-xs font-bold font-mono">BS</span>
                </div>
              </label>
            )}
            {logoSrc && (
              <label className="absolute -bottom-1 -right-1 cursor-pointer" title="Change logo">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-white text-xs">+</div>
              </label>
            )}
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-white leading-none">
              Barly <span style={{ color: '#7c6bff' }}>Secret</span>
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
