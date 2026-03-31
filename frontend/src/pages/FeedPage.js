import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import { fetchPosts } from '../utils/api';
import { useSession } from '../hooks/useSession';
import { RefreshCw, Ghost } from 'lucide-react';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const SkeletonCard = () => (
  <div className="rounded-xl p-4" style={{ background: 'rgba(26,26,38,0.7)', border: '1px solid rgba(42,42,61,0.4)' }}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-full animate-pulse" style={{ background: 'rgba(42,42,61,0.8)' }} />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'rgba(42,42,61,0.8)' }} />
        <div className="h-2 w-16 rounded animate-pulse" style={{ background: 'rgba(42,42,61,0.5)' }} />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className="h-3 rounded animate-pulse" style={{ background: 'rgba(42,42,61,0.6)' }} />
      <div className="h-3 w-4/5 rounded animate-pulse" style={{ background: 'rgba(42,42,61,0.6)' }} />
      <div className="h-3 w-3/5 rounded animate-pulse" style={{ background: 'rgba(42,42,61,0.4)' }} />
    </div>
  </div>
);

const FeedPage = ({ showCreate, onCreateClose }) => {
  const sessionId = useSession();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const socketRef = useRef(null);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('post:new', () => setLiveCount(c => c + 1));
    socket.on('post:deleted', ({ postId }) => setPosts(prev => prev.filter(p => p._id !== postId)));
    socket.on('post:reaction', ({ postId, reactionCounts }) =>
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, reactionCounts } : p))
    );
    socket.on('comment:new', ({ postId }) =>
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
    );

    return () => socket.disconnect();
  }, []);

  const loadPosts = useCallback(async (pageNum = 1, replace = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchPosts(pageNum);
      setPosts(prev => replace ? data.posts : [...prev, ...data.posts]);
      setHasMore(pageNum < data.pages);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadPosts(1, true); }, []);// eslint-disable-line

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) loadPosts(page + 1);
    }, { threshold: 0.1 });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, page, loadPosts]);

  const handleCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const handleRefresh = () => {
    setLiveCount(0);
    loadPosts(1, true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-20 pb-12">
      {/* Live badge */}
      {liveCount > 0 && (
        <button
          onClick={handleRefresh}
          className="w-full mb-4 py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(124,107,255,0.2), rgba(74,63,160,0.2))',
            border: '1px solid rgba(124,107,255,0.4)',
            color: '#9d8fff',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(124,107,255,0.1)',
          }}
        >
          <RefreshCw size={14} />
          {liveCount} new post{liveCount !== 1 ? 's' : ''} — click to refresh
        </button>
      )}

      {/* Feed */}
      {initialLoad ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Ghost size={40} style={{ color: '#3d3d5c' }} />
          <div className="text-center">
            <h2 className="font-display font-bold text-lg text-white m-0">The void is empty.</h2>
            <p className="text-sm mt-1 m-0" style={{ color: '#6b6b8a' }}>Be the first to post something anonymously.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              sessionId={sessionId}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {loading && !initialLoad && (
        <div className="text-center py-6 text-sm flex items-center justify-center gap-2" style={{ color: '#6b6b8a' }}>
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Loading more…
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-xs py-4" style={{ color: '#3d3d5c' }}>— end of feed —</p>
      )}

      {/* Modal */}
      {showCreate && sessionId && (
        <CreatePost sessionId={sessionId} onCreated={handleCreated} onClose={onCreateClose} />
      )}
    </div>
  );
};

export default FeedPage;
