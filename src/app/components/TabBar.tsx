import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Главная', icon: 'home' },
  { to: '/projects', label: 'Проекты', icon: 'folder' },
  { to: '/settings', label: 'Настройки', icon: 'settings' }
];

const icons: Record<string, string> = {
  home: 'M3 12l7-9 7 9H3zm0 2h14v7H3v-7z',
  folder: 'M2 6h6l2 2h8v10H2V6z',
  settings:
    'M12 8a4 4 0 100 8 4 4 0 000-8zm8 4.5l-1.7-.3a6.9 6.9 0 00-.7-1.7l1-1.5-2-2-1.5 1a6.9 6.9 0 00-1.7-.7L13.5 5h-3l-.3 1.7a6.9 6.9 0 00-1.7.7l-1.5-1-2 2 1 1.5a6.9 6.9 0 00-.7 1.7L4 12.5v3l1.7.3a6.9 6.9 0 00.7 1.7l-1 1.5 2 2 1.5-1a6.9 6.9 0 001.7.7l.3 1.7h3l.3-1.7a6.9 6.9 0 001.7-.7l1.5 1 2-2-1-1.5a6.9 6.9 0 00.7-1.7l1.7-.3v-3z'
};

const TabBar = () => (
  <nav className="border-t border-slate-800 bg-slate-900/80 backdrop-blur">
    <ul className="mx-auto flex max-w-5xl items-center justify-around px-4 py-3 text-sm">
      {tabs.map((tab) => (
        <li key={tab.to}>
          <NavLink
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`
            }
            end={tab.to === '/'}
          >
            <span className="flex h-6 w-6 items-center justify-center">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d={icons[tab.icon]} />
              </svg>
            </span>
            <span>{tab.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default TabBar;
