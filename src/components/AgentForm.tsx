import React, { useEffect, useMemo, useState } from 'react';
import type { AIAgent, AgentStatus } from '../data/types';
import { useEstimate } from '../context/EstimateContext';

interface AgentFormProps {
  agent?: AIAgent;
  onSubmit: (payload: Partial<AIAgent> & { tags: string[] }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  mode: 'create' | 'edit';
}

const statusOptions: { label: string; value: AgentStatus }[] = [
  { label: 'Черновик', value: 'draft' },
  { label: 'Активен', value: 'active' },
  { label: 'Архив', value: 'archived' }
];

export const AgentForm: React.FC<AgentFormProps> = ({ agent, onSubmit, onDelete, mode }) => {
  const { estimates } = useEstimate();
  const [name, setName] = useState(agent?.name ?? '');
  const [description, setDescription] = useState(agent?.description ?? '');
  const [status, setStatus] = useState<AgentStatus>(agent?.status ?? 'draft');
  const [tags, setTags] = useState(agent?.tags.join(', ') ?? '');
  const [temperature, setTemperature] = useState(agent?.temperature ?? 0.2);
  const [estimateId, setEstimateId] = useState<string | undefined>(agent?.estimateId);

  useEffect(() => {
    setName(agent?.name ?? '');
    setDescription(agent?.description ?? '');
    setStatus(agent?.status ?? 'draft');
    setTags(agent?.tags.join(', ') ?? '');
    setTemperature(agent?.temperature ?? 0.2);
    setEstimateId(agent?.estimateId);
  }, [agent]);

  const parsedTags = useMemo(
    () =>
      tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      name,
      description,
      status,
      tags: parsedTags,
      temperature,
      estimateId
    });
  };

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <h3>{mode === 'create' ? 'Новый агент' : 'Редактирование агента'}</h3>
      <div className="field">
        <label htmlFor="agent-name">Название</label>
        <input id="agent-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Проверка сметы" required />
      </div>
      <div className="field">
        <label htmlFor="agent-description">Описание</label>
        <textarea
          id="agent-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Что делает агент, какие этапы покрывает"
        />
      </div>
      <div className="field">
        <label htmlFor="agent-tags">Теги (через запятую)</label>
        <input id="agent-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="смета, проверки, закупки" />
      </div>
      <div className="field">
        <label htmlFor="agent-status">Статус</label>
        <select id="agent-status" value={status} onChange={(event) => setStatus(event.target.value as AgentStatus)}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="agent-temperature">Температура (креативность): {temperature.toFixed(2)}</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          id="agent-temperature"
          value={temperature}
          onChange={(event) => setTemperature(Number(event.target.value))}
        />
      </div>
      <div className="field">
        <label htmlFor="agent-estimate">Привязка к смете</label>
        <select id="agent-estimate" value={estimateId ?? ''} onChange={(event) => setEstimateId(event.target.value || undefined)}>
          <option value="">Без привязки</option>
          {estimates.map((estimate) => (
            <option key={estimate.id} value={estimate.id}>
              {estimate.name}
            </option>
          ))}
        </select>
      </div>
      <div className="stack-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="primary" type="submit">
          {mode === 'create' ? 'Создать агента' : 'Сохранить изменения'}
        </button>
        {mode === 'edit' && onDelete && (
          <button type="button" style={{ color: '#b91c1c' }} onClick={() => onDelete()}>
            Удалить
          </button>
        )}
      </div>
    </form>
  );
};
