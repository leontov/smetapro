import React, { useState } from 'react';
import { AgentHub } from './components/AgentHub';
import { FlowBuilder } from './components/FlowBuilder';
import { RunHistory } from './components/RunHistory';
import { EstimateEditor } from './components/EstimateEditor';

const tabs = [
  { id: 'hub', label: 'Agent Hub', description: 'Карточки агентов, фильтры и настройка профиля' },
  { id: 'builder', label: 'Flow Builder', description: 'Граф визуального конструирования сценариев' },
  { id: 'history', label: 'Run History', description: 'История запусков и логов' },
  { id: 'editor', label: 'Смета', description: 'Контекст и запуск агента из редактора' }
] as const;

export type TabId = (typeof tabs)[number]['id'];

const renderTab = (tab: TabId) => {
  switch (tab) {
    case 'builder':
      return <FlowBuilder />;
    case 'history':
      return <RunHistory />;
    case 'editor':
      return <EstimateEditor />;
    case 'hub':
    default:
      return <AgentHub />;
  }
};

const App: React.FC = () => {
  const [tab, setTab] = useState<TabId>('hub');

  return (
    <div className="container">
      <header className="stack" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: 0 }}>SmetaPro Agent Hub</h1>
        <p style={{ marginTop: 0, color: '#4b5563' }}>
          Управляйте AI-агентами для сметной команды: настраивайте сценарии, отслеживайте запуски и интегрируйте их в рабочие
          процессы.
        </p>
        <div className="tabs">
          {tabs.map((item) => (
            <button key={item.id} className={item.id === tab ? 'active' : ''} onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <small style={{ color: '#6b7280' }}>{tabs.find((item) => item.id === tab)?.description}</small>
      </header>
      {renderTab(tab)}
    </div>
  );
};

export default App;
