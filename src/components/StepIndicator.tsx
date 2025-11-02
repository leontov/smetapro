import type { FC } from 'react';
import clsx from 'clsx';

interface StepIndicatorProps {
  total: number;
  current: number;
}

const StepIndicator: FC<StepIndicatorProps> = ({ total, current }) => (
  <div className="flex items-center gap-2" aria-hidden="true">
    {Array.from({ length: total }).map((_, index) => (
      <span
        key={index}
        className={clsx(
          'h-2 rounded-full transition-all duration-300',
          index < current
            ? 'bg-primary w-8'
            : index === current
            ? 'bg-primary/80 w-6'
            : 'bg-slate-600 w-4'
        )}
      />
    ))}
  </div>
);

export default StepIndicator;
