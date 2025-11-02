export type LineItemId = string;
export type EstimateId = string;
export type VersionId = string;

export interface LineItem {
  id: LineItemId;
  parentId: LineItemId | null;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
  children?: LineItem[];
}

export interface EstimateMetadata {
  id: EstimateId;
  code: string;
  name: string;
  customer?: string;
  tags: string[];
  status: 'draft' | 'ready' | 'archived';
  lastSyncedAt?: number;
  updatedAt: number;
  createdAt: number;
  syncState: SyncState;
}

export interface EstimateVersion {
  id: VersionId;
  estimateId: EstimateId;
  createdAt: number;
  author: string;
  comment?: string;
  diffSummary: string;
  payload: Estimate;
}

export interface Estimate extends EstimateMetadata {
  lineItems: LineItem[];
  subtotal: number;
  vatRate: number;
  total: number;
}

export type SyncState = 'idle' | 'pending' | 'error';

export interface SyncQueueItem {
  id: string;
  estimateId: EstimateId;
  payload: Estimate;
  operation: 'create' | 'update' | 'delete';
  createdAt: number;
  updatedAt: number;
  attempts: number;
}

export interface DiffChange<T> {
  field: keyof T;
  before: T[keyof T];
  after: T[keyof T];
}

export interface EstimateDiff {
  metadataChanges: DiffChange<EstimateMetadata>[];
  lineItemChanges: Array<{
    id: LineItemId;
    type: 'added' | 'removed' | 'updated';
    before?: LineItem;
    after?: LineItem;
  }>;
}
