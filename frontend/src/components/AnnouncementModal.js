import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AnnouncementModal = () => {
  const [visible, setVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('bs_announcement_image');
    if (saved) {
      setImageUrl(saved);
      setVisible(true);
    }
  }, []);

  if (!visible || !imageUrl) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.3s ease',
      }}
      onClick={e => e.target === e.currentTarget && setVisible(false)}
    >
      <div style={{
        position: 'relative',
        maxWidth: 560, width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(124,107,255,0.3)',
        boxShadow: '0 0 60px rgba(124,107,255,0.2)',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(10,10,15,0.8)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={14} />
        </button>

        {/* Banner image */}
        <img
          src={imageUrl}
          alt="Announcement"
          style={{ width: '100%', display: 'block', maxHeight: '70vh', objectFit: 'cover' }}
        />
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
};

export default AnnouncementModal;