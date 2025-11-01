# SmetaPro

Modern React + TypeScript workspace bootstrapped with Vite. Includes a production ready toolchain with Tailwind CSS, ESLint, Prettier, Vitest, React Query, Zustand, Dexie (IndexedDB) and a PWA service worker configured via `vite-plugin-pwa`.

## Скрипты

- `npm run dev` — запуск локального дев-сервера Vite.
- `npm run build` — типизация и production-сборка.
- `npm run preview` — предпросмотр собранного приложения.
- `npm run lint` — запуск ESLint.
- `npm run format` — автоформатирование Prettier.
- `npm run test` — Vitest в watch-режиме.
- `npm run test:coverage` — Vitest с отчётом покрытия.

## Технологии

- **Vite + React + TypeScript** для быстрой разработки.
- **Tailwind CSS** — utility-first стили.
- **Zustand** — глобальные сторы пользовательских настроек и сетевого состояния.
- **React Query** — управление серверным состоянием и кешированием.
- **Dexie** — обёртка над IndexedDB с таблицами `projects`, `estimates`, `lineItems`.
- **vite-plugin-pwa** — манифест, сервис-воркер, оффлайн fallback.
- **Vitest** + **Testing Library** — модульные тесты.

## Структура каталогов

```
src/
  app/          # корневые компоненты, роутинг, layout
  modules/      # страничные модули (dashboard, projects, settings)
  shared/       # общие утилиты, сторы, компоненты, типы
public/         # статические ассеты и offline fallback
```

Абсолютные импорты доступны через алиасы `@app`, `@modules`, `@shared`.

## PWA

`vite-plugin-pwa` конфигурирован на автоподписку сервис-воркера, предзагрузку основных ассетов и выдачу `offline.html` при отсутствии сети.

## GitHub Actions

В репозитории настроен workflow `ci.yml`, который проверяет сборку, линтер и тесты при каждом пуше/PR.
