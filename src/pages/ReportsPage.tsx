import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { v4 as uuid } from 'uuid';
import {
  createReportSchedule,
  deleteReportSchedule,
  fetchReportSchedules,
  ReportSchedule
} from '../services/api';
import { useTelemetry } from '../utils/telemetry';

const initialSchedule: ReportSchedule = {
  id: '',
  format: 'pdf',
  cron: '0 8 * * 1',
  recipients: ['ceo@smetapro.io']
};

const ReportsPage: React.FC = () => {
  const [form, setForm] = useState<ReportSchedule>({ ...initialSchedule });
  const queryClient = useQueryClient();
  const telemetry = useTelemetry();
  const { data } = useQuery({
    queryKey: ['reportSchedules'],
    queryFn: fetchReportSchedules
  });

  const createMutation = useMutation({
    mutationFn: createReportSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportSchedules'] });
      telemetry.track('report_schedule_created');
      setForm({ ...initialSchedule });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReportSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportSchedules'] });
      telemetry.track('report_schedule_deleted');
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createMutation.mutate({ ...form, id: uuid() });
  };

  return (
    <div>
      <h2>Генерация отчетов</h2>
      <p>PDF/XLSX отчеты по расписанию. Отправка через Share API и email рассылку.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
        <label>
          Формат
          <select
            value={form.format}
            onChange={(event) => setForm((prev) => ({ ...prev, format: event.target.value as 'pdf' | 'xlsx' }))}
          >
            <option value="pdf">PDF</option>
            <option value="xlsx">XLSX</option>
          </select>
        </label>
        <label>
          CRON
          <input
            value={form.cron}
            onChange={(event) => setForm((prev) => ({ ...prev, cron: event.target.value }))}
            placeholder="0 8 * * 1"
          />
        </label>
        <label>
          Получатели
          <input
            value={form.recipients.join(', ')}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, recipients: event.target.value.split(',').map((item) => item.trim()) }))
            }
            placeholder="email1@example.com, email2@example.com"
          />
        </label>
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Создаем…' : 'Добавить расписание'}
        </button>
      </form>

      <section style={{ marginTop: 32 }}>
        <h3>Расписания</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {data?.map((schedule) => (
            <li
              key={schedule.id}
              style={{
                padding: '12px 16px',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 6px 14px rgba(15,23,42,0.08)',
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <strong>{schedule.format.toUpperCase()}</strong>
                <div style={{ fontSize: 12, color: '#64748b' }}>CRON: {schedule.cron}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{schedule.recipients.join(', ')}</div>
              </div>
              <button type="button" onClick={() => deleteMutation.mutate(schedule.id)}>
                Удалить
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ReportsPage;
