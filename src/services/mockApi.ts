import { Estimate, EstimateId } from '../data/types';

const remoteStore = new Map<EstimateId, Estimate>();

export interface SyncResponse {
  estimate: Estimate;
  conflict?: {
    remote: Estimate;
    local: Estimate;
  };
}

const latency = () => new Promise((resolve) => setTimeout(resolve, 200));

export const mockApi = {
  async upsert(estimate: Estimate): Promise<SyncResponse> {
    await latency();
    const existing = remoteStore.get(estimate.id);
    if (!existing || existing.updatedAt <= estimate.updatedAt) {
      remoteStore.set(estimate.id, { ...estimate, lastSyncedAt: Date.now() });
      return { estimate: { ...estimate, lastSyncedAt: Date.now() } };
    }
    return {
      estimate: existing,
      conflict: { remote: existing, local: estimate }
    };
  },
  async remove(id: EstimateId): Promise<void> {
    await latency();
    remoteStore.delete(id);
  },
  async list(): Promise<Estimate[]> {
    await latency();
    return Array.from(remoteStore.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }
};
