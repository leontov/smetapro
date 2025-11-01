import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <section className="mx-auto max-w-2xl text-center">
    <h2 className="text-4xl font-bold text-cyan-300">404</h2>
    <p className="mt-4 text-lg text-slate-300">Страница не найдена.</p>
    <Link
      to="/"
      className="mt-6 inline-flex items-center justify-center rounded-md bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/30"
    >
      Вернуться на главную
    </Link>
  </section>
);

export default NotFoundPage;
