import React from 'react';

interface Props {
  title: string;
  value: string;
  delta?: number;
}

const getDeltaLabel = (delta?: number) => {
  if (delta === undefined) return null;
  const sign = delta > 0 ? '+' : '';
  const color = delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : '#475569';
  return (
    <span style={{ color, fontWeight: 600 }}>
      {sign}
      {delta.toFixed(1)}%
    </span>
  );
};

export const KpiCard: React.FC<Props> = ({ title, value, delta }) => (
  <div className="kpi-card">
    <h3 style={{ margin: '0 0 8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {title}
    </h3>
    <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>{value}</div>
    {getDeltaLabel(delta)}
  </div>
);
