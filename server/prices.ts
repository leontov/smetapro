import axios from 'axios';
import { v4 as uuid } from 'uuid';
import type { PriceSource } from './types';

const REAL_ENDPOINT = process.env.PRICE_SOURCE_REAL_ENDPOINT ?? 'https://open.er-api.com/v6/latest/USD';
const MOCK_ENDPOINT = process.env.PRICE_SOURCE_MOCK_ENDPOINT ?? 'https://mocki.io/v1/7c0b6ffc-04d3-4bb9-8af6-6b9d6c03c45f';

const priceSources: PriceSource[] = [
  {
    id: uuid(),
    name: 'Mock прайс-лист',
    provider: 'Smetapro Labs',
    endpoint: MOCK_ENDPOINT,
    enabled: true,
    latencyMs: 45,
    isMock: true
  },
  {
    id: uuid(),
    name: 'Реальный поставщик',
    provider: 'ExchangeRates API',
    endpoint: REAL_ENDPOINT,
    enabled: false,
    latencyMs: 180
  }
];

export const listPriceSources = () => priceSources;

export const togglePriceSource = (id: string, enabled: boolean): PriceSource | undefined => {
  const source = priceSources.find((item) => item.id === id);
  if (!source) return undefined;
  source.enabled = enabled;
  return source;
};

export const fetchPrices = async () => {
  const activeSources = priceSources.filter((source) => source.enabled);
  if (activeSources.length === 0) {
    return { source: null, prices: [] };
  }

  const source = activeSources[0];
  const startedAt = Date.now();
  const { data } = await axios.get(source.endpoint);
  source.latencyMs = Date.now() - startedAt;

  const prices = Object.entries(data.rates ?? data).slice(0, 10).map(([name, value]) => ({
    name,
    value
  }));

  return { source, prices };
};
