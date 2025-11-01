import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../src/data/db';
import type { AIAgent } from '../../src/data/types';
import { FlowOrchestrator } from '../../src/flow/FlowOrchestrator';
import { GenkitClient } from '../../src/genkit/GenkitClient';
import { listRuns } from '../../src/data/repositories/flowRunRepository';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('FlowOrchestrator', () => {
  it('executes flow and persists logs', async () => {
    const agent: AIAgent = {
      id: 'agent-1',
      name: 'Тест',
      description: 'flow',
      status: 'active',
      tags: ['test'],
      temperature: 0.2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      flow: {
        nodes: [
          { id: 'prompt', type: 'prompt', position: { x: 0, y: 0 }, data: { prompt: 'Скажи привет' } },
          { id: 'tool', type: 'tool', position: { x: 200, y: 0 }, data: { toolName: 'echo' } }
        ],
        edges: [{ id: 'e1', source: 'prompt', target: 'tool' }]
      }
    };

    const client = new GenkitClient({ apiKey: undefined });
    const promptSpy = vi.spyOn(client, 'runPrompt').mockResolvedValue('Привет!');
    const toolSpy = vi.spyOn(client, 'runTool').mockResolvedValue({ reply: 'Готово' });

    const orchestrator = new FlowOrchestrator(client, { maxRetries: 0 });

    const result = await orchestrator.execute(agent);

    expect(result.output).toContain('Привет');
    expect(promptSpy).toHaveBeenCalledOnce();
    expect(toolSpy).toHaveBeenCalledOnce();

    const runs = await listRuns(agent.id);
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe('succeeded');
    expect(runs[0].logs.length).toBeGreaterThan(0);
  });

  it('retries on failure and marks run failed', async () => {
    const agent: AIAgent = {
      id: 'agent-2',
      name: 'Ошибка',
      description: 'error',
      status: 'active',
      tags: [],
      temperature: 0.2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      flow: {
        nodes: [{ id: 'prompt', type: 'prompt', position: { x: 0, y: 0 }, data: { prompt: 'fail' } }],
        edges: []
      }
    };

    const client = new GenkitClient({ apiKey: undefined });
    vi.spyOn(client, 'runPrompt').mockRejectedValue(new Error('boom'));

    const orchestrator = new FlowOrchestrator(client, { maxRetries: 1, retryDelayMs: 10 });

    await expect(orchestrator.execute(agent)).rejects.toThrow('boom');

    const runs = await listRuns(agent.id);
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe('failed');
    expect(runs[0].logs.some((log) => log.level === 'error')).toBe(true);
  });
});
