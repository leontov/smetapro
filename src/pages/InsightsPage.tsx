import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { fetchInsights } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { useTelemetry } from '../utils/telemetry';

const InsightsPage: React.FC = () => {
  const telemetry = useTelemetry();
  const { data, isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: fetchInsights,
    select: (raw) => ({
      ...raw,
      kpis: raw.kpis.map((kpi) => ({
        ...kpi,
        valueFormatted: kpi.value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })
      }))
    }),
    onSuccess: () => telemetry.track('insights_viewed')
  });

  if (isLoading || !data) {
    return <div>Загружаем аналитику…</div>;
  }

  return (
    <div>
      <h2>Панель Insights</h2>
      <p>Оперативные показатели эффективности проектов и динамика затрат/выручки.</p>
      <div className="kpi-grid">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.id} title={kpi.title} value={kpi.valueFormatted} delta={kpi.delta} />
        ))}
      </div>
      <section className="chart-card">
        <h3 style={{ marginTop: 0 }}>Финансовая динамика</h3>
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={data.series} margin={{ top: 16, right: 32, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#38bdf8" fill="rgba(56, 189, 248, 0.4)" />
            <Area type="monotone" dataKey="cost" stroke="#f97316" fill="rgba(249, 115, 22, 0.35)" />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default InsightsPage;
