# QuickEstimate Builder — архитектурная спецификация (v0.1)

## 1. Каркас фронтенда

### 1.1 Архитектурные принципы
- **Стек**: TypeScript 5.x, React 18 с Vite, React Router v6. PWA-обвязка — Workbox + vite-plugin-pwa.
- **Организация кода**: Feature-Sliced Design (layers: `app`, `processes`, `pages`, `widgets`, `features`, `entities`, `shared`).
- **Состояние**: глобальные срезы на Zustand (persist через Dexie). Для асинхронных данных — React Query.
- **Расширяемость**: модульность агента, репортов и синхронизации через сервисы и токены зависимостей.
- **Мобильный-first**: layout в единичной колонке с sticky-элементами, виртуализация списков, поддержка жестов.

### 1.2 Основные страницы и маршруты
| Route | Раздел | Ключевые виджеты/фичи | Основные состояния |
| --- | --- | --- | --- |
| `/dashboard` | **Dashboard** | `OverviewCards`, `SyncStatus`, `AgentHighlights` | `syncSlice`, `agentSlice`, `estimateSlice` |
| `/estimates` | **Estimate Directory** | `EstimateList`, `FilterDrawer`, `BulkActionsToolbar` | `estimateSlice`, `uiSlice` |
| `/estimates/:id` | **Estimate Workspace** | `EstimateSummary`, `EstimateTree`, `KPIBar`, `RevisionTimeline`, `AgentSidebar` | `estimateSlice`, `agentSlice`, `uiSlice` |
| `/agents` | **Agents Hub** | `AgentGallery`, `AgentMetrics`, `ExecutionLogPanel` | `agentSlice`, `syncSlice` |
| `/agents/:id` | **Agent Builder** | `GoalStep`, `ContextStep`, `PromptStep`, `ReviewStep`, предпросмотр | локальный мастер + `agentSlice` |
| `/reports` | **Reports & Insights** | `ReportTemplates`, `ChartDeck`, `ExportQueue` | `reportSlice`, `syncSlice` |
| `/onboarding` | **Onboarding & Help** | `Checklist`, `InteractiveGuide`, `ResourceCards` | `uiSlice`, `authSlice` |
| `/settings` | **Settings** | `ProfilePanel`, `ConnectionsManager`, `StorageDiagnostics` | `authSlice`, `syncSlice`, `uiSlice` |

### 1.3 Слои компонентов
- **AppRoot**: провайдеры (Zustand, QueryClient, Intl, Theme, ErrorBoundary) + `<AppShell/>`.
- **AppShell**: нижняя таб-навигация (5 пунктов), `<FloatingActionPanel/>`, `<ModalHost/>`.
- **Widgets**: композиции сущностей (например, `EstimateTree` = `TreeVirtualList` + `NodeActionSheet`).
- **Features**: изолированные бизнес-действия (`estimate-create`, `estimate-duplicate`, `agent-run`, `report-export`).
- **Entities**: модели + компоненты просмотра (`EstimateCard`, `AgentCard`).
- **Shared**: UI-kit на Tailwind CSS (utility first + headless компоненты: кнопки, карточки, дроуэры, bottom-sheets).

### 1.4 Управление состоянием и синхронизацией
- **Zustand slices**:
  - `authSlice`: пользователь, токены, флаги онбординга.
  - `estimateSlice`: справочники смет, группы, позиции, черновики.
  - `agentSlice`: конфигурации агентов, черновики мастер-редактора, история запусков.
  - `reportSlice`: шаблоны, очередь генерации, кэш экспортов.
  - `syncSlice`: очередь операций, конфликты, статус сети, прогресс фоновых задач.
  - `uiSlice`: модалки, уведомления, палитра команд.
- **IndexedDB**: база `qebuilder` (Dexie). Таблицы см. раздел 2.
- **Sync service**: очередь с приоритетами (CRDT-подобные патчи), фоновые перезапуски через Background Sync.
- **Event bus**: RxJS Subjects для уведомления UI о фоновых изменениях.

