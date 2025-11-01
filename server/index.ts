import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import { buildInsights } from './insights';
import { agent, getAgentStatus } from './agent';
import { listPriceSources, togglePriceSource } from './prices';
import { createReportScheduleRouter } from './schedules';
import { exportReportFile } from './reporting';
import type { SyncJobPayload } from './types';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/api/insights', (_request, response) => {
  response.json(buildInsights());
});

app.get('/api/prices', (_request, response) => {
  response.json(listPriceSources());
});

app.patch('/api/prices/:id', (request, response) => {
  const updated = togglePriceSource(request.params.id, request.body.enabled);
  if (!updated) {
    response.status(404).json({ message: 'Source not found' });
    return;
  }
  response.json(updated);
});

app.use('/api/reports', createReportScheduleRouter());

app.post('/api/reports/export', async (request, response) => {
  const { format } = request.body as { format: 'pdf' | 'xlsx' };
  const file = await exportReportFile(format);
  response.json({
    filename: file.filename,
    mime: file.mime,
    data: file.data.toString('base64')
  });
});

app.post('/api/sync', (request, response) => {
  const payload = request.body as SyncJobPayload;
  console.log('Sync job processed', payload.type);
  response.json({ ok: true });
});

app.get('/api/agent/status', (_request, response) => {
  response.json({
    ...getAgentStatus(),
    lastRunAt: agent.listenerCount('completed')
  });
});

app.post('/api/agent/notify', (request, response) => {
  const { sourceId, items } = request.body;
  console.log(`Agent completed update from ${sourceId} (${items} позиций)`);
  response.json({ ok: true });
});

const port = process.env.PORT ?? 3001;

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});

agent.start();

cron.schedule('0 7 * * 1', () => {
  console.log('Weekly audit placeholder: запуск оптимизаций Lighthouse');
});

agent.on('completed', (payload) => {
  console.log('Agent notification', payload);
});

agent.on('failed', (error) => {
  console.error('Agent failed', error);
});
