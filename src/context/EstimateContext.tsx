import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Estimate } from '../data/types';

interface EstimateContextValue {
  estimates: Estimate[];
  currentEstimate?: Estimate;
  selectEstimate: (id?: string) => void;
  upsertEstimate: (estimate: Estimate) => void;
}

const EstimateContext = createContext<EstimateContextValue | undefined>(undefined);

const demoEstimates: Estimate[] = [
  {
    id: 'estimate-1',
    name: 'ЖК Полет — отделочные работы',
    budget: 1250000,
    currency: 'RUB',
    notes: 'Требуется оптимизация закупок плитки и электрики.'
  },
  {
    id: 'estimate-2',
    name: 'Бизнес-центр Невский',
    budget: 2890000,
    currency: 'RUB',
    notes: 'Проверить соответствие ФЕР 2024.'
  }
];

export const EstimateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [estimates, setEstimates] = useState<Estimate[]>(demoEstimates);
  const [currentEstimateId, setCurrentEstimateId] = useState<string | undefined>(demoEstimates[0]?.id);

  const selectEstimate = (id?: string) => {
    setCurrentEstimateId(id);
  };

  const upsertEstimate = (estimate: Estimate) => {
    setEstimates((prev) => {
      const exists = prev.some((item) => item.id === estimate.id);
      if (exists) {
        return prev.map((item) => (item.id === estimate.id ? estimate : item));
      }
      return [...prev, estimate];
    });
    setCurrentEstimateId(estimate.id);
  };

  const value = useMemo<EstimateContextValue>(() => {
    return {
      estimates,
      currentEstimate: estimates.find((item) => item.id === currentEstimateId),
      selectEstimate,
      upsertEstimate
    };
  }, [estimates, currentEstimateId]);

  return <EstimateContext.Provider value={value}>{children}</EstimateContext.Provider>;
};

export const useEstimate = () => {
  const context = useContext(EstimateContext);
  if (!context) {
    throw new Error('useEstimate необходимо вызывать внутри EstimateProvider');
  }
  return context;
};
