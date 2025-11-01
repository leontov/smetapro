import { useEffect, useState } from 'react';

export const useOfflineQueue = () => {
  const [pendingJobs, setPendingJobs] = useState(0);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setPendingJobs(0);
      navigator.serviceWorker?.controller?.postMessage({ type: 'FLUSH_QUEUE' });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const channel = new BroadcastChannel('offline-queue');
    channel.onmessage = (event) => {
      if (typeof event.data?.size === 'number') {
        setPendingJobs(event.data.size);
      }
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      channel.close();
    };
  }, []);

  return { pendingJobs, isOnline };
};
