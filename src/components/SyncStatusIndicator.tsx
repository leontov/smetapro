import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';

export const SyncStatusIndicator = () => {
  const pending = useLiveQuery(async () => {
    const queue = await db.syncQueue.toArray();
    return queue.length;
  }, []);

  return (
    <div
      className="card"
      style={{ marginTop: 'auto', fontSize: '0.875rem', lineHeight: 1.4 }}
    >
      <strong>Синхронизация</strong>
      <div>{pending && pending > 0 ? `${pending} задач в очереди` : 'Все данные синхронизированы'}</div>
    </div>
  );
};