### 1.5 PWA и офлайн
- Workbox стратегии: `StaleWhileRevalidate` для shell, `NetworkFirst` для API, `CacheFirst` для справки и статических отчётов.
- Background Sync (если доступно), fallbacks для iOS — локальные очереди и напоминания.
- Веб-манифест с `display: standalone`, маскируемыми иконками, Splash-screen для iPhone 15 (разрешения 1290×2796 и др.).
- Использование `window.visualViewport` и CSS env(`safe-area-inset-*`) для корректировки padding.

## 2. Структура данных и API-контракты

### 2.1 Локальная схема IndexedDB (Dexie)
- `estimates`
  - поля: `id`, `name`, `status`, `currency`, `baseCost`, `updatedAt`, `tags[]`, `version`, `syncState`.
- `estimateGroups`
  - `id`, `estimateId`, `parentId`, `name`, `metrics`, `positionOrder`.
- `estimateItems`
  - `id`, `groupId`, `name`, `unit`, `quantity`, `unitPrice`, `total`, `metadata`, `lastSyncedAt`.
- `estimateRevisions`
  - `id`, `estimateId`, `type`, `diff`, `createdAt`, `createdBy`.
- `agents`
  - `id`, `name`, `category`, `description`, `model`, `temperature`, `promptTemplate`, `flow`, `bindings`, `permissions`, `schedule`, `createdAt`, `updatedAt`.
- `agentSessions`
  - `id`, `agentId`, `estimateId`, `status`, `startedAt`, `finishedAt`, `outputs`, `metrics`, `logsRef`.
- `syncQueue`
  - `id`, `entity`, `entityId`, `operation`, `payload`, `retries`, `lastAttemptAt`.
- `reports`
  - `id`, `name`, `format`, `config`, `lastGeneratedAt`, `status`, `artifactRef`.
- `userSettings`
  - `id`, `theme`, `locale`, `onboardingState`, `connections`.

### 2.2 API (опциональный бекенд)
- Базовый URL: `/api/v1`.
- Аутентификация: OAuth2 PKCE → access token (сохранение в session storage, refresh через Background Sync).
- Основные ресурсы:
  - `GET/POST /estimates` — список/создание.
  - `GET/PATCH/DELETE /estimates/{id}` — CRUD.
  - `POST /estimates/{id}/sync` — пакетная синхронизация изменений.
  - `GET /estimates/{id}/revisions` — история.
  - `POST /agents` / `PATCH /agents/{id}` / `POST /agents/{id}/run` / `GET /agents/{id}/sessions`.
  - `POST /reports` — генерация (отложенная). `GET /reports/{id}` — статус/загрузка.
  - `GET /catalogs/prices` — справочники цен (позже внешние интеграции).
  - `POST /ai/proxy` — прокси для GenKit (сервер выдаёт API-ключи и журналы для комплаенса).
- Ответы используют версионные схемы (`"schemaVersion": 1`). Конфликты решаются через `ETag` и поля `updatedAt`.

### 2.3 Синхронизационный контракт
- Payload операций: `{ op: 'create'|'update'|'delete', entity: 'estimate'|'item'|..., data: <partial> }`.
- Сервер возвращает `{ status: 'applied'|'conflict', serverState, diffSuggestion }`.
- При `conflict` UI предлагает merge tool (side-by-side).

## 3. Дизайн-гайд

### 3.1 Визуальные токены
- **Цвета**
  - Primary: `#2563EB` (Indigo 600) / hover `#1D4ED8`.
  - Secondary: `#0EA5E9` (Sky 500).
  - Accent/Success: `#22C55E` (Green 500).
  - Warning: `#F97316`, Danger: `#EF4444`.
  - Background: `#0F172A` (темная) / `#F8FAFC` (светлая).
  - Surface: semi-transparent cards `rgba(15,23,42,0.72)` в тёмной теме.
- **Типографика**
  - Семейство: `Inter` (fallback `-apple-system`), заголовки с 600 весом.
  - Иерархия: `H1 28/34`, `H2 24/30`, `H3 20/28`, `Body 16/24`, `Caption 13/18`.
  - Использовать `clamp()` для адаптивного размера.
