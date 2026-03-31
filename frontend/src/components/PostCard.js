import React, { useState } from 'react';
import { Trash2, UserCircle2, Clock } from 'lucide-react';
import ReactionBar from './ReactionBar';
import CommentSection from './CommentSection';
import { deletePost, reactToPost } from '../utils/api';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

const PostCard = ({ post, sessionId, onDeleted }) => {
  const [reactionCounts, setReactionCounts] = useState(post.reactionCounts || {});
  const [userReaction, setUserReaction] = useState(post.userReaction || null);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [deleting, setDeleting] = useState(false);
  const [imgExpanded, setImgExpanded] = useState(false);
  const isOwner = post.sessionId === sessionId;

  const handleReact = async (type) => {
    try {
      const data = await reactToPost(post._id, type);
      setReactionCounts(data.reactionCounts);
      setUserReaction(data.userReaction);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await deletePost(post._id);
      onDeleted(post._id);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  return (
    <article
      className="rounded-xl p-4 animate-slide-up transition-all duration-300"
      style={{
        background: 'rgba(26,26,38,0.7)',
        border: '1px solid rgba(42,42,61,0.6)',
        backdropFilter: 'blur(10px)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,107,255,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(42,42,61,0.6)'}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4a3fa0, #7c6bff)' }}>
            <UserCircle2 size={14} color="white" />
          </div>
          <div>
            <span className="text-sm font-mono font-bold" style={{ color: '#9d8fff' }}>{post.anonUsername}</span>
            <div className="flex items-center gap-1">
              <Clock size={10} style={{ color: '#3d3d5c' }} />
              <span className="text-xs" style={{ color: '#3d3d5c' }}>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            style={{ color: '#6b6b8a', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b6b8a'; e.currentTarget.style.background = 'none'; }}
            title="Delete post"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words" style={{ color: '#d8d8e8', margin: '0 0 12px 0' }}>
        {post.content}
      </p>

      {/* Image */}
      {post.imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden cursor-pointer" onClick={() => setImgExpanded(v => !v)}>
          <img
            src={`${process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'}${post.imageUrl}`}
            alt="Post attachment"
            className="w-full object-cover transition-all duration-300"
            style={{ maxHeight: imgExpanded ? 'none' : '240px', borderRadius: '8px' }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(42,42,61,0.4)' }}>
        <ReactionBar
          reactionCounts={reactionCounts}
          userReaction={userReaction}
          onReact={handleReact}
        />
        <CommentSection
          postId={post._id}
          sessionId={sessionId}
          commentCount={commentCount}
          onNewComment={() => setCommentCount(c => c + 1)}
        />
      </div>
    </article>
  );
};

export default PostCard;