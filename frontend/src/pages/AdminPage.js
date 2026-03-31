import React, { useState, useEffect } from 'react';
import {
  Shield, Ban, Trash2, RefreshCw, Users, FileText,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  Eye, EyeOff, Clock, Activity
} from 'lucide-react';
import {
  adminFetchIPList, adminFetchPosts, adminBlockIP, adminUnblockIP,
  adminRemoveUserContent, adminDeletePost, adminHidePost
} from '../utils/api';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const StatusBadge = ({ blocked }) => (
  <span className="px-2 py-0.5 rounded-full text-xs font-mono"
    style={{
      background: blocked ? 'rgba(255,107,107,0.15)' : 'rgba(107,255,160,0.1)',
      color: blocked ? '#ff6b6b' : '#6bffa0',
      border: `1px solid ${blocked ? 'rgba(255,107,107,0.3)' : 'rgba(107,255,160,0.2)'}`,
    }}>
    {blocked ? '⛔ Blocked' : '✓ Active'}
  </span>
);

const SectionHeader = ({ icon: Icon, title, count }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ background: 'rgba(124,107,255,0.15)', border: '1px solid rgba(124,107,255,0.3)' }}>
      <Icon size={16} style={{ color: '#7c6bff' }} />
    </div>
    <div>
      <h2 className="font-display font-bold text-white text-base m-0">{title}</h2>
      {count !== undefined && <p className="text-xs m-0" style={{ color: '#6b6b8a' }}>{count} entries</p>}
    </div>
  </div>
);

