import type { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  pulse?: boolean;
}

const Skeleton: FC<SkeletonProps> = ({ className, pulse = true, ...props }) => (
  <div
    role="presentation"
    aria-hidden="true"
    className={clsx(
      'bg-slate-700/60 rounded-lg',
      pulse ? 'animate-pulse' : '',
      className
    )}
    {...props}
  />
);

export default Skeleton;
