import React, { useMemo, useState } from 'react';
import { AgentCard } from './AgentCard';
import { AgentForm } from './AgentForm';
import { useAgentStore } from '../state/AgentStore';
import { useEstimate } from '../context/EstimateContext';
import type { AIAgent } from '../data/types';

export const AgentHub: React.FC = () => {
  const {
    agents,
    selectedAgent,
    selectAgent,
    filters,
    setFilters,
    createAgent,
    updateAgent,
    deleteAgent
  } = useAgentStore();
  const { estimates, currentEstimate } = useEstimate();
  const [isCreating, setIsCreating] = useState(false);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    agents.forEach((agent) => agent.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, [agents]);

  const handleCreate = async (payload: Partial<AIAgent> & { tags: string[] }) => {
    await createAgent({
      name: payload.name ?? 'Новый агент',
      description: payload.description ?? '',
      status: payload.status ?? 'draft',
      tags: payload.tags ?? [],
      temperature: payload.temperature ?? 0.2,
      estimateId: payload.estimateId
    });
    setIsCreating(false);
  };

  const handleUpdate = async (payload: Partial<AIAgent> & { tags: string[] }) => {
    if (!selectedAgent) return;
    await updateAgent(selectedAgent.id, {
      ...payload,
      tags: payload.tags
    });
  };

  const handleDelete = async () => {
    if (!selectedAgent) return;
    await deleteAgent(selectedAgent.id);
  };

  return (
    <div className="stack">
      <div className="panel">
        <div className="stack-row wrap" style={{ alignItems: 'flex-end', gap: '1rem' }}>
          <div className="field" style={{ flex: '1 1 240px' }}>
            <label>Поиск</label>
            <input
              placeholder="Название или описание"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
            />
          </div>
          <div className="field" style={{ width: '180px' }}>
            <label>Статус</label>
            <select value={filters.status} onChange={(event) => setFilters({ status: event.target.value as any })}>
              <option value="all">Все</option>
              <option value="draft">Черновики</option>
              <option value="active">Активные</option>
              <option value="archived">Архив</option>
            </select>
          </div>
          <div className="field" style={{ width: '220px' }}>
            <label>Смета</label>
            <select value={filters.estimateId ?? ''} onChange={(event) => setFilters({ estimateId: event.target.value || undefined })}>
              <option value="">Все сметы</option>
              {estimates.map((estimate) => (
                <option key={estimate.id} value={estimate.id}>
                  {estimate.name}
                </option>
              ))}
            </select>
          </div>
          <button className="primary" type="button" onClick={() => setIsCreating(true)}>
            Новый агент
          </button>
        </div>
        <div className="stack-row wrap" style={{ marginTop: '1rem' }}>
          {availableTags.map((tag) => {
            const isActive = filters.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={isActive ? 'badge' : 'badge neutral'}
                onClick={() => {
                  if (isActive) {
                    setFilters({ tags: filters.tags.filter((item) => item !== tag) });
                  } else {
                    setFilters({ tags: [...filters.tags, tag] });
                  }
                }}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid cols-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onSelect={selectAgent} isActive={selectedAgent?.id === agent.id} />
        ))}
        {agents.length === 0 && <p>Агенты не найдены. Создайте нового или измените фильтры.</p>}
      </div>

      {(isCreating || selectedAgent) && (
        <div className="panel">
          <AgentForm
            mode={isCreating ? 'create' : 'edit'}
            agent={isCreating ? undefined : selectedAgent}
            onSubmit={isCreating ? handleCreate : handleUpdate}
            onDelete={isCreating ? undefined : handleDelete}
          />
          {isCreating && (
            <button style={{ marginTop: '1rem' }} onClick={() => setIsCreating(false)} type="button">
              Отмена
            </button>
          )}
        </div>
      )}

      {currentEstimate && (
        <div className="panel">
          <h3>Текущая смета</h3>
          <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>{currentEstimate.name}</p>
          <div className="stack-row wrap">
            <span className="badge neutral">Бюджет: {currentEstimate.budget.toLocaleString('ru-RU')} {currentEstimate.currency}</span>
            {currentEstimate.notes && <span className="badge">{currentEstimate.notes}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
