import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPriceSources } from '../services/api';

export interface PriceSource {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  enabled: boolean;
  latencyMs: number;
}

interface ContextValue {
  sources?: PriceSource[];
  isLoading: boolean;
  refetch: () => void;
}

const PriceSourceContext = createContext<ContextValue>({
  isLoading: false,
  refetch: () => undefined
});

export const PriceSourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['priceSources'],
    queryFn: fetchPriceSources
  });

  return (
    <PriceSourceContext.Provider value={{ sources: data, isLoading, refetch }}>
      {children}
    </PriceSourceContext.Provider>
  );
};

export const usePriceSources = () => useContext(PriceSourceContext);
