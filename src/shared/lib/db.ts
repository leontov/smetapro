import Dexie, { type Table } from 'dexie';

import type { EstimateRecord, LineItemRecord, ProjectRecord } from '@shared/types/db';

class SmetaDatabase extends Dexie {
  projects!: Table<ProjectRecord, number>;
  estimates!: Table<EstimateRecord, number>;
  lineItems!: Table<LineItemRecord, number>;

  constructor() {
    super('smetapro');

    this.version(1).stores({
      projects: '++id, name, createdAt',
      estimates: '++id, projectId, createdAt',
      lineItems: '++id, estimateId, createdAt'
    });

    this.projects.mapToClass(class implements ProjectRecord {
      id?: number;
      name!: string;
      description?: string;
      createdAt!: Date;
      updatedAt!: Date;
    });

    this.estimates.mapToClass(class implements EstimateRecord {
      id?: number;
      projectId!: number;
      title!: string;
      currency!: string;
      createdAt!: Date;
      updatedAt!: Date;
    });

    this.lineItems.mapToClass(class implements LineItemRecord {
      id?: number;
      estimateId!: number;
      name!: string;
      quantity!: number;
      unitPrice!: number;
      createdAt!: Date;
      updatedAt!: Date;
    });
  }
}

export const db = new SmetaDatabase();
