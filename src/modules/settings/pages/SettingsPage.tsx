import { ChangeEvent } from 'react';

import {
  selectLanguage,
  selectNotifications,
  selectTheme,
  useUserPreferencesStore
} from '@shared/store/userPreferences';

const themes = [
  { value: 'system', label: 'Системная' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' }
] as const;

const SettingsPage = () => {
  const theme = useUserPreferencesStore(selectTheme);
  const language = useUserPreferencesStore(selectLanguage);
  const notifications = useUserPreferencesStore(selectNotifications);
  const setTheme = useUserPreferencesStore((state) => state.setTheme);
  const setLanguage = useUserPreferencesStore((state) => state.setLanguage);
  const toggleNotifications = useUserPreferencesStore((state) => state.toggleNotifications);

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-cyan-200">Настройки</h2>
        <p className="mt-1 text-sm text-slate-400">Персонализируйте приложение под себя.</p>
      </header>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Тема интерфейса
          </h3>
          <div className="flex flex-wrap gap-3">
            {themes.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`rounded-lg border px-4 py-2 text-sm transition ${
                  theme === option.value
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200'
                    : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Язык</h3>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          >
            <option value="ru-RU">Русский</option>
            <option value="en-US">English</option>
          </select>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Уведомления</h3>
            <p className="text-xs text-slate-400">
              Получайте напоминания об обновлениях проекта.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleNotifications()}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              notifications ? 'bg-cyan-400/70' : 'bg-slate-700'
            }`}
            aria-pressed={notifications}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                notifications ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SettingsPage;
