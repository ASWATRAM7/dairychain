import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000';

export const useBlockchain = () => {
  const [ready, setReady] = useState(false);
  const [contractAddress, setContractAddress] = useState(null);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchStatus = () => {
      fetch(`${API_BASE}/api/blockchain/status`)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          setReady(!!data.ready);
          setContractAddress(data.contractAddress);
          setTotalLogs(data.totalLogs || 0);
          setLoading(false);
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { ready, contractAddress, totalLogs, loading };
};
