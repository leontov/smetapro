import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PromptNode } from './nodes/PromptNode';
import { ToolNode } from './nodes/ToolNode';
import { DataNode } from './nodes/DataNode';
import { useAgentStore } from '../state/AgentStore';
import { fromReactFlow, toReactFlow } from '../flow/graph';

type BuilderNodeData = {
  prompt?: string;
  toolName?: string;
  source?: string;
  mapping?: Record<string, string>;
  onChange?: (...args: any[]) => void;
};

const nodeTypes = {
  prompt: PromptNode,
  tool: ToolNode,
  data: DataNode
};

type BuilderNode = Node<BuilderNodeData>;

const createNode = (type: 'prompt' | 'tool' | 'data', position = { x: 250, y: 5 }): BuilderNode => {
  if (type === 'prompt') {
    return {
      id: crypto.randomUUID(),
      type,
      data: { prompt: '', mapping: {}, toolName: '', source: '' },
      position
    };
  }
  if (type === 'tool') {
    return {
      id: crypto.randomUUID(),
      type,
      data: { toolName: '' },
      position
    };
  }
  return {
    id: crypto.randomUUID(),
    type,
    data: { source: 'estimate', mapping: { summary: 'notes' } },
    position
  };
};

const sanitizeNodes = (nodes: BuilderNode[]): BuilderNode[] =>
  nodes.map((node) => ({
    ...node,
    data:
      node.type === 'prompt'
        ? { prompt: (node.data as any).prompt ?? '' }
        : node.type === 'tool'
          ? { toolName: (node.data as any).toolName ?? '' }
          : { source: (node.data as any).source ?? 'estimate', mapping: (node.data as any).mapping ?? {} }
  })) as BuilderNode[];

export const FlowBuilder: React.FC = () => {
  const { selectedAgent, updateAgent } = useAgentStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<BuilderNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isDirty, setDirty] = useState(false);

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      setDirty(true);
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      setDirty(true);
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  useEffect(() => {
    if (!selectedAgent) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const { nodes: initialNodes, edges: initialEdges } = toReactFlow(selectedAgent.flow);
    const hydratedNodes = initialNodes.map((node) => {
      if (node.type === 'prompt') {
        return {
          ...node,
          data: {
            prompt: (node.data as any).prompt ?? '',
            onChange: (prompt: string) => {
              setNodes((nds) =>
                nds.map((item) => (item.id === node.id ? { ...item, data: { ...item.data, prompt } } : item))
              );
              setDirty(true);
            }
          }
        };
      }
      if (node.type === 'tool') {
        return {
          ...node,
          data: {
            toolName: (node.data as any).toolName ?? '',
            onChange: (toolName: string) => {
              setNodes((nds) =>
                nds.map((item) => (item.id === node.id ? { ...item, data: { ...item.data, toolName } } : item))
              );
              setDirty(true);
            }
          }
        };
      }
      return {
        ...node,
        data: {
          source: (node.data as any).source ?? 'estimate',
          mapping: (node.data as any).mapping ?? { summary: 'notes' },
          onChange: (changes: { source?: string; mapping?: Record<string, string> }) => {
            setNodes((nds) =>
              nds.map((item) =>
                item.id === node.id
                  ? {
                      ...item,
                      data: {
                        ...item.data,
                        ...(changes.source ? { source: changes.source } : {}),
                        ...(changes.mapping ? { mapping: changes.mapping } : {})
                      }
                    }
                  : item
              )
            );
            setDirty(true);
          }
        }
      };
    }) as BuilderNode[];
    setNodes(hydratedNodes);
    setEdges(initialEdges);
    setDirty(false);
  }, [selectedAgent, setEdges, setNodes]);

  const addNode = (type: 'prompt' | 'tool' | 'data') => {
    const node = createNode(type, { x: 150 + nodes.length * 40, y: 120 + nodes.length * 60 });
    if (type === 'prompt') {
      node.data = { prompt: '', onChange: (value: string) => handleNodeChange(node.id, { prompt: value }) };
    } else if (type === 'tool') {
      node.data = { toolName: '', onChange: (value: string) => handleNodeChange(node.id, { toolName: value }) };
    } else {
      node.data = {
        source: 'estimate',
        mapping: { field_1: 'notes' },
        onChange: (changes: { source?: string; mapping?: Record<string, string> }) =>
          handleNodeChange(node.id, changes)
      };
    }
    setNodes((nds) => nds.concat(node));
    setDirty(true);
  };

  const handleNodeChange = (nodeId: string, changes: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== nodeId) return node;
        if (node.type === 'prompt') {
          return { ...node, data: { ...node.data, prompt: changes.prompt ?? (node.data as any).prompt } };
        }
        if (node.type === 'tool') {
          return { ...node, data: { ...node.data, toolName: changes.toolName ?? (node.data as any).toolName } };
        }
        return {
          ...node,
          data: {
            ...node.data,
            source: changes.source ?? (node.data as any).source,
            mapping: changes.mapping ?? (node.data as any).mapping
          }
        };
      })
    );
    setDirty(true);
  };

  const onConnect = (connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, id: crypto.randomUUID() }, eds));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!selectedAgent) return;
    const serialized = fromReactFlow(
      sanitizeNodes(
        nodes.map((node) => ({
          ...node,
          data:
            node.type === 'prompt'
              ? { prompt: (node.data as any).prompt }
              : node.type === 'tool'
                ? { toolName: (node.data as any).toolName }
                : { source: (node.data as any).source, mapping: (node.data as any).mapping }
        }))
      ),
      edges
    );
    await updateAgent(selectedAgent.id, { flow: serialized });
    setDirty(false);
  };

  const canEdit = Boolean(selectedAgent);
  const info = useMemo(
    () =>
      !selectedAgent
        ? 'Выберите агента, чтобы настроить сценарий.'
        : `Редактирование сценария агента «${selectedAgent.name}»` + (isDirty ? ' (есть несохранённые изменения)' : ''),
    [isDirty, selectedAgent]
  );

  return (
    <div className="stack">
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>Flow Builder</h3>
          <p style={{ margin: 0, color: '#4b5563' }}>{info}</p>
        </div>
        <div className="stack-row" style={{ gap: '0.5rem' }}>
          <button type="button" onClick={() => addNode('prompt')} disabled={!canEdit}>
            + Prompt
          </button>
          <button type="button" onClick={() => addNode('tool')} disabled={!canEdit}>
            + Tool
          </button>
          <button type="button" onClick={() => addNode('data')} disabled={!canEdit}>
            + Data
          </button>
          <button className="primary" type="button" disabled={!isDirty || !canEdit} onClick={handleSave}>
            Сохранить граф
          </button>
        </div>
      </div>
      <div style={{ height: 520, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 25px rgba(15,23,42,0.08)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background gap={24} size={1} />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};
