export interface ProjectRecord {
  id?: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EstimateRecord {
  id?: number;
  projectId: number;
  title: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LineItemRecord {
  id?: number;
  estimateId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
