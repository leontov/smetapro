import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEstimateMutations, useEstimates } from '../hooks/useEstimatesRepository';
import { Estimate } from '../data/types';
import { SwipeableRow } from '../components/SwipeableRow';

const statusLabels: Record<Estimate['status'], string> = {
  draft: 'Черновик',
  ready: 'Готово',
  archived: 'Архив'
};

export const EstimatesListPage = () => {
  const navigate = useNavigate();
  const estimates = useEstimates();
  const { removeEstimate, createBlankEstimate } = useEstimateMutations();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Estimate['status'] | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');

  const filtered = useMemo(() => {
    return estimates.filter((estimate) => {
      const matchesSearch = `${estimate.name} ${estimate.code} ${estimate.customer ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
      const matchesTags = tagFilter ? estimate.tags.includes(tagFilter) : true;
      return matchesSearch && matchesStatus && matchesTags;
    });
  }, [estimates, search, statusFilter, tagFilter]);

  const allTags = useMemo(() => Array.from(new Set(estimates.flatMap((estimate) => estimate.tags))), [
    estimates
  ]);

  const handleCreate = async () => {
    const id = await createBlankEstimate();
    navigate(`/estimates/${id}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <h2 style={{ margin: 0, flex: 1 }}>Список смет</h2>
        <button className="button-primary" onClick={handleCreate} type="button">
          + Новая смета
        </button>
      </header>
      <section className="card" style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            placeholder="Поиск..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ flex: 1 }}
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as Estimate['status'] | 'all')}
          >
            <option value="all">Все статусы</option>
            <option value="draft">Черновики</option>
            <option value="ready">Готовые</option>
            <option value="archived">Архив</option>
          </select>
          <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
            <option value="">Все теги</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map((estimate) => (
          <SwipeableRow
            key={estimate.id}
            actions={
              <>
                <button
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.6)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    padding: '0.5rem'
                  }}
                  onClick={() => removeEstimate(estimate.id)}
                >
                  Удалить
                </button>
              </>
            }
          >
            <Link
              to={`/estimates/${estimate.id}`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                display: 'block'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem' }}>{estimate.name}</h3>
                  <div style={{ opacity: 0.7, fontSize: '0.875rem' }}>{estimate.code}</div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    {estimate.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: 'rgba(148, 163, 184, 0.2)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1.25rem' }}>{estimate.total.toLocaleString('ru-RU')} ₽</strong>
                  <div style={{ opacity: 0.7, fontSize: '0.875rem' }}>
                    {statusLabels[estimate.status]}
                  </div>
                  <div style={{ opacity: 0.5, fontSize: '0.75rem' }}>
                    Обновлено {new Date(estimate.updatedAt).toLocaleString('ru-RU')}
                  </div>
                </div>
              </div>
            </Link>
          </SwipeableRow>
        ))}
        {filtered.length === 0 && <div style={{ opacity: 0.6 }}>Сметы не найдены</div>}
      </section>
    </div>
  );
};
