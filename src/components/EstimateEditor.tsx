import React, { useState } from 'react';
import { useEstimate } from '../context/EstimateContext';
import { useAgentStore } from '../state/AgentStore';

export const EstimateEditor: React.FC = () => {
  const { estimates, currentEstimate, selectEstimate } = useEstimate();
  const { selectedAgent, executeAgent } = useAgentStore();
  const [isRunning, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');
  const [error, setError] = useState<string | undefined>();

  const handleRun = async () => {
    if (!selectedAgent || !currentEstimate) return;
    setRunning(true);
    setError(undefined);
    try {
      const result = await executeAgent(selectedAgent.id, currentEstimate);
      setLastResult(result.output);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="stack">
      <div className="panel">
        <h3>Редактор сметы</h3>
        <p style={{ marginTop: 0, color: '#6b7280' }}>
          Выберите смету и запустите привязанного агента прямо из редактора. Результаты появятся ниже.
        </p>
        <div className="stack-row wrap">
          {estimates.map((estimate) => (
            <button
              key={estimate.id}
              type="button"
              onClick={() => selectEstimate(estimate.id)}
              className="card"
              style={{
                border: currentEstimate?.id === estimate.id ? '2px solid #2563eb' : '1px solid transparent',
                textAlign: 'left',
                flex: '1 1 260px'
              }}
            >
              <h4 style={{ marginTop: 0 }}>{estimate.name}</h4>
              <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                Бюджет: {estimate.budget.toLocaleString('ru-RU')} {estimate.currency}
              </p>
              {estimate.notes && <small style={{ color: '#6b7280' }}>{estimate.notes}</small>}
            </button>
          ))}
        </div>
        <div className="stack" style={{ marginTop: '1rem' }}>
          <button className="primary" type="button" onClick={handleRun} disabled={!currentEstimate || !selectedAgent || isRunning}>
            {isRunning ? 'Выполняется...' : 'Запустить агента' }
          </button>
          {!selectedAgent && <p style={{ color: '#b91c1c' }}>Выберите агента в Agent Hub, чтобы выполнить сценарий.</p>}
          {!currentEstimate && <p style={{ color: '#b91c1c' }}>Выберите смету, чтобы продолжить.</p>}
        </div>
      </div>
      {error && (
        <div className="panel" style={{ border: '1px solid #f87171', background: '#fee2e2' }}>
          <strong>Ошибка запуска:</strong> {error}
        </div>
      )}
      {lastResult && (
        <div className="panel">
          <h4>Результат последнего запуска</h4>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{lastResult}</pre>
        </div>
      )}
    </div>
  );
};
