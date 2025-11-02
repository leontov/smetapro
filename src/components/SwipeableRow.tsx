import { useRef, useState } from 'react';

interface SwipeableRowProps {
  children: React.ReactNode;
  actions: React.ReactNode;
}

export const SwipeableRow = ({ children, actions }: SwipeableRowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);

  const onPointerDown = (event: React.PointerEvent) => {
    startX.current = event.clientX;
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging || startX.current == null) return;
    const delta = event.clientX - startX.current;
    if (delta < 0) {
      setOffset(Math.max(delta, -160));
    }
  };

  const onPointerUp = () => {
    setDragging(false);
    if (offset < -80) {
      setOffset(-160);
    } else {
      setOffset(0);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', overflow: 'hidden' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '160px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          background: 'rgba(220, 38, 38, 0.9)'
        }}
      >
        {actions}
      </div>
      <div
        className="card"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
          cursor: 'grab'
        }}
      >
        {children}
      </div>
    </div>
  );
};
