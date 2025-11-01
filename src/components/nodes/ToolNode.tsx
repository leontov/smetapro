import React from 'react';
import { Handle, Position } from 'reactflow';

interface ToolNodeProps {
  data: {
    toolName: string;
    onChange?: (value: string) => void;
  };
  selected?: boolean;
}

export const ToolNode: React.FC<ToolNodeProps> = ({ data, selected }) => {
  return (
    <div
      style={{
        background: '#fef9c3',
        borderRadius: 12,
        padding: '0.75rem',
        boxShadow: selected ? '0 0 0 2px #f97316' : '0 8px 16px rgba(15, 23, 42, 0.1)',
        width: 200
      }}
    >
      <Handle type="target" position={Position.Left} />
      <h4 style={{ margin: '0 0 0.5rem 0' }}>Tool</h4>
      <input
        value={data.toolName}
        onChange={(event) => data.onChange?.(event.target.value)}
        placeholder="Название инструмента"
        style={{ width: '100%', borderRadius: 8, border: '1px solid #facc15', padding: '0.4rem' }}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
