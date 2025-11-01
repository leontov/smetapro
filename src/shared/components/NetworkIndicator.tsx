import { useMemo } from 'react';

import { useNetworkStatusStore } from '@shared/store/networkStatus';

const NetworkIndicator = () => {
  const { isOnline, lastChangedAt } = useNetworkStatusStore((state) => ({
    isOnline: state.isOnline,
    lastChangedAt: state.lastChangedAt
  }));

  const label = useMemo(() => (isOnline ? 'Онлайн' : 'Оффлайн'), [isOnline]);
  const indicatorColor = isOnline ? 'bg-emerald-400' : 'bg-rose-400';
  const timestamp = lastChangedAt ? new Date(lastChangedAt).toLocaleTimeString() : null;

  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span className={`h-2.5 w-2.5 rounded-full ${indicatorColor}`} aria-hidden="true" />
      <span>{label}</span>
      {timestamp ? <span className="text-slate-500">({timestamp})</span> : null}
    </div>
  );
};

export default NetworkIndicator;
