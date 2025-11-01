import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../src/data/db';
import {
  createAgent,
  deleteAgent,
  listAgents,
  seedAgents,
  updateAgent
} from '../../src/data/repositories/agentRepository';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('agentRepository', () => {
  it('creates and retrieves agents with filters', async () => {
    const created = await createAgent({
      name: 'Тестовый агент',
      description: 'Проверка',
      status: 'active',
      tags: ['test', 'smr'],
      temperature: 0.1,
      estimateId: 'estimate-1'
    });

    const draft = await createAgent({
      name: 'Черновик',
      description: 'draft',
      status: 'draft',
      tags: ['draft'],
      temperature: 0.5
    });

    let agents = await listAgents();
    expect(agents).toHaveLength(2);

    agents = await listAgents({ status: 'active' });
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe(created.name);

    agents = await listAgents({ tags: ['draft'] });
    expect(agents[0].name).toBe('Черновик');

    agents = await listAgents({ estimateId: 'estimate-1' });
    expect(agents).toHaveLength(1);
    expect(agents[0].id).toBe(created.id);
  });

  it('updates and deletes agents', async () => {
    const agent = await createAgent({
      name: 'Агент',
      description: 'Описание',
      status: 'draft',
      tags: ['demo'],
      temperature: 0.2
    });

    const updated = await updateAgent(agent.id, { description: 'Новый текст', status: 'active' });
    expect(updated?.description).toBe('Новый текст');
    expect(updated?.status).toBe('active');

    await deleteAgent(agent.id);
    const agents = await listAgents();
    expect(agents).toHaveLength(0);
  });

  it('seedAgents populates demo data only once', async () => {
    await seedAgents();
    const first = await listAgents();
    await seedAgents();
    const second = await listAgents();
    expect(first).toHaveLength(second.length);
  });
});
