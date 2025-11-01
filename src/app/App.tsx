import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import { queryClient } from '@shared/lib/queryClient';
import { useNetworkStatus } from '@shared/hooks/useNetworkStatus';

import { createAppRouter } from './router';

const router = createAppRouter();

const App = () => {
  const isOnline = useNetworkStatus();

  useEffect(() => {
    const unregister = registerSW({
      immediate: true,
      onRegisteredSW: (_, registration) => {
        if (registration?.update) {
          void registration
            .update()
            .catch((error) => {
              console.error('Service worker update failed', error);
            });
        }
      }
    });

    return () => {
      if (unregister) {
        void unregister();
      }
    };
  }, []);

  useEffect(() => {
    document.body.dataset.network = isOnline ? 'online' : 'offline';
  }, [isOnline]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
