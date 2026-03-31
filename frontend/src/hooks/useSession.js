import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useSession = () => {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('bs_session_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('bs_session_id', id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
};
