import api from './api';

interface ExportParams {
  format: 'pdf' | 'xlsx';
}

interface ExportResponse {
  filename: string;
  mime: string;
  data: string;
}

export const exportReport = async ({ format }: ExportParams): Promise<ExportResponse> => {
  const { data } = await api.post<ExportResponse>('/reports/export', { format });
  return data;
};
