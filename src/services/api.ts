import axios from 'axios';
import { PriceSource } from '../state/PriceSourceContext';

const api = axios.create({
  baseURL: '/api'
});

export interface InsightKpi {
  id: string;
  title: string;
  value: number;
  delta: number;
}

export interface InsightSeriesPoint {
  date: string;
  revenue: number;
  cost: number;
}

export interface InsightResponse {
  kpis: InsightKpi[];
  series: InsightSeriesPoint[];
}

export const fetchInsights = async (): Promise<InsightResponse> => {
  const { data } = await api.get<InsightResponse>('/insights');
  return data;
};

export const fetchPriceSources = async (): Promise<PriceSource[]> => {
  const { data } = await api.get<PriceSource[]>('/prices');
  return data;
};

export interface UpdatePriceSourcePayload {
  id: string;
  enabled: boolean;
}

export const updatePriceSource = async (payload: UpdatePriceSourcePayload): Promise<PriceSource> => {
  const { data } = await api.patch<PriceSource>(`/prices/${payload.id}`, payload);
  return data;
};

export interface ReportSchedule {
  id: string;
  format: 'pdf' | 'xlsx';
  cron: string;
  recipients: string[];
}

export const fetchReportSchedules = async (): Promise<ReportSchedule[]> => {
  const { data } = await api.get<ReportSchedule[]>('/reports/schedules');
  return data;
};

export const createReportSchedule = async (schedule: ReportSchedule): Promise<ReportSchedule> => {
  const { data } = await api.post<ReportSchedule>('/reports/schedules', schedule);
  return data;
};

export const deleteReportSchedule = async (id: string): Promise<void> => {
  await api.delete(`/reports/schedules/${id}`);
};

export default api;

export interface AgentStatus {
  activeSources: number;
  lastNotification?: {
    sourceId: string;
    items: number;
    timestamp: string;
  };
}

export const fetchAgentStatus = async (): Promise<AgentStatus> => {
  const { data } = await api.get<AgentStatus>('/agent/status');
  return data;
};
