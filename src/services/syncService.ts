import { db } from '../data/db';
import { Estimate, EstimateMetadata, SyncQueueItem } from '../data/types';
import { diffEstimates } from '../utils/estimateUtils';
import { mockApi } from './mockApi';

const MAX_ATTEMPTS = 3;
const POLL_INTERVAL = 2500;

const processQueueItem = async (item: SyncQueueItem) => {
  if (item.operation === 'delete') {
    await mockApi.remove(item.estimateId);
    await db.syncQueue.delete(item.id);
    return;
  }

  const response = await mockApi.upsert(item.payload);
  const { estimate, conflict } = response;

  await (db as any).transaction('rw', [db.estimates, db.syncQueue], async () => {
    if (conflict) {
      const merged = resolveConflict(conflict.remote, conflict.local);
      await db.estimates.put({ ...merged, syncState: 'pending' });
      await db.syncQueue.put({
        ...item,
        payload: merged,
        attempts: item.attempts + 1,
        updatedAt: Date.now()
      });
    } else {
      await db.estimates.put({ ...estimate, lastSyncedAt: Date.now(), syncState: 'idle' });
      await db.syncQueue.delete(item.id);
    }
  });
};

const resolveConflict = (remote: Estimate, local: Estimate): Estimate => {
  const diff = diffEstimates(remote, local);
  const merged: Estimate = { ...remote };
  diff.metadataChanges.forEach((change) => {
    (merged as unknown as EstimateMetadata)[change.field] = change.after as never;
  });
  return merged;
};

export const startSyncService = () => {
  const tick = async () => {
    const next = await db.syncQueue.orderBy('createdAt').first();
    if (!next) return;
    try {
      await processQueueItem(next);
    } catch (error) {
      await db.syncQueue.put({
        ...next,
        attempts: next.attempts + 1,
        updatedAt: Date.now()
      });
      if (next.attempts + 1 >= MAX_ATTEMPTS) {
        await (db.estimates as any).update(next.estimateId, { syncState: 'error' });
      }
    }
  };

  setInterval(tick, POLL_INTERVAL);
};
