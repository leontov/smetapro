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

export interface PriceSource {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  enabled: boolean;
  latencyMs: number;
  isMock?: boolean;
}

export interface ReportSchedule {
  id: string;
  format: 'pdf' | 'xlsx';
  cron: string;
  recipients: string[];
}

export interface SyncJobPayload {
  type: string;
  payload: unknown;
}
