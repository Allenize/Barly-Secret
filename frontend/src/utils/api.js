import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getSessionId = () => localStorage.getItem('bs_session_id') || '';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const sid = getSessionId();
  if (sid) config.headers['x-session-id'] = sid;
  return config;
});

export const fetchPosts = (page = 1, limit = 10) =>
  api.get(`/posts?page=${page}&limit=${limit}`).then(r => r.data);

export const createPost = (formData) =>
  api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const deletePost = (postId) =>
  api.delete(`/posts/${postId}`, { data: { sessionId: getSessionId() } }).then(r => r.data);

export const reactToPost = (postId, type) =>
  api.post(`/posts/${postId}/react`, { type, sessionId: getSessionId() }).then(r => r.data);

export const fetchComments = (postId) =>
  api.get(`/posts/${postId}/comments`).then(r => r.data);

export const createComment = (postId, content) =>
  api.post(`/posts/${postId}/comments`, { content, sessionId: getSessionId() }).then(r => r.data);

// Admin
export const adminFetchIPList = () =>
  api.get('/admin/ip-list').then(r => r.data);

export const adminFetchPosts = (page = 1) =>
  api.get(`/admin/posts?page=${page}&limit=20`).then(r => r.data);

export const adminBlockIP = (ipAddress, reason) =>
  api.post('/admin/block-ip', { ipAddress, reason }).then(r => r.data);

export const adminUnblockIP = (ipAddress) =>
  api.delete('/admin/unblock-ip', { data: { ipAddress } }).then(r => r.data);

export const adminRemoveUserContent = (ipAddress) =>
  api.delete('/admin/remove-user-content', { data: { ipAddress } }).then(r => r.data);

export const adminDeletePost = (postId) =>
  api.delete(`/admin/posts/${postId}`).then(r => r.data);

export const adminHidePost = (postId) =>
  api.patch(`/admin/posts/${postId}/hide`).then(r => r.data);

export const adminRevealPost = (postId) =>
  api.patch(`/admin/posts/${postId}/reveal`).then(r => r.data);

export const adminAnonymizePost = (postId) =>
  api.patch(`/admin/posts/${postId}/anonymize`).then(r => r.data);

export default api;