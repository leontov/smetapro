import type { FlowExecutionResult, FlowLogEntry, SerializedFlow, AIAgent, Estimate } from '../data/types';
import { genkitKeyStore } from './keyStore';
import { computeExecutionOrder } from '../flow/graph';

export interface GenkitClientOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

export interface ExecutionContext {
  estimate?: Estimate;
  variables?: Record<string, unknown>;
}

export class GenkitClient {
  private apiKey: string | null;
  private readonly endpoint: string;
  private readonly model: string;

  constructor(options: GenkitClientOptions = {}) {
    this.apiKey = options.apiKey ?? genkitKeyStore.get();
    this.endpoint = options.endpoint ?? 'https://api.genkit.dev/v1';
    this.model = options.model ?? 'gpt-4o-mini';
    genkitKeyStore.subscribe((key) => {
      this.apiKey = key;
    });
  }

  setApiKey(key: string) {
    genkitKeyStore.set(key);
  }

  getApiKey() {
    return this.apiKey;
  }

  private async callGenkit(path: string, payload: Record<string, unknown>): Promise<any> {
    if (!this.apiKey) {
      return {
        output: `⚠️ Генерация в офлайн-режиме: ${payload.prompt ?? payload.tool ?? 'noop'}`,
        logs: []
      };
    }

    const response = await fetch(`${this.endpoint}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ ...payload, model: this.model })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GenKit error: ${response.status} ${text}`);
    }

    return response.json();
  }

  async runPrompt(prompt: string, context?: ExecutionContext): Promise<string> {
    const payload = {
      prompt,
      context
    };

    const result = await this.callGenkit('/prompt', payload);
    return result.output ?? result.text ?? JSON.stringify(result);
  }

  async runTool(toolName: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const result = await this.callGenkit('/tool', { tool: toolName, payload });
    return result.output ?? result.data ?? result;
  }
}

export async function executeFlow(
  client: GenkitClient,
  agent: AIAgent,
  flow: SerializedFlow,
  context: ExecutionContext,
  onLog: (entry: FlowLogEntry) => Promise<void>
): Promise<FlowExecutionResult> {
  const order = computeExecutionOrder(flow);
  const logs: FlowLogEntry[] = [];
  const variables: Record<string, unknown> = { ...(context.variables ?? {}) };
  let lastOutput = '';

  for (const node of order) {
    const baseLog: FlowLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '',
      payload: {
        agentId: agent.id,
        nodeId: node.id,
        nodeType: node.type
      }
    };

    try {
      if (node.type === 'prompt') {
        const prompt = (node.data as any).prompt as string;
        baseLog.message = `Выполнение промпта`;
        await onLog(baseLog);
        const output = await client.runPrompt(prompt, {
          estimate: context.estimate,
          variables
        });
        lastOutput = output;
        variables[`node:${node.id}`] = output;
        const infoLog: FlowLogEntry = {
          ...baseLog,
          id: crypto.randomUUID(),
          message: `Готово: ${output.slice(0, 120)}`
        };
        logs.push(infoLog);
        await onLog(infoLog);
      } else if (node.type === 'tool') {
        const tool = (node.data as any).toolName as string;
        baseLog.message = `Вызов инструмента ${tool}`;
        await onLog(baseLog);
        const output = await client.runTool(tool, {
          estimate: context.estimate,
          variables
        });
        variables[`tool:${tool}`] = output;
        const infoLog: FlowLogEntry = {
          ...baseLog,
          id: crypto.randomUUID(),
          message: `Инструмент вернул ${JSON.stringify(output).slice(0, 100)}`
        };
        logs.push(infoLog);
        await onLog(infoLog);
      } else if (node.type === 'data') {
        const dataNode = node.data as any;
        baseLog.message = `Загрузка данных из ${dataNode.source}`;
        await onLog(baseLog);
        const mapping: Record<string, string> = dataNode.mapping ?? {};
        const extracted = Object.fromEntries(
          Object.entries(mapping).map(([key, path]) => {
            if (!context.estimate) return [key, null];
            const source = context.estimate as unknown as Record<string, unknown>;
            return [key, source[path] ?? null];
          })
        );
        variables[`data:${node.id}`] = extracted;
        const infoLog: FlowLogEntry = {
          ...baseLog,
          id: crypto.randomUUID(),
          message: `Данные доступны: ${JSON.stringify(extracted)}`
        };
        logs.push(infoLog);
        await onLog(infoLog);
      }
    } catch (error) {
      const errLog: FlowLogEntry = {
        ...baseLog,
        id: crypto.randomUUID(),
        level: 'error',
        message: error instanceof Error ? error.message : String(error)
      };
      logs.push(errLog);
      await onLog(errLog);
      throw error;
    }
  }

  return { output: lastOutput, logs };
}
