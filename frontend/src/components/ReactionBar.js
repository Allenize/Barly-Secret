import React from 'react';

const REACTIONS = [
  { type: 'crazy',      emoji: '🤪', label: 'Crazy' },
  { type: 'cop',        emoji: '👮', label: 'Cop' },
  { type: 'hot',        emoji: '🥵', label: 'Hot' },
  { type: 'scared',     emoji: '😱', label: 'Scared' },
  { type: 'suggestive', emoji: '👉👌', label: 'Suggestive' },
];

const ReactionBar = ({ reactionCounts = {}, userReaction, onReact, disabled }) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTIONS.map(({ type, emoji, label }) => {
        const count = reactionCounts[type] || 0;
        const isActive = userReaction === type;
        return (
          <button
            key={type}
            onClick={() => !disabled && onReact(type)}
            title={label}
            disabled={disabled}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all duration-200 select-none"
            style={{
              background: isActive ? 'rgba(124,107,255,0.25)' : 'rgba(42,42,61,0.5)',
              border: `1px solid ${isActive ? 'rgba(124,107,255,0.6)' : 'rgba(42,42,61,0.8)'}`,
              transform: isActive ? 'scale(1.08)' : 'scale(1)',
              cursor: disabled ? 'default' : 'pointer',
              boxShadow: isActive ? '0 0 8px rgba(124,107,255,0.3)' : 'none',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>{emoji}</span>
            {/* Always show count badge */}
            <span style={{
              fontSize: '11px',
              color: isActive ? '#9d8fff' : '#6b6b8a',
              fontFamily: 'Space Mono, monospace',
              fontWeight: '700',
              minWidth: '10px',
            }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBar;