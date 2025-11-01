import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AIAgent, AgentStatus, Estimate, FlowExecutionResult, FlowRun } from '../data/types';
import {
  createAgent as createAgentRepo,
  deleteAgent as deleteAgentRepo,
  getAgent,
  listAgents,
  seedAgents,
  updateAgent as updateAgentRepo
} from '../data/repositories/agentRepository';
import { listRuns } from '../data/repositories/flowRunRepository';
import { FlowOrchestrator } from '../flow/FlowOrchestrator';
import { GenkitClient } from '../genkit/GenkitClient';

export interface AgentFilters {
  status: AgentStatus | 'all';
  tags: string[];
  search: string;
  estimateId?: string;
}

export interface AgentStoreValue {
  agents: AIAgent[];
  runs: FlowRun[];
  selectedAgent?: AIAgent;
  isLoading: boolean;
  filters: AgentFilters;
  selectAgent: (id?: string) => void;
  setFilters: (filters: Partial<AgentFilters>) => void;
  refreshAgents: () => Promise<void>;
  refreshRuns: () => Promise<void>;
  createAgent: (payload: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt' | 'flow'> & { flow?: AIAgent['flow'] }) => Promise<AIAgent>;
  updateAgent: (id: string, payload: Partial<Omit<AIAgent, 'id' | 'createdAt'>>) => Promise<AIAgent | undefined>;
  deleteAgent: (id: string) => Promise<void>;
  executeAgent: (agentId: string, estimate?: Estimate) => Promise<FlowExecutionResult>;
}

const AgentStoreContext = createContext<AgentStoreValue | undefined>(undefined);

const defaultFilters: AgentFilters = {
  status: 'all',
  tags: [],
  search: ''
};

export const AgentStoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [runs, setRuns] = useState<FlowRun[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const [filters, setFiltersState] = useState<AgentFilters>(defaultFilters);
  const [isLoading, setLoading] = useState(true);
  const orchestratorRef = useRef(new FlowOrchestrator(new GenkitClient(), { maxRetries: 2, retryDelayMs: 500 }));

  const refreshAgents = useCallback(async () => {
    setLoading(true);
    const items = await listAgents(filters);
    setAgents(items);
    setLoading(false);
  }, [filters]);

  const refreshRuns = useCallback(async () => {
    const items = await listRuns(selectedAgentId);
    setRuns(items);
  }, [selectedAgentId]);

  useEffect(() => {
    (async () => {
      await seedAgents();
      await refreshAgents();
    })();
  }, [refreshAgents]);

  useEffect(() => {
    refreshAgents();
  }, [filters, refreshAgents]);

  useEffect(() => {
    refreshRuns();
  }, [selectedAgentId, refreshRuns]);

  const selectedAgent = useMemo(() => agents.find((agent) => agent.id === selectedAgentId), [agents, selectedAgentId]);

  const selectAgent = (id?: string) => {
    setSelectedAgentId(id);
  };

  const setFilters = (partial: Partial<AgentFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  };

  const createAgent = async (payload: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt' | 'flow'> & { flow?: AIAgent['flow'] }) => {
    const agent = await createAgentRepo(payload);
    await refreshAgents();
    setSelectedAgentId(agent.id);
    return agent;
  };

  const updateAgent = async (id: string, payload: Partial<Omit<AIAgent, 'id' | 'createdAt'>>) => {
    const agent = await updateAgentRepo(id, payload);
    await refreshAgents();
    if (agent) {
      setSelectedAgentId(agent.id);
    }
    return agent;
  };

  const deleteAgent = async (id: string) => {
    await deleteAgentRepo(id);
    if (selectedAgentId === id) {
      setSelectedAgentId(undefined);
    }
    await refreshAgents();
  };

  const executeAgent = async (agentId: string, estimate?: Estimate) => {
    const agent = await getAgent(agentId);
    if (!agent) {
      throw new Error('Агент не найден');
    }
    const result = await orchestratorRef.current.execute(agent, estimate);
    await refreshRuns();
    return result;
  };

  const value: AgentStoreValue = {
    agents,
    runs,
    selectedAgent,
    isLoading,
    filters,
    selectAgent,
    setFilters,
    refreshAgents,
    refreshRuns,
    createAgent,
    updateAgent,
    deleteAgent,
    executeAgent
  };

  return <AgentStoreContext.Provider value={value}>{children}</AgentStoreContext.Provider>;
};

export const useAgentStore = () => {
  const context = useContext(AgentStoreContext);
  if (!context) {
    throw new Error('useAgentStore должен использоваться внутри AgentStoreProvider');
  }
  return context;
};
