import Dexie, { Table } from 'dexie';
import { Estimate, EstimateId, EstimateVersion, SyncQueueItem } from './types';

export class SmetaDatabase extends Dexie {
  estimates!: Table<Estimate, EstimateId>;
  versions!: Table<EstimateVersion>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('smeta-pro');
    this.version(1).stores({
      estimates: '&id, updatedAt, status, name, code',
      versions: '&id, estimateId, createdAt',
      syncQueue: '&id, estimateId, createdAt'
    });
  }
}

export const db = new SmetaDatabase();
