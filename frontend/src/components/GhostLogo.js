import React from 'react';

const GhostLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="48" rx="38" ry="42" fill="#7c3aed"/>
    <rect x="12" y="48" width="76" height="38" fill="#7c3aed"/>
    <path d="M12 86 Q22 100 32 86 Q42 72 50 86 Q58 100 68 86 Q78 72 88 86 L88 95 Q78 108 68 95 Q58 82 50 95 Q42 108 32 95 Q22 82 12 95 Z" fill="#7c3aed"/>
    <ellipse cx="36" cy="46" rx="9" ry="11" fill="white"/>
    <ellipse cx="64" cy="46" rx="9" ry="11" fill="white"/>
    <ellipse cx="39" cy="49" rx="5" ry="7" fill="#1a0a3a"/>
    <ellipse cx="67" cy="49" rx="5" ry="7" fill="#1a0a3a"/>
    <circle cx="41" cy="46" r="2" fill="white"/>
    <circle cx="69" cy="46" r="2" fill="white"/>
    <rect x="42" y="62" width="16" height="13" rx="3" fill="white" opacity="0.9"/>
    <path d="M46 62 Q46 55 50 55 Q54 55 54 62" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
    <circle cx="50" cy="68" r="2" fill="#7c3aed"/>
  </svg>
);

export default GhostLogo;