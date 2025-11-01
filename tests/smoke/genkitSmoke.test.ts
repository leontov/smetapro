import { describe, expect, it } from 'vitest';
import { GenkitClient } from '../../src/genkit/GenkitClient';

const apiKey = process.env.GENKIT_API_KEY;

if (!apiKey) {
  describe.skip('Genkit smoke test', () => {
    it('skipped because GENKIT_API_KEY is not set', () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe('Genkit smoke test', () => {
    it('performs a real prompt request', async () => {
      const client = new GenkitClient({ apiKey, endpoint: process.env.GENKIT_ENDPOINT });
      const response = await client.runPrompt('Ответь словом test', {});
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    }, 15000);
  });
}
