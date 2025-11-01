import Dexie, { type Table } from 'dexie';
import type { AIAgent, FlowRun } from './types';

export class SmetaProDB extends Dexie {
  aiAgents!: Table<AIAgent, string>;
  flowRuns!: Table<FlowRun, string>;

  constructor() {
    super('SmetaProDB');
    this.version(1).stores({
      aiAgents: 'id, status, estimateId, updatedAt',
      flowRuns: 'id, agentId, status, startedAt'
    });
  }
}

export const db = new SmetaProDB();
