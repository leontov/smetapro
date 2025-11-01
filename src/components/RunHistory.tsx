import React, { useMemo, useState } from 'react';
import { useAgentStore } from '../state/AgentStore';

export const RunHistory: React.FC = () => {
  const { runs, selectedAgent, refreshRuns } = useAgentStore();
  const [expandedRunId, setExpandedRunId] = useState<string | undefined>();

  const title = useMemo(
    () =>
      selectedAgent
        ? `История запусков агента «${selectedAgent.name}»`
        : 'История запусков по всем агентам',
    [selectedAgent]
  );

  return (
    <div className="stack">
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <p style={{ margin: 0, color: '#6b7280' }}>Последние сценарии с логами и статусами.</p>
        </div>
        <button type="button" onClick={() => refreshRuns()}>
          Обновить
        </button>
      </div>
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Агент</th>
              <th>Статус</th>
              <th>Запущен</th>
              <th>Завершен</th>
              <th>Повторы</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <React.Fragment key={run.id}>
                <tr>
                  <td>{run.id.slice(0, 8)}</td>
                  <td>{run.agentId}</td>
                  <td>
                    <span className={`badge ${run.status === 'succeeded' ? 'success' : run.status === 'failed' ? 'error' : 'neutral'}`}>
                      {run.status}
                    </span>
                  </td>
                  <td>{new Date(run.startedAt).toLocaleString()}</td>
                  <td>{run.finishedAt ? new Date(run.finishedAt).toLocaleString() : '—'}</td>
                  <td>{run.retryCount}</td>
                  <td>
                    <button type="button" onClick={() => setExpandedRunId(expandedRunId === run.id ? undefined : run.id)}>
                      {expandedRunId === run.id ? 'Скрыть логи' : 'Показать логи'}
                    </button>
                  </td>
                </tr>
                {expandedRunId === run.id && (
                  <tr>
                    <td colSpan={7}>
                      <div className="stack" style={{ background: '#f9fafb', borderRadius: 12, padding: '0.75rem' }}>
                        {run.logs.length === 0 && <p style={{ margin: 0 }}>Логи отсутствуют.</p>}
                        {run.logs.map((log) => (
                          <div key={log.id} className="stack-row" style={{ justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{new Date(log.timestamp).toLocaleString()}</span>
                            <span style={{ flex: 1, marginLeft: '1rem' }}>{log.message}</span>
                            <span className={`badge ${log.level === 'error' ? 'error' : log.level === 'warn' ? 'neutral' : 'success'}`}>
                              {log.level}
                            </span>
                          </div>
                        ))}
                        {run.error && <div style={{ color: '#b91c1c' }}>Ошибка: {run.error}</div>}
                        {run.output && <div style={{ whiteSpace: 'pre-wrap' }}>Результат: {run.output}</div>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {runs.length === 0 && <p>Запусков пока не было.</p>}
      </div>
    </div>
  );
};
