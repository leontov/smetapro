import React from 'react';
import { Handle, Position } from 'reactflow';

interface DataNodeProps {
  data: {
    source: string;
    mapping: Record<string, string>;
    onChange?: (changes: { source?: string; mapping?: Record<string, string> }) => void;
  };
  selected?: boolean;
}

export const DataNode: React.FC<DataNodeProps> = ({ data, selected }) => {
  const entries = Object.entries(data.mapping ?? {});

  return (
    <div
      style={{
        background: '#dcfce7',
        borderRadius: 12,
        padding: '0.75rem',
        boxShadow: selected ? '0 0 0 2px #16a34a' : '0 8px 16px rgba(15, 23, 42, 0.1)',
        width: 230
      }}
    >
      <Handle type="target" position={Position.Left} />
      <h4 style={{ margin: '0 0 0.5rem 0' }}>Data</h4>
      <input
        value={data.source}
        onChange={(event) => data.onChange?.({ source: event.target.value })}
        placeholder="Источник (например, estimate)"
        style={{ width: '100%', borderRadius: 8, border: '1px solid #16a34a', padding: '0.4rem', marginBottom: '0.5rem' }}
      />
      <div className="stack" style={{ gap: '0.5rem' }}>
        {entries.map(([key, value]) => (
          <div key={key} className="stack-row" style={{ gap: '0.25rem', alignItems: 'center' }}>
            <input
              value={key}
              onChange={(event) => {
                const nextKey = event.target.value.trim();
                const nextMapping = { ...data.mapping };
                delete nextMapping[key];
                nextMapping[nextKey || key] = value;
                data.onChange?.({ mapping: nextMapping });
              }}
              placeholder="Поле"
              style={{ flex: 1, borderRadius: 6, border: '1px solid #16a34a', padding: '0.3rem' }}
            />
            <span style={{ color: '#16a34a' }}>←</span>
            <input
              value={value}
              onChange={(event) => {
                const nextMapping = { ...data.mapping, [key]: event.target.value };
                data.onChange?.({ mapping: nextMapping });
              }}
              placeholder="Ключ сметы"
              style={{ flex: 1, borderRadius: 6, border: '1px solid #16a34a', padding: '0.3rem' }}
            />
            <button
              type="button"
              onClick={() => {
                const nextMapping = { ...data.mapping };
                delete nextMapping[key];
                data.onChange?.({ mapping: nextMapping });
              }}
              style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            data.onChange?.({
              mapping: {
                ...data.mapping,
                [`field_${entries.length + 1}`]: 'notes'
              }
            })
          }
          style={{ alignSelf: 'flex-start' }}
        >
          + Поле
        </button>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
