import { DateTime } from 'luxon';
import type { InsightKpi, InsightSeriesPoint } from './types';

export interface InsightPayload {
  kpis: InsightKpi[];
  series: InsightSeriesPoint[];
}

export const buildInsights = (): InsightPayload => {
  const baseDate = DateTime.now().minus({ months: 5 });
  const series: InsightSeriesPoint[] = Array.from({ length: 26 }).map((_, index) => {
    const date = baseDate.plus({ weeks: index });
    const revenue = 1_000_000 + Math.random() * 400_000 + index * 25_000;
    const cost = 600_000 + Math.random() * 200_000 + index * 10_000;
    return {
      date: date.toFormat('dd LLL'),
      revenue: Math.round(revenue),
      cost: Math.round(cost)
    };
  });

  const totalRevenue = series.reduce((acc, item) => acc + item.revenue, 0);
  const totalCost = series.reduce((acc, item) => acc + item.cost, 0);
  const profit = totalRevenue - totalCost;

  const kpis: InsightKpi[] = [
    {
      id: 'revenue',
      title: 'Выручка',
      value: totalRevenue,
      delta: 12.4
    },
    {
      id: 'cost',
      title: 'Затраты',
      value: totalCost,
      delta: -4.1
    },
    {
      id: 'profit',
      title: 'Прибыль',
      value: profit,
      delta: 8.9
    },
    {
      id: 'margin',
      title: 'Маржа',
      value: Math.round((profit / totalRevenue) * 100),
      delta: 3.2
    }
  ];

  return { kpis, series };
};
