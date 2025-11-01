import { db } from '../db';
import type { AIAgent, AgentStatus } from '../types';

const now = () => new Date().toISOString();

const defaultFlow = () => ({ nodes: [], edges: [] });

export async function listAgents(filter?: {
  status?: AgentStatus | 'all';
  estimateId?: string;
  search?: string;
  tags?: string[];
}): Promise<AIAgent[]> {
  let collection = db.aiAgents.toCollection();

  if (filter?.status && filter.status !== 'all') {
    collection = collection.and((agent) => agent.status === filter.status);
  }

  if (filter?.estimateId) {
    collection = collection.and((agent) => agent.estimateId === filter.estimateId);
  }

  if (filter?.tags?.length) {
    const tags = filter.tags.map((t) => t.toLowerCase());
    collection = collection.and((agent) => agent.tags.some((tag) => tags.includes(tag.toLowerCase())));
  }

  const agents = await collection.sortBy('updatedAt');
  const search = filter?.search?.toLowerCase();
  if (!search) {
    return agents.reverse();
  }

  return agents
    .filter((agent) =>
      agent.name.toLowerCase().includes(search) || agent.description.toLowerCase().includes(search)
    )
    .reverse();
}

export async function createAgent(partial: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt' | 'flow'> & { flow?: AIAgent['flow'] }): Promise<AIAgent> {
  const agent: AIAgent = {
    ...partial,
    flow: partial.flow ?? defaultFlow(),
    id: crypto.randomUUID(),
    createdAt: now(),
    updatedAt: now()
  };
  await db.aiAgents.add(agent);
  return agent;
}

export async function updateAgent(id: string, changes: Partial<Omit<AIAgent, 'id' | 'createdAt'>>): Promise<AIAgent | undefined> {
  const existing = await db.aiAgents.get(id);
  if (!existing) return undefined;
  const updated: AIAgent = {
    ...existing,
    ...changes,
    flow: changes.flow ?? existing.flow,
    updatedAt: now()
  };
  await db.aiAgents.put(updated);
  return updated;
}

export async function deleteAgent(id: string): Promise<void> {
  await db.aiAgents.delete(id);
}

export async function getAgent(id: string): Promise<AIAgent | undefined> {
  return db.aiAgents.get(id);
}

export async function seedAgents() {
  const existing = await db.aiAgents.count();
  if (existing > 0) return;

  await db.aiAgents.bulkAdd([
    {
      id: crypto.randomUUID(),
      name: 'Эксперт по сметам',
      description: 'Автоматизирует проверку и оптимизацию смет по последним нормативам.',
      tags: ['смета', 'эксперт'],
      status: 'active',
      flow: defaultFlow(),
      createdAt: now(),
      updatedAt: now(),
      temperature: 0.2,
      estimateId: undefined
    },
    {
      id: crypto.randomUUID(),
      name: 'Аналитик закупок',
      description: 'Сверяет цены и подбирает оптимальных поставщиков.',
      tags: ['закупки', 'анализ'],
      status: 'draft',
      flow: defaultFlow(),
      createdAt: now(),
      updatedAt: now(),
      temperature: 0.5,
      estimateId: undefined
    }
  ]);
}
