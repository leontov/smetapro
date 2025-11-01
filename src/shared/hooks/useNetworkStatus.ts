import { useEffect } from 'react';

import { selectIsOnline, useNetworkStatusStore } from '@shared/store/networkStatus';

export const useNetworkStatus = () => {
  const isOnline = useNetworkStatusStore(selectIsOnline);
  const setOnline = useNetworkStatusStore((state) => state.setOnline);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return isOnline;
};
