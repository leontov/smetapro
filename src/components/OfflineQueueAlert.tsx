import React from 'react';
import { useOfflineQueue } from '../hooks/useOfflineQueue';

export const OfflineQueueAlert: React.FC = () => {
  const { pendingJobs, isOnline } = useOfflineQueue();

  if (isOnline || pendingJobs === 0) return null;

  return (
    <div className="privacy-banner" style={{ left: 16, right: 'auto' }}>
      <strong>Ожидают синхронизации: {pendingJobs}</strong>
      <p style={{ marginTop: 8, fontSize: 14 }}>
        Проверьте соединение — как только сеть появится, мы автоматически отправим данные.
      </p>
    </div>
  );
};