- **Иконки**: Heroicons 24px outline/solid.

### 3.2 Карточная сетка и layout
- Грид: одна колонка, карточки шириной 100%, отступы 12px, радиус 16px.
- Sticky-элементы: верхняя панель действий (`position: sticky; top: env(safe-area-inset-top) + 8px`).
- В нижней части — `BottomActionBar` с CTA.
- Виртуальные списки с `react-window` (rowHeight ~ 64px).
- Skeleton-загрузки (shimmer) для perceived performance.

### 3.3 Графики и визуализации
- Библиотека: `visx` (гибкость, React-friendly).
- Диаграммы: stacked bar (структура сметы), line chart (динамика цен), doughnut (распределение затрат).
- Цветовые палитры согласованы с Tailwind `blue`, `sky`, `emerald`, `amber`.

### 3.4 UX-паттерны
- Bottom sheets для второстепенных действий.
- Pull-to-refresh → триггер `SyncQueue`.
- Быстрые фильтры (chips) под хедером.
- Доступность: большие hit areas, поддержка VoiceOver, контраст ≥ 4.5.

## 4. Модуль ИИ-агентов

### 4.1 Хранение конфигураций
- IndexedDB таблица `agents`; версияция через `configVersion` и `migrationScripts`.
- Секреты (API-ключи поставщиков) шифруются с помощью WebCrypto (`SubtleCrypto`) перед записью.
- Поддержка шаблонов (immutable), пользовательских копий и черновиков.

### 4.2 Запуск флоу
- **FlowEngine** (Web Worker): выполняет граф шагов. Поддержка пауз/возобновлений, стриминга результатов через `MessageChannel`.
- Интеграция с GenKit SDK: отдельный `GenkitClient` с возможностью выбора модели Gemini (`gemini-pro`, `gemini-1.5-flash`).
- Инструменты (`ToolStep`):
  - `PriceLookupTool` (REST/CSV),
  - `AdjustmentTool` (локальные формулы),
  - `ReportGeneratorTool` (SheetJS/PDFMake),
  - расширяемые плагины.
- Логирование: `ExecutionLogService` сохраняет шаги в `agentSessions` (небольшие payload → IndexedDB; большие → FileSystem API).

### 4.3 UI-настройка и мониторинг
- **AgentGallery**: карточки с KPI (успехи, avg latency, стоимость).
- **AgentBuilder**: мастер из 4 шагов + предпросмотр промпта, тестовый запуск.
- **SessionTimeline**: отображение логов (шаг, время, токены, ссылки на отчёты).
- **Sandbox**: отдельный режим для экспериментов с промптами.

### 4.4 Журналирование и аудит
- Каждая сессия получает `sessionId` (UUID v7).
- Логи содержат: timestamp, stepId, input hash, output summary, токены, ошибки.
- Экспорт лога в JSON/CSV.
- Алерты при превышении лимита стоимости (конфигурируемые пороги).

### 4.5 Расширяемость
- API хуков: `onBeforeStep`, `onAfterStep`, `onError`.
- Marketplace агентов: хранилище шаблонов, доступных для импорта/экспорта (позже синхронизация с сервером).

## 5. План реализации

### 5.1 Этапы
1. **Foundations (2 спринта)**
   - Настройка Vite + React + Tailwind + PWA, базовая структура FSD.
   - Настройка Zustand, React Query, Dexie, маршрутизация, дизайн-токены.
   - Реализация IndexedDB схемы и миграций.
2. **Core Estimates (2–3 спринта)**
   - Списки смет, Workspace с деревом и редактированием.
   - Офлайн-режим: очередь изменений, фоновая синхронизация.
   - Экспорт базовых отчётов (PDF/XLSX) офлайн.
3. **AI Agents (2 спринта)**
   - Реализация хранилища конфигураций, FlowEngine с GenKit интеграцией.
   - UI мастера и логов, песочница.
4. **Analytics & Reports (1–2 спринта)**
   - Dashboard, диаграммы, расширенные отчёты, рекомендации ИИ.
5. **Onboarding & Support (1 спринт)**
   - Интерактивный онбординг, справка, подсказки PWA.
