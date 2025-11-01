import type { Edge, Node, XYPosition } from 'reactflow';

export type AgentStatus = 'draft' | 'active' | 'archived';

export interface PromptNodeData {
  prompt: string;
}

export interface ToolNodeData {
  toolName: string;
  config?: Record<string, unknown>;
}

export interface DataNodeData {
  source: string;
  mapping?: Record<string, string>;
}

export type FlowNodeData = PromptNodeData | ToolNodeData | DataNodeData;

export interface FlowNodeMeta {
  id: string;
  type: 'prompt' | 'tool' | 'data';
  position: XYPosition;
  data: FlowNodeData;
}

export interface SerializedFlow {
  nodes: FlowNodeMeta[];
  edges: Array<Pick<Edge, 'id' | 'source' | 'target' | 'sourceHandle' | 'targetHandle'>>;
}

export interface FlowLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  payload?: Record<string, unknown>;
}

export type FlowRunStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface FlowRun {
  id: string;
  agentId: string;
  status: FlowRunStatus;
  startedAt: string;
  finishedAt?: string;
  logs: FlowLogEntry[];
  output?: string;
  retryCount: number;
  error?: string;
  contextEstimateId?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: AgentStatus;
  flow: SerializedFlow;
  createdAt: string;
  updatedAt: string;
  estimateId?: string;
  temperature: number;
}

export interface Estimate {
  id: string;
  name: string;
  budget: number;
  currency: string;
  notes?: string;
}

export interface FlowExecutionResult {
  output: string;
  logs: FlowLogEntry[];
}
