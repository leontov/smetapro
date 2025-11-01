import type { Edge, Node } from 'reactflow';
import type { FlowNodeMeta, SerializedFlow } from '../data/types';

export function toReactFlow(flow: SerializedFlow): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: flow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      data: node.data,
      position: node.position
    })),
    edges: flow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    }))
  };
}

export function fromReactFlow(nodes: Node[], edges: Edge[]): SerializedFlow {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: (node.type as FlowNodeMeta['type']) ?? 'prompt',
      data: node.data as FlowNodeMeta['data'],
      position: node.position
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    }))
  };
}

export function computeExecutionOrder(flow: SerializedFlow): FlowNodeMeta[] {
  const incoming = new Map<string, number>();
  flow.nodes.forEach((node) => incoming.set(node.id, 0));
  flow.edges.forEach((edge) => {
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
  });

  const queue: FlowNodeMeta[] = flow.nodes.filter((node) => (incoming.get(node.id) ?? 0) === 0);
  const result: FlowNodeMeta[] = [];
  const outgoing = flow.edges.reduce<Record<string, string[]>>((acc, edge) => {
    acc[edge.source] = acc[edge.source] ?? [];
    acc[edge.source].push(edge.target);
    return acc;
  }, {});

  while (queue.length) {
    const node = queue.shift()!;
    result.push(node);
    const neighbors = outgoing[node.id] ?? [];
    neighbors.forEach((target) => {
      const next = (incoming.get(target) ?? 1) - 1;
      incoming.set(target, next);
      if (next === 0) {
        const found = flow.nodes.find((n) => n.id === target);
        if (found) {
          queue.push(found);
        }
      }
    });
  }

  if (result.length !== flow.nodes.length) {
    throw new Error('Flow содержит циклы или некорректные связи');
  }

  return result;
}
