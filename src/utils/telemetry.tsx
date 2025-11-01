import React, { createContext, useContext, useEffect, useMemo } from 'react';
import posthog from 'posthog-js';
import LogRocket from 'logrocket';

interface TelemetryContextValue {
  track: (event: string, payload?: Record<string, unknown>) => void;
}

const TelemetryContext = createContext<TelemetryContextValue>({
  track: () => undefined
});

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY ?? 'phc_mock_key';
const LOGROCKET_KEY = import.meta.env.VITE_LOGROCKET_KEY ?? 'smetapro/demo';

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    posthog.init(POSTHOG_KEY, { api_host: 'https://app.posthog.com', loaded: (client) => client.opt_in_capturing() });
    LogRocket.init(LOGROCKET_KEY);
    posthog.capture('app_loaded');
  }, []);

  const value = useMemo(
    () => ({
      track: (event: string, payload?: Record<string, unknown>) => {
        posthog.capture(event, payload);
        LogRocket.track(event);
      }
    }),
    []
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
};

export const useTelemetry = () => useContext(TelemetryContext);
