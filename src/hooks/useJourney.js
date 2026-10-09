import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000';

export const useJourney = (batchId) => {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  const fetchJourney = useCallback(async (id) => {
    if (!id) {
      setJourney(null);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/journey/${encodeURIComponent(id.trim().toUpperCase())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setJourney(data);
      } else {
        setError(data.error || 'Batch not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch journey');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJourney(batchId);
  }, [batchId, fetchJourney]);

  // Socket.io live journey listener
  useEffect(() => {
    if (!batchId) return;

    const socket = io(API_BASE, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('journey-update', (data) => {
      if (data && data.batchId && data.batchId.toUpperCase() === batchId.trim().toUpperCase()) {
        fetchJourney(batchId);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [batchId, fetchJourney]);

  const refetch = useCallback(() => {
    return fetchJourney(batchId);
  }, [batchId, fetchJourney]);

  return { journey, loading, error, refetch };
};
