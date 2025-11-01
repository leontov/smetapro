import { Router } from 'express';
import cron from 'node-cron';
import type { ReportSchedule } from './types';
import { exportReportFile, schedules } from './reporting';

export const createReportScheduleRouter = () => {
  const router = Router();

  router.get('/schedules', (_request, response) => {
    response.json(Array.from(schedules.values()).map(({ job, ...rest }) => rest));
  });

  router.post('/schedules', (request, response) => {
    const schedule = request.body as ReportSchedule;
    if (!cron.validate(schedule.cron)) {
      response.status(400).json({ message: 'Invalid CRON expression' });
      return;
    }

    const job = cron.schedule(schedule.cron, async () => {
      const file = await exportReportFile(schedule.format);
      console.log(`Report generated (${schedule.format}) for recipients`, schedule.recipients);
      console.log(`Share API payload: ${file.filename}`);
    });

    schedules.set(schedule.id, { ...schedule, job });
    response.status(201).json(schedule);
  });

  router.delete('/schedules/:id', (request, response) => {
    const existing = schedules.get(request.params.id);
    if (!existing) {
      response.status(404).json({ message: 'Not found' });
      return;
    }
    existing.job?.stop();
    schedules.delete(request.params.id);
    response.status(204).end();
  });

  router.post('/run', async (request, response) => {
    const { format } = request.body as { format: 'pdf' | 'xlsx' };
    const file = await exportReportFile(format);
    response.json({ ok: true, filename: file.filename });
  });

  return router;
};
