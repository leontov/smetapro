import { db } from '../db';
import type { FlowLogEntry, FlowRun, FlowRunStatus } from '../types';

const now = () => new Date().toISOString();

export async function createRun(agentId: string, estimateId?: string): Promise<FlowRun> {
  const run: FlowRun = {
    id: crypto.randomUUID(),
    agentId,
    status: 'queued',
    startedAt: now(),
    logs: [],
    retryCount: 0,
    contextEstimateId: estimateId
  };
  await db.flowRuns.add(run);
  return run;
}

export async function updateRun(id: string, changes: Partial<FlowRun>): Promise<FlowRun | undefined> {
  const existing = await db.flowRuns.get(id);
  if (!existing) return undefined;
  const updated: FlowRun = { ...existing, ...changes };
  await db.flowRuns.put(updated);
  return updated;
}

export async function addLogEntry(runId: string, entry: FlowLogEntry): Promise<void> {
  const run = await db.flowRuns.get(runId);
  if (!run) return;
  const logs = [...run.logs, entry];
  await db.flowRuns.put({ ...run, logs });
}

export async function listRuns(agentId?: string): Promise<FlowRun[]> {
  if (!agentId) {
    return db.flowRuns.orderBy('startedAt').reverse().toArray();
  }
  const runs = await db.flowRuns.where('agentId').equals(agentId).toArray();
  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export async function purgeRuns(agentId: string) {
  await db.flowRuns.where('agentId').equals(agentId).delete();
}

export async function updateRunStatus(runId: string, status: FlowRunStatus, error?: string) {
  const run = await db.flowRuns.get(runId);
  if (!run) return;
  const updates: Partial<FlowRun> = {
    status,
    finishedAt: status === 'succeeded' || status === 'failed' ? now() : run.finishedAt
  };
  if (error) updates.error = error;
  await db.flowRuns.put({ ...run, ...updates });
}
