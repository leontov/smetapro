import React from 'react';
import type { AIAgent } from '../data/types';

interface AgentCardProps {
  agent: AIAgent;
  onSelect: (id: string) => void;
  isActive?: boolean;
}

const statusClass = (status: AIAgent['status']) => {
  switch (status) {
    case 'active':
      return 'badge success';
    case 'archived':
      return 'badge neutral';
    default:
      return 'badge';
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, isActive }) => {
  return (
    <div
      className="card"
      style={{
        cursor: 'pointer',
        border: isActive ? '2px solid #2563eb' : '1px solid transparent',
        transition: 'border 0.2s ease'
      }}
      onClick={() => onSelect(agent.id)}
    >
      <div className="stack">
        <div className="stack-row wrap" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{agent.name}</h3>
          <span className={statusClass(agent.status)}>{agent.status === 'draft' ? 'Черновик' : agent.status === 'active' ? 'Активен' : 'Архив'}</span>
        </div>
        <p style={{ margin: 0, color: '#4b5563' }}>{agent.description}</p>
        <div className="stack-row wrap">
          {agent.tags.map((tag) => (
            <span key={tag} className="badge neutral">
              #{tag}
            </span>
          ))}
        </div>
        {agent.estimateId && <span className="badge">Смета: {agent.estimateId}</span>}
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          Обновлён: {new Date(agent.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
