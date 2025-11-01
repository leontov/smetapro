import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePriceSources } from '../state/PriceSourceContext';
import { fetchAgentStatus, updatePriceSource } from '../services/api';
import { useTelemetry } from '../utils/telemetry';

const PriceSourcesPage: React.FC = () => {
  const { sources, isLoading, refetch } = usePriceSources();
  const telemetry = useTelemetry();
  const { data: agentStatus } = useQuery({ queryKey: ['agentStatus'], queryFn: fetchAgentStatus, refetchInterval: 60_000 });
  const mutation = useMutation({
    mutationFn: updatePriceSource,
    onSuccess: () => {
      telemetry.track('price_source_updated');
      refetch();
    }
  });

  if (isLoading || !sources) return <div>Загружаем источники…</div>;

  return (
    <div>
      <h2>Источники цен</h2>
      <p>Переключайте источники для актуализации смет. Поддерживаются mock и production API.</p>
      {agentStatus?.lastNotification && (
        <div className="kpi-card" style={{ margin: '16px 0' }}>
          <strong>Последнее обновление:</strong>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Source: {agentStatus.lastNotification.sourceId} · Позиций: {agentStatus.lastNotification.items} ·{' '}
            {new Date(agentStatus.lastNotification.timestamp).toLocaleString('ru-RU')}
          </div>
        </div>
      )}
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 24 }}>
        {sources.map((source) => (
          <li
            key={source.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              marginBottom: 12,
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 20px rgba(15,23,42,0.08)'
            }}
          >
            <div>
              <strong>{source.name}</strong>
              <div style={{ fontSize: 12, color: '#64748b' }}>{source.provider}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{source.endpoint}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Latency: {source.latencyMs}ms</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12 }}>{source.enabled ? 'Включен' : 'Выключен'}</span>
                <input
                  type="checkbox"
                  checked={source.enabled}
                  onChange={(event) =>
                    mutation.mutate({ id: source.id, enabled: event.target.checked })
                  }
                />
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PriceSourcesPage;
