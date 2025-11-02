import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buildEstimate, useEstimate, useEstimateHistory, useEstimateMutations } from '../hooks/useEstimatesRepository';
import { Estimate, LineItem } from '../data/types';
import { LineItemTree } from '../components/LineItemTree';
import { applyLineItemUpdate, computeTotals, insertChildLineItem, removeLineItem } from '../utils/estimateUtils';
import { useEstimateExporter } from '../services/useEstimateExporter';
import { parseCsvFile } from '../utils/parseCsv';

interface EstimateEditorPageProps {
  createMode?: boolean;
}

export const EstimateEditorPage = ({ createMode = false }: EstimateEditorPageProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const estimateId = params.estimateId;
  const estimate = useEstimate(createMode ? undefined : estimateId);
  const history = useEstimateHistory(estimateId);
  const { saveEstimate } = useEstimateMutations();
  const exporter = useEstimateExporter();
  const [draft, setDraft] = useState<Estimate | undefined>(undefined);
  const [isDirty, setDirty] = useState(false);

  useEffect(() => {
    if (createMode) {
      setDraft((prev) => prev ?? buildEstimate());
      return;
    }
    if (estimate) {
      setDraft(estimate);
      setDirty(false);
    }
  }, [estimate, createMode]);

  const totals = useMemo(() => (draft ? computeTotals(draft) : undefined), [draft]);

  const updateDraft = (updater: (current: Estimate) => Estimate) => {
    setDraft((current) => {
      if (!current) return current;
      const updated = updater(current);
      setDirty(true);
      return computeTotals(updated);
    });
  };

  const handleMetadataChange = (field: keyof Estimate, value: unknown) => {
    updateDraft((current) => ({ ...current, [field]: value, updatedAt: Date.now() } as Estimate));
  };

  const handleLineItemAdd = (parentId: string | null) => {
    updateDraft((current) => ({
      ...current,
      lineItems: insertChildLineItem(current.lineItems, parentId)
    }));
  };

  const handleLineItemRemove = (id: string) => {
    updateDraft((current) => ({
      ...current,
      lineItems: removeLineItem(current.lineItems, id)
    }));
  };

  const handleLineItemUpdate = (item: LineItem) => {
    updateDraft((current) => ({
      ...current,
      lineItems: applyLineItemUpdate(current.lineItems, item)
    }));
  };

  const handleSave = async () => {
    if (!draft) return;
    await saveEstimate({ ...draft, updatedAt: Date.now() });
    setDirty(false);
    if (createMode) {
      navigate(`/estimates/${draft.id}`, { replace: true });
    }
  };

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    if (!draft) return;
    await exporter.exportEstimate(draft, format);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !draft) return;
    const file = event.target.files[0];
    const parsed = await parseCsvFile(file);
    updateDraft((current) => ({ ...current, lineItems: parsed }));
    event.target.value = '';
  };

  if (!draft) {
    return <div className="card">Загрузка...</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ display: 'grid', gap: '0.75rem' }}>
          <h2 style={{ margin: 0 }}>{createMode ? 'Новая смета' : draft.name}</h2>
          <label>
            Название
            <input value={draft.name} onChange={(event) => handleMetadataChange('name', event.target.value)} />
          </label>
          <label>
            Код
            <input value={draft.code} onChange={(event) => handleMetadataChange('code', event.target.value)} />
          </label>
          <label>
            Заказчик
            <input
              value={draft.customer ?? ''}
              onChange={(event) => handleMetadataChange('customer', event.target.value)}
            />
          </label>
          <label>
            Теги (через запятую)
            <input
              value={draft.tags.join(', ')}
              onChange={(event) => handleMetadataChange('tags', event.target.value
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0))}
            />
          </label>
          <label>
            Статус
            <select value={draft.status} onChange={(event) => handleMetadataChange('status', event.target.value)}>
              <option value="draft">Черновик</option>
              <option value="ready">Готово</option>
              <option value="archived">Архив</option>
            </select>
          </label>
          <label>
            НДС
            <input
              type="number"
              value={draft.vatRate}
              onChange={(event) => handleMetadataChange('vatRate', Number(event.target.value))}
            />
          </label>
        </div>
        <LineItemTree
          items={draft.lineItems}
          onAdd={handleLineItemAdd}
          onRemove={handleLineItemRemove}
          onUpdate={handleLineItemUpdate}
        />
      </section>
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ position: 'sticky', top: '1rem', display: 'grid', gap: '0.75rem' }}>
          <div>
            <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>Подытог</div>
            <strong style={{ fontSize: '1.5rem' }}>{totals?.subtotal.toLocaleString('ru-RU')} ₽</strong>
          </div>
          <div>
            <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>Итог с НДС</div>
            <strong style={{ fontSize: '1.75rem' }}>{totals?.total.toLocaleString('ru-RU')} ₽</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="button-primary" type="button" onClick={handleSave} disabled={!isDirty}>
              Сохранить
            </button>
            <button type="button" onClick={() => handleExport('pdf')}>
              PDF
            </button>
            <button type="button" onClick={() => handleExport('xlsx')}>
              XLSX
            </button>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            Импорт CSV
            <input type="file" accept="text/csv" onChange={handleImport} />
          </label>
        </div>
        <div className="card" style={{ maxHeight: '40vh', overflow: 'auto' }}>
          <h3 style={{ marginTop: 0 }}>История версий</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
            {history.map((entry) => (
              <li key={entry.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)', paddingBottom: '0.5rem' }}>
                <div style={{ fontWeight: 600 }}>{new Date(entry.createdAt).toLocaleString('ru-RU')}</div>
                <div style={{ fontSize: '0.875rem' }}>{entry.author}</div>
                <div style={{ opacity: 0.7 }}>{entry.diffSummary}</div>
              </li>
            ))}
            {history.length === 0 && <li>Версии появятся после первого сохранения</li>}
          </ul>
        </div>
      </aside>
      <div
        style={{
          position: 'fixed',
          left: '220px',
          right: 0,
          bottom: 0,
          padding: '1rem',
          background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.95) 45%)',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div>Последнее изменение: {new Date(draft.updatedAt).toLocaleString('ru-RU')}</div>
          <button className="button-primary" type="button" onClick={handleSave} disabled={!isDirty}>
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};
