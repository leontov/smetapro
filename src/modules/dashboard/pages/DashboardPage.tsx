import { useEffect, useState } from 'react';

import { db } from '@shared/lib/db';

const DashboardPage = () => {
  const [projectsCount, setProjectsCount] = useState(0);
  const [estimatesCount, setEstimatesCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const [projectsTotal, estimatesTotal] = await Promise.all([
        db.projects.count(),
        db.estimates.count()
      ] as const);
      setProjectsCount(projectsTotal);
      setEstimatesCount(estimatesTotal);
    };

    void fetchCounts();
  }, []);

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-cyan-200">Обзор</h2>
        <p className="mt-1 text-sm text-slate-400">
          Сводка по проектам и оценкам. Здесь появятся последние активности.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm">
          <h3 className="text-sm text-slate-400">Проекты</h3>
          <p className="mt-2 text-3xl font-bold text-slate-100">{projectsCount}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm">
          <h3 className="text-sm text-slate-400">Сметы</h3>
          <p className="mt-2 text-3xl font-bold text-slate-100">{estimatesCount}</p>
        </article>
      </div>
    </section>
  );
};

export default DashboardPage;
