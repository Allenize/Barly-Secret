import React, { useState, useRef } from 'react';
import { X, Image, Send, Loader } from 'lucide-react';
import { createPost } from '../utils/api';

const CreatePost = ({ sessionId, onCreated, onClose }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('sessionId', sessionId);
      if (image) formData.append('image', image);

      const newPost = await createPost(formData);
      setContent('');
      removeImage();
      onCreated(newPost);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: '#1a1a26', border: '1px solid rgba(124,107,255,0.3)', boxShadow: '0 0 40px rgba(124,107,255,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(42,42,61,0.6)' }}>
          <div>
            <h2 className="font-display font-bold text-base text-white m-0">New Post</h2>
            <p className="text-xs m-0" style={{ color: '#6b6b8a' }}>Posting anonymously — no trace</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200"
            style={{ background: 'none', border: 'none', color: '#6b6b8a', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(42,42,61,0.5)'; e.currentTarget.style.color = '#e8e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b6b8a'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind? No one will know it's you..."
            rows={5}
            maxLength={5000}
            className="w-full resize-none rounded-xl p-4 text-sm leading-relaxed outline-none transition-all duration-200"
            style={{
              background: 'rgba(10,10,15,0.6)',
              border: '1px solid rgba(42,42,61,0.6)',
              color: '#e8e8f0',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(124,107,255,0.6)'}
            onBlur={e => e.target.style.borderColor = 'rgba(42,42,61,0.6)'}
            autoFocus
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs" style={{ color: content.length > 4500 ? '#ff6b6b' : '#3d3d5c' }}>
              {content.length}/5000
            </span>
          </div>

          {/* Image preview */}
          {preview && (
            <div className="relative mt-3 rounded-xl overflow-hidden">
              <img src={preview} alt="Preview" className="w-full object-cover rounded-xl" style={{ maxHeight: '200px' }} />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(10,10,15,0.8)', border: 'none', cursor: 'pointer', color: 'white' }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {error && (
            <p className="mt-2 text-xs" style={{ color: '#ff6b6b' }}>{error}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
              style={{ background: 'none', border: '1px solid rgba(42,42,61,0.6)', color: '#6b6b8a', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,107,255,0.4)'; e.currentTarget.style.color = '#9d8fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(42,42,61,0.6)'; e.currentTarget.style.color = '#6b6b8a'; }}
            >
              <Image size={14} />
              <span>{image ? 'Change image' : 'Add image'}</span>
            </button>
            <input type="file" ref={fileRef} accept="image/*" onChange={handleImage} className="hidden" />

            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: content.trim() && !submitting ? 'linear-gradient(135deg, #7c6bff, #4a3fa0)' : 'rgba(42,42,61,0.5)',
                color: content.trim() && !submitting ? 'white' : '#6b6b8a',
                border: 'none',
                cursor: content.trim() && !submitting ? 'pointer' : 'not-allowed',
                boxShadow: content.trim() ? '0 0 16px rgba(124,107,255,0.3)' : 'none',
              }}
            >
              {submitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
