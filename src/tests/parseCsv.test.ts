import { describe, expect, it } from 'vitest';
import { parseCsvFile } from '../utils/parseCsv';

describe('parseCsvFile', () => {
  it('parses csv into line items', async () => {
    const csv = 'name,unit,quantity,unitPrice\nРабота,ч,5,1200';
    const fakeBlob = { text: async () => csv } as unknown as Blob;
    const items = await parseCsvFile(fakeBlob);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: 'Работа', unit: 'ч', quantity: 5, unitPrice: 1200 });
  });
});
