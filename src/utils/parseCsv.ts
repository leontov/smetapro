import { nanoid } from 'nanoid';
import { LineItem } from '../data/types';

export const parseCsvFile = async (file: Blob): Promise<LineItem[]> => {
  const text = 'text' in file && typeof (file as any).text === 'function'
    ? await (file as Blob & { text: () => Promise<string> }).text()
    : await new Response(file).text();

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const header = lines[0].split(',').map((cell) => cell.trim().toLowerCase());
  const dataRows = lines.slice(1).map((row) => row.split(',').map((cell) => cell.trim()));
  const getIndex = (name: string) => header.findIndex((column) => column === name);
  const idxName = getIndex('name');
  const idxUnit = getIndex('unit');
  const idxQty = getIndex('quantity');
  const idxPrice = getIndex('unitprice');

  return dataRows.map((cells, index) => ({
    id: nanoid(),
    parentId: null,
    name: cells[idxName] ?? `Позиция ${index + 1}`,
    unit: cells[idxUnit] ?? 'шт',
    quantity: Number(cells[idxQty] ?? 1),
    unitPrice: Number(cells[idxPrice] ?? 0),
    sortOrder: Date.now() + index,
    children: []
  }));
};
