import React from 'react';
import { Handle, Position } from 'reactflow';

interface PromptNodeProps {
  data: {
    prompt: string;
    onChange?: (value: string) => void;
  };
  selected?: boolean;
}

export const PromptNode: React.FC<PromptNodeProps> = ({ data, selected }) => {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        padding: '0.75rem',
        boxShadow: selected ? '0 0 0 2px #2563eb' : '0 8px 16px rgba(15, 23, 42, 0.1)',
        width: 220
      }}
    >
      <Handle type="target" position={Position.Left} />
      <h4 style={{ margin: '0 0 0.5rem 0' }}>Prompt</h4>
      <textarea
        value={data.prompt}
        onChange={(event) => data.onChange?.(event.target.value)}
        placeholder="Опишите, что должен сделать агент"
        style={{ width: '100%', minHeight: 90, borderRadius: 8, border: '1px solid #d1d5db', padding: '0.5rem' }}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
