import { describe, expect, it } from 'vitest';
import { buildEstimate, buildLineItem } from '../hooks/useEstimatesRepository';
import { computeTotals, diffEstimates, insertChildLineItem, removeLineItem } from '../utils/estimateUtils';

describe('estimateUtils', () => {
  it('should compute totals with vat', () => {
    const estimate = buildEstimate({
      vatRate: 0.2,
      lineItems: [
        buildLineItem({ quantity: 2, unitPrice: 1000 }),
        buildLineItem({ quantity: 1, unitPrice: 500 })
      ]
    });
    const totals = computeTotals(estimate);
    expect(totals.subtotal).toBe(2500);
    expect(totals.total).toBeCloseTo(3000);
  });

  it('should diff metadata and line items', () => {
    const prev = buildEstimate({ name: 'A' });
    const next = { ...prev, name: 'B', lineItems: [...prev.lineItems] };
    next.lineItems[0] = { ...next.lineItems[0], quantity: 5 };
    const diff = diffEstimates(prev, next);
    expect(diff.metadataChanges.some((change) => change.field === 'name')).toBe(true);
    expect(diff.lineItemChanges[0]).toMatchObject({ type: 'updated' });
  });

  it('should insert and remove line items', () => {
    const base = buildEstimate({ lineItems: [] });
    const withItem = insertChildLineItem(base.lineItems, null);
    expect(withItem).toHaveLength(1);
    const removed = removeLineItem(withItem, withItem[0].id);
    expect(removed).toHaveLength(0);
  });
});