const AdminPage = () => {
  const [tab, setTab] = useState('ips'); // 'ips' | 'posts'
  const [ipList, setIpList] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedIP, setExpandedIP] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadIPs = async () => {
    setLoading(true);
    try {
      const data = await adminFetchIPList();
      setIpList(data.ipList || []);
    } catch (err) {
      showToast('Failed to load IP list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await adminFetchPosts();
      setPosts(data.posts || []);
    } catch (err) {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'ips') loadIPs();
    else loadPosts();
  }, [tab]); // eslint-disable-line

  const handleBlockIP = async (ip) => {
    try {
      await adminBlockIP(ip, 'Blocked by admin');
      setIpList(prev => prev.map(i => i.ipAddress === ip ? { ...i, isBlocked: true } : i));
      showToast(`IP ${ip} blocked`);
    } catch (err) {
      showToast('Failed to block IP', 'error');
    }
  };

  const handleUnblockIP = async (ip) => {
    try {
      await adminUnblockIP(ip);
      setIpList(prev => prev.map(i => i.ipAddress === ip ? { ...i, isBlocked: false } : i));
      showToast(`IP ${ip} unblocked`);
    } catch (err) {
      showToast('Failed to unblock IP', 'error');
    }
  };

  const handleRemoveContent = async (ip) => {
    setConfirmAction({
      message: `Remove ALL posts & comments from ${ip}?`,
      onConfirm: async () => {
        try {
          const result = await adminRemoveUserContent(ip);
          showToast(`Removed ${result.postsRemoved} posts, ${result.commentsRemoved} comments`);
          loadIPs();
          setConfirmAction(null);
        } catch (err) {
          showToast('Failed to remove content', 'error');
        }
      },
    });
  };

  const handleDeletePost = async (postId) => {
    try {
      await adminDeletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
      showToast('Post deleted');
    } catch (err) {
      showToast('Failed to delete post', 'error');
    }
  };

  const handleHidePost = async (postId) => {
    try {
      await adminHidePost(postId);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, isHidden: true } : p));
      showToast('Post hidden from feed');
    } catch (err) {
      showToast('Failed to hide post', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">
      {/* Header */}
      <div className="mb-6 p-5 rounded-2xl"
        style={{ background: 'rgba(26,26,38,0.8)', border: '1px solid rgba(124,107,255,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c6bff, #4a3fa0)', boxShadow: '0 0 20px rgba(124,107,255,0.4)' }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white m-0">Moderation Panel</h1>
            <p className="text-sm m-0" style={{ color: '#6b6b8a' }}>Barly Secret — Admin Control Center</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 p-2 rounded-lg"
          style={{ background: 'rgba(255,200,50,0.08)', border: '1px solid rgba(255,200,50,0.2)' }}>
          <AlertTriangle size={12} style={{ color: '#ffc832' }} />
          <span className="text-xs" style={{ color: '#ffc832' }}>
            This panel has no authentication. Restrict access in production.
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'ips', label: 'IP Management', icon: Users },
          { id: 'posts', label: 'Post Monitor', icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: tab === id ? 'linear-gradient(135deg, rgba(124,107,255,0.3), rgba(74,63,160,0.3))' : 'rgba(26,26,38,0.6)',
              border: `1px solid ${tab === id ? 'rgba(124,107,255,0.5)' : 'rgba(42,42,61,0.6)'}`,
              color: tab === id ? '#9d8fff' : '#6b6b8a',
              cursor: 'pointer',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
        <button
          onClick={() => tab === 'ips' ? loadIPs() : loadPosts()}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200"
          style={{ background: 'rgba(26,26,38,0.6)', border: '1px solid rgba(42,42,61,0.6)', color: '#6b6b8a', cursor: 'pointer' }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* IP Tab */}
      {tab === 'ips' && (
        <div>
          <SectionHeader icon={Users} title="IP Activity Log" count={ipList.length} />
          {loading ? (
            <div className="text-center py-10" style={{ color: '#6b6b8a' }}>Loading…</div>
          ) : ipList.length === 0 ? (
            <div className="text-center py-10 rounded-xl" style={{ border: '1px dashed rgba(42,42,61,0.6)', color: '#6b6b8a' }}>
              No activity recorded yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ipList.map((entry) => (
                <div
                  key={entry.ipAddress}
                  className="rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    background: 'rgba(26,26,38,0.7)',
                    border: `1px solid ${entry.isBlocked ? 'rgba(255,107,107,0.3)' : 'rgba(42,42,61,0.6)'}`,
                  }}
                >
                  {/* Row */}
                  <div
                    className="flex flex-wrap items-center gap-3 p-4 cursor-pointer"
                    onClick={() => setExpandedIP(expandedIP === entry.ipAddress ? null : entry.ipAddress)}
                  >
                    <Activity size={14} style={{ color: entry.isBlocked ? '#ff6b6b' : '#6bffa0', flexShrink: 0 }} />
                    <code className="text-sm font-mono flex-1" style={{ color: '#9d8fff' }}>{entry.ipAddress}</code>
                    <StatusBadge blocked={entry.isBlocked} />
                    <div className="flex items-center gap-3 text-xs" style={{ color: '#6b6b8a' }}>
                      <span>{entry.postCount} posts</span>
                      <span>{entry.commentCount} comments</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {timeAgo(entry.lastSeen)}
                      </span>
                    </div>
                    {expandedIP === entry.ipAddress ? <ChevronUp size={14} style={{ color: '#6b6b8a' }} /> : <ChevronDown size={14} style={{ color: '#6b6b8a' }} />}
                  </div>

                  {/* Expanded */}
                  {expandedIP === entry.ipAddress && (
                    <div className="px-4 pb-4 animate-fade-in" style={{ borderTop: '1px solid rgba(42,42,61,0.4)' }}>
                      <div className="pt-3 mb-3">
                        <p className="text-xs mb-1" style={{ color: '#6b6b8a' }}>Usernames used:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(entry.usernames || []).map((u, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs font-mono"
                              style={{ background: 'rgba(124,107,255,0.1)', color: '#9d8fff', border: '1px solid rgba(124,107,255,0.2)' }}>
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {entry.isBlocked ? (
                          <button
                            onClick={() => handleUnblockIP(entry.ipAddress)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                            style={{ background: 'rgba(107,255,160,0.1)', border: '1px solid rgba(107,255,160,0.3)', color: '#6bffa0', cursor: 'pointer' }}
                          >
                            <CheckCircle size={12} />
                            Unblock IP
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockIP(entry.ipAddress)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                            style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', cursor: 'pointer' }}
                          >
                            <Ban size={12} />
                            Block User
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveContent(entry.ipAddress)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                          style={{ background: 'rgba(255,150,50,0.1)', border: '1px solid rgba(255,150,50,0.3)', color: '#ff9632', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                          Remove All Content
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {tab === 'posts' && (
        <div>
          <SectionHeader icon={FileText} title="Post Monitor" count={posts.length} />
          {loading ? (
            <div className="text-center py-10" style={{ color: '#6b6b8a' }}>Loading…</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 rounded-xl" style={{ border: '1px dashed rgba(42,42,61,0.6)', color: '#6b6b8a' }}>
              No posts found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map(post => (
                <div
                  key={post._id}
                  className="p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: post.isHidden ? 'rgba(26,26,38,0.4)' : 'rgba(26,26,38,0.7)',
                    border: `1px solid ${post.isHidden ? 'rgba(42,42,61,0.3)' : 'rgba(42,42,61,0.6)'}`,
                    opacity: post.isHidden ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono" style={{ color: '#7c6bff' }}>{post.anonUsername}</span>
                        <span className="text-xs" style={{ color: '#3d3d5c' }}>·</span>
                        <code className="text-xs" style={{ color: '#6b6b8a' }}>{post.ipAddress}</code>
                        {post.isHidden && (
                          <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(255,150,50,0.1)', color: '#ff9632', border: '1px solid rgba(255,150,50,0.3)' }}>
                            Hidden
                          </span>
                        )}
                      </div>
                      <span className="text-xs" style={{ color: '#3d3d5c' }}>{timeAgo(post.createdAt)}</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {!post.isHidden && (
                        <button
                          onClick={() => handleHidePost(post._id)}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          style={{ background: 'rgba(255,150,50,0.1)', border: '1px solid rgba(255,150,50,0.3)', color: '#ff9632', cursor: 'pointer' }}
                          title="Hide from feed"
                        >
                          <EyeOff size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-1.5 rounded-lg transition-all duration-200"
                        style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', cursor: 'pointer' }}
                        title="Delete permanently"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed m-0 line-clamp-3" style={{ color: '#c8c8d8' }}>
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#6b6b8a' }}>
                    <span>{post.commentCount || 0} comments</span>
                    <span>{Object.values(post.reactionCounts || {}).reduce((a, b) => a + b, 0)} reactions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div className="w-full max-w-sm rounded-2xl p-6 animate-slide-up"
            style={{ background: '#1a1a26', border: '1px solid rgba(255,107,107,0.4)', boxShadow: '0 0 40px rgba(255,107,107,0.15)' }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} style={{ color: '#ff9632' }} />
              <h3 className="font-display font-bold text-white m-0 text-base">Confirm Action</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: '#c8c8d8' }}>{confirmAction.message}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-lg text-sm transition-all duration-200"
                style={{ background: 'rgba(42,42,61,0.6)', border: '1px solid rgba(42,42,61,0.8)', color: '#6b6b8a', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)', color: '#ff6b6b', cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium animate-slide-up flex items-center gap-2"
          style={{
            background: toast.type === 'error' ? 'rgba(255,107,107,0.15)' : 'rgba(107,255,160,0.12)',
            border: `1px solid ${toast.type === 'error' ? 'rgba(255,107,107,0.4)' : 'rgba(107,255,160,0.3)'}`,
            color: toast.type === 'error' ? '#ff6b6b' : '#6bffa0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {toast.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