6. **Hardening & Release (1 спринт)**
   - Оптимизация для iPhone 15, Lighthouse 90+, тестирование, полировка анимаций.

### 5.2 Критерии готовности (DoD)
- PWA проходит Lighthouse audit: Performance ≥ 85, PWA ≥ 90, Best Practices ≥ 90.
- Все основные юзер-флоу покрыты e2e (Playwright) и unit-тестами (Vitest) ≥ 80% критических путей.
- Офлайн-режим: создание/редактирование сметы и запуск агента работают без сети, изменения синхронизируются после подключения.
- Агент может обновить цены и сгенерировать рекомендации для сметы, лог доступен в UI.
- Экспорт отчётов (PDF/XLSX) доступен из Workspace и Reports.
- User onboarding завершает 80% тестовых пользователей без помощи.

## 6. Зависимости и инструменты
- **Frontend**: React, Zustand, React Query, Dexie, Tailwind, Headless UI, React Hook Form, react-window, visx.
- **PWA**: Workbox, vite-plugin-pwa.
- **AI**: @google/genkit, серверный прокси (Cloud Functions/Edge) для ключей Gemini.
- **Отчёты**: PDFMake, SheetJS, jsPDF-AutoTable.
- **Синхронизация**: WebCrypto (шифрование), RxJS (event bus).
- **Тестирование**: Vitest, Testing Library, Playwright (mobile WebKit), Storybook + Chromatic, Lighthouse CI, UXCam/Hotjar (аналитика).

## 7. Риски и вопросы
- **Ограничения Safari PWA**: нет push и ограниченный Background Sync → требуется UX для напоминаний и явные кнопки синка.
- **Размер IndexedDB**: лимит ~1 ГБ; нужна политика очистки и архивации вложений.
- **Стоимость ИИ**: мониторинг расхода токенов, квоты и фолбэки (например, `gemini-1.5-flash` при дорогих запросах).
- **Сложность синхронизации**: нужны стратегии разрешения конфликтов (CRDT, версии). Вопрос: будет ли сервер поддерживать патчи или полный merge?
- **Безопасность данных**: необходимость серверной прокси для GenKit; требуется уточнить требования к шифрованию и аудиту.
- **Управление версиями агентов**: определить SLA на откат/публикацию.

**Вопросы к команде/стейкхолдерам**
1. Требуется ли мультипользовательский режим в первой версии (совместное редактирование)?
2. Какие внешние каталоги цен приоритетны для интеграции?
3. Будет ли сервер предоставлять webhook для push-событий синхронизации?
4. Есть ли требования по сертификации (ISO, локальные стандарты)?

## 8. Обеспечение стабильности на iPhone 15 (Safari PWA)
- Тестирование через Playwright (WebKit) + реальное устройство (TestFlight или Safari Remote Inspector).
- Использование `addEventListener('visibilitychange')` для сохранения черновиков при переключениях приложений.
- Минимизация main-thread blocking: Web Workers для тяжёлых вычислений (агенты, отчёты).
- Оптимизация изображений и шрифтов (preload, `font-display: swap`).
- Touch-friendly жесты: использовать `@use-gesture/react`, отключать `300ms delay` (FastClick не нужен в iOS ≥ 13, но учитывать `touch-action`).
- Контроль памяти: lazy-loading диаграмм, очищение кэшей при нехватке памяти (прослушка `navigator.storage.estimate`).

## 9. Тестирование
- **Unit**: Vitest + Testing Library (компоненты, Zustand селекторы, хранилище Dexie-моделей).
- **Интеграционные**: Storybook Interaction tests, тесты FlowEngine с моками GenKit.
- **E2E**: Playwright (WebKit/Safari tech preview профили), сценарии офлайн (`page.context().setOffline(true)`).
- **PWA audits**: Lighthouse CI, WebPageTest мобильный.
- **UX-исследования**: Figma прототипы + UserTesting (5-7 участников, мобильный фокус).
- **Наблюдаемость**: Sentry, LogRocket, OpenTelemetry (экспорт в Grafana Tempo).

