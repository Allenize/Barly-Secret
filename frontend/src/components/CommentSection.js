import React, { useState, useEffect } from 'react';
import { fetchComments, createComment } from '../utils/api';
import { Send, MessageCircle, UserCircle2 } from 'lucide-react';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const CommentSection = ({ postId, sessionId, commentCount, onNewComment }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && comments.length === 0) {
      setLoading(true);
      fetchComments(postId)
        .then(setComments)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, postId, comments.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !sessionId || submitting) return;
    setSubmitting(true);
    try {
      const comment = await createComment(postId, text.trim());
      setComments(prev => [comment, ...prev]);
      setText('');
      if (onNewComment) onNewComment();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm transition-colors duration-200"
        style={{ color: open ? '#7c6bff' : '#6b6b8a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <MessageCircle size={14} />
        <span>{commentCount || 0} {commentCount === 1 ? 'comment' : 'comments'}</span>
      </button>

      {open && (
        <div className="mt-3 animate-fade-in">
          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment anonymously..."
              maxLength={1000}
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(26,26,38,0.8)',
                border: '1px solid rgba(42,42,61,0.8)',
                color: '#e8e8f0',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,107,255,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(42,42,61,0.8)'}
            />
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center"
              style={{
                background: text.trim() ? 'linear-gradient(135deg, #7c6bff, #4a3fa0)' : 'rgba(42,42,61,0.5)',
                color: text.trim() ? 'white' : '#6b6b8a',
                border: 'none',
                cursor: text.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={14} />
            </button>
          </form>

          {/* Comments list */}
          {loading ? (
            <div className="text-sm text-center py-3" style={{ color: '#6b6b8a' }}>Loading…</div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-center py-3" style={{ color: '#6b6b8a' }}>No comments yet. Be the first.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {comments.map(comment => (
                <div
                  key={comment._id}
                  className="p-3 rounded-lg animate-fade-in"
                  style={{ background: 'rgba(26,26,38,0.6)', border: '1px solid rgba(42,42,61,0.4)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <UserCircle2 size={12} style={{ color: '#4a3fa0' }} />
                    <span className="text-xs font-mono" style={{ color: '#7c6bff' }}>{comment.anonUsername}</span>
                    <span className="text-xs" style={{ color: '#3d3d5c' }}>·</span>
                    <span className="text-xs" style={{ color: '#3d3d5c' }}>{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed m-0" style={{ color: '#c8c8d8' }}>{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
