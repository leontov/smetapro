import EventEmitter from 'events';
import cron from 'node-cron';
import { fetchPrices, listPriceSources } from './prices';

export interface AgentStatus {
  activeSources: number;
  lastNotification?: {
    sourceId: string;
    items: number;
    timestamp: string;
  };
}

class Agent extends EventEmitter {
  lastNotification?: AgentStatus['lastNotification'];

  start() {
    cron.schedule('*/15 * * * *', async () => {
      try {
        const result = await fetchPrices();
        if (result.source) {
          this.lastNotification = {
            sourceId: result.source.id,
            items: result.prices.length,
            timestamp: new Date().toISOString()
          };
          this.emit('completed', this.lastNotification);
        }
      } catch (error) {
        this.emit('failed', error as Error);
      }
    });
  }
}

export const agent = new Agent();

export const getAgentStatus = (): AgentStatus => ({
  activeSources: listPriceSources().filter((source) => source.enabled).length,
  lastNotification: agent.lastNotification
});
