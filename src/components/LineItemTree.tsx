import { Fragment } from 'react';
import { LineItem } from '../data/types';

interface LineItemTreeProps {
  items: LineItem[];
  onAdd: (parentId: string | null) => void;
  onRemove: (id: string) => void;
  onUpdate: (item: LineItem) => void;
}

export const LineItemTree = ({ items, onAdd, onRemove, onUpdate }: LineItemTreeProps) => {
  const renderNode = (item: LineItem, level = 0) => {
    const indent = level * 24;
    return (
      <Fragment key={item.id}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 2fr) repeat(4, minmax(100px, 1fr)) 120px',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)'
          }}
        >
          <div style={{ paddingLeft: `${indent}px` }}>
            <input
              value={item.name}
              onChange={(event) => onUpdate({ ...item, name: event.target.value })}
            />
          </div>
          <input
            value={item.unit}
            onChange={(event) => onUpdate({ ...item, unit: event.target.value })}
          />
          <input
            type="number"
            value={item.quantity}
            onChange={(event) => onUpdate({ ...item, quantity: Number(event.target.value) })}
          />
          <input
            type="number"
            value={item.unitPrice}
            onChange={(event) => onUpdate({ ...item, unitPrice: Number(event.target.value) })}
          />
          <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {(item.quantity * item.unitPrice).toLocaleString('ru-RU')}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={() => onAdd(item.id)}>
              +
            </button>
            <button type="button" onClick={() => onRemove(item.id)}>
              ×
            </button>
          </div>
        </div>
        {item.children?.map((child) => renderNode(child, level + 1))}
      </Fragment>
    );
  };

  return (
    <div className="card" style={{ padding: 0 }}>
      <header
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 2fr) repeat(4, minmax(100px, 1fr)) 120px',
          gap: '0.5rem',
          padding: '0.75rem 0.5rem',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          opacity: 0.6
        }}
      >
        <div>Позиция</div>
        <div>Ед.</div>
        <div>Кол-во</div>
        <div>Цена</div>
        <div>Сумма</div>
        <div>Действия</div>
      </header>
      <div>{items.map((item) => renderNode(item))}</div>
      <footer style={{ padding: '0.75rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
        <button className="button-primary" type="button" onClick={() => onAdd(null)}>
          + Добавить позицию
        </button>
      </footer>
    </div>
  );
};
