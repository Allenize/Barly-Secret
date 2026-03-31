import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FeedPage from './pages/FeedPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Navbar onCreatePost={() => setShowCreate(true)} />
      <Routes>
        <Route
          path="/"
          element={
            <FeedPage
              showCreate={showCreate}
              onCreateClose={() => setShowCreate(false)}
            />
          }
        />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

export default App;
