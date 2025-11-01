import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '@shared/lib/db';
import type { ProjectRecord } from '@shared/types/db';

const ProjectsPage = () => {
  const projects = useLiveQuery<ProjectRecord[], ProjectRecord[]>(
    () => db.projects.toArray(),
    [],
    []
  );

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold text-cyan-200">Проекты</h2>
        <p className="mt-1 text-sm text-slate-400">
          Управляйте сметами и проектами. Добавление и редактирование появятся позже.
        </p>
      </header>
      <div className="space-y-3">
        {projects.length > 0 ? (
          projects.map((project) => (
            <article
              key={project.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-100">{project.name}</h3>
              {project.description ? (
                <p className="mt-2 text-sm text-slate-400">{project.description}</p>
              ) : null}
              <p className="mt-3 text-xs text-slate-500">
                Обновлено: {new Date(project.updatedAt).toLocaleString()}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-400">Пока что нет проектов. Начните с добавления нового.</p>
        )}
      </div>
    </section>
  );
};

export default ProjectsPage;
