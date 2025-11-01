import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { PriceSourceProvider } from './state/PriceSourceContext';
import { TelemetryProvider } from './utils/telemetry';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60
    }
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <TelemetryProvider>
      <QueryClientProvider client={queryClient}>
        <PriceSourceProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PriceSourceProvider>
      </QueryClientProvider>
    </TelemetryProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed', error);
    });
  });
}
