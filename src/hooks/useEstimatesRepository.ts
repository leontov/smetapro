import { useLiveQuery } from 'dexie-react-hooks';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';
import { db } from '../data/db';
import {
  Estimate,
  EstimateId,
  EstimateVersion,
  LineItem,
  SyncQueueItem
} from '../data/types';
import { computeTotals, diffEstimates } from '../utils/estimateUtils';

export const useEstimates = () => {
  const estimates = useLiveQuery(async () => {
    const data = await db.estimates.toArray();
    return data.sort((a, b) => b.updatedAt - a.updatedAt);
  }, []);

  return estimates ?? [];
};

export const useEstimate = (id?: EstimateId) => {
  const estimate = useLiveQuery(
    async () => (id ? db.estimates.get(id) : undefined),
    [id]
  );
  return estimate;
};

const buildLineItem = (overrides: Partial<LineItem> = {}): LineItem => ({
  id: overrides.id ?? nanoid(),
  parentId: overrides.parentId ?? null,
  name: overrides.name ?? 'Новая позиция',
  unit: overrides.unit ?? 'шт',
  quantity: overrides.quantity ?? 1,
  unitPrice: overrides.unitPrice ?? 0,
  sortOrder: overrides.sortOrder ?? Date.now(),
  children: overrides.children ?? []
});

const buildEstimate = (overrides: Partial<Estimate> = {}): Estimate => {
  const lineItems = overrides.lineItems ?? [buildLineItem()];
  const base: Estimate = {
    id: overrides.id ?? nanoid(),
    code: overrides.code ?? `EST-${Date.now()}`,
    name: overrides.name ?? 'Новая смета',
    customer: overrides.customer,
    tags: overrides.tags ?? [],
    status: overrides.status ?? 'draft',
    createdAt: overrides.createdAt ?? Date.now(),
    updatedAt: overrides.updatedAt ?? Date.now(),
    lastSyncedAt: overrides.lastSyncedAt,
    lineItems,
    subtotal: 0,
    vatRate: overrides.vatRate ?? 0.2,
    total: 0,
    syncState: overrides.syncState ?? 'idle'
  };
  return computeTotals(base);
};

export const useEstimateMutations = () => {
  const saveEstimate = useCallback(async (estimate: Estimate, author = 'system') => {
    const current = estimate.id ? await db.estimates.get(estimate.id) : undefined;
    const withTotals = computeTotals(estimate);
    const diff = current ? diffEstimates(current, withTotals) : undefined;

    await (db as any).transaction('rw', [db.estimates, db.versions, db.syncQueue], async () => {
      await db.estimates.put({ ...withTotals, updatedAt: Date.now() } as Estimate);
      await db.versions.add({
        id: nanoid(),
        estimateId: withTotals.id,
        createdAt: Date.now(),
        author,
        diffSummary: diff ? `${diff.metadataChanges.length} полей, ${diff.lineItemChanges.length} позиций` : 'Создано',
        payload: withTotals
      } satisfies EstimateVersion);
      await enqueueSync(withTotals, current ? 'update' : 'create');
    });
  }, []);

  const removeEstimate = useCallback(async (estimateId: EstimateId) => {
    const estimate = await db.estimates.get(estimateId);
    await (db as any).transaction('rw', [db.estimates, db.syncQueue], async () => {
      await db.estimates.delete(estimateId);
      if (estimate) {
        await enqueueSync(estimate, 'delete');
      }
    });
  }, []);

  const createBlankEstimate = useCallback(async () => {
    const estimate = buildEstimate();
    await saveEstimate(estimate);
    return estimate.id;
  }, [saveEstimate]);

  return { saveEstimate, removeEstimate, createBlankEstimate };
};

export const useEstimateHistory = (estimateId?: EstimateId) =>
  useLiveQuery(async () => {
    if (!estimateId) return [] as EstimateVersion[];
    return db.versions
      .where({ estimateId })
      .sortBy('createdAt')
      .then((list) => list.reverse());
  }, [estimateId]) ?? [];

const enqueueSync = async (estimate: Estimate, operation: SyncQueueItem['operation']) => {
  const existing = await db.syncQueue.get(estimate.id);
  if (existing) {
    await db.syncQueue.put({
      ...existing,
      payload: estimate,
      operation,
      updatedAt: Date.now(),
      attempts: 0
    });
  } else {
    await db.syncQueue.put({
      id: estimate.id,
      estimateId: estimate.id,
      payload: estimate,
      operation,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attempts: 0
    });
  }
};

export { buildEstimate, buildLineItem };
