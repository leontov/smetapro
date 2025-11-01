import type { AIAgent, Estimate, FlowExecutionResult, FlowLogEntry } from '../data/types';
import { createRun, addLogEntry, updateRunStatus } from '../data/repositories/flowRunRepository';
import { executeFlow, GenkitClient, type ExecutionContext } from '../genkit/GenkitClient';

export interface FlowOrchestratorOptions {
  maxRetries?: number;
  retryDelayMs?: number;
}

export class FlowOrchestrator {
  private readonly client: GenkitClient;
  private readonly options: Required<FlowOrchestratorOptions>;

  constructor(client: GenkitClient, options: FlowOrchestratorOptions = {}) {
    this.client = client;
    this.options = {
      maxRetries: options.maxRetries ?? 1,
      retryDelayMs: options.retryDelayMs ?? 750
    };
  }

  async execute(agent: AIAgent, estimate?: Estimate): Promise<FlowExecutionResult> {
    const run = await createRun(agent.id, estimate?.id);
    const context: ExecutionContext = { estimate };
    let attempt = 0;

    const log = async (entry: FlowLogEntry) => {
      await addLogEntry(run.id, entry);
    };

    while (attempt <= this.options.maxRetries) {
      try {
        if (attempt > 0) {
          await log({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            level: 'warn',
            message: `Повторная попытка ${attempt}`,
            payload: { attempt }
          });
        }
        await updateRunStatus(run.id, attempt === 0 ? 'running' : 'queued');
        const result = await executeFlow(this.client, agent, agent.flow, context, log);
        await updateRunStatus(run.id, 'succeeded');
        return result;
      } catch (error) {
        attempt += 1;
        const errMessage = error instanceof Error ? error.message : String(error);
        await log({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Ошибка выполнения: ${errMessage}`,
          payload: { attempt }
        });

        if (attempt > this.options.maxRetries) {
          await updateRunStatus(run.id, 'failed', errMessage);
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, this.options.retryDelayMs));
      }
    }

    throw new Error('Не удалось выполнить сценарий');
  }
}
