import { useState, useEffect } from 'react';
import { Status } from '@/types/status';
import { statusService } from '@/lib/services/statusService';

export function useStatus() {
  const [status, setStatus] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const data = await statusService.getStatus();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return { status, loading, error };
}