# Frontend Architecture Overview

## Application Shell & Navigation
- **Framework**: TypeScript SPA built with React 18 + Vite for bundling, emphasizing tree-shaking and fast HMR.
- **Routing**: React Router v6 with nested routes and lazy loading for feature islands.
- **Navigation Paradigm**:
  - Bottom tab bar with five primary destinations (Dashboard, Estimates, Agents, Reports, Settings).
  - Modal stack for context-sensitive overlays (quick create, file import, agent run history).
  - Global command palette triggered via floating action button or keyboard shortcut (`⌘K` when using desktop mode).
- **Application Shell Components**:
  - `<AppRoot>`: initializes providers (state, theme, i18n, error boundaries).
  - `<AppFrame>`: renders tab navigation, handles viewport-safe areas (iOS notch) and sticky action bar.
  - `<OfflineBanner>`: warns about connectivity and exposes manual sync controls.

## Pages & Feature Modules
1. **Dashboard**
   - Widgets: recent estimates, sync status, quick-start actions, notifications.
   - Data Sources: cached metrics from IndexedDB, realtime updates via background sync events.
2. **Estimate Directory**
   - Features: search, filters (status, tags, owner), bulk actions (export, archive).
   - Components: `<EstimateList>`, `<EstimateFilterDrawer>`, `<QuickImportButton>`.
3. **Estimate Workspace**
   - Sub-sections: Summary header, hierarchical bill of quantities, change timeline, agent assistant panel.
   - Key interactions: inline editing with optimistic updates, swipe gestures for quick actions, diff view between versions.
4. **Agents Hub**
   - Components: `<AgentGallery>`, `<AgentConfigurator>`, `<FlowDebugger>`, `<SessionLogViewer>`.
   - Supports cloning templates, editing prompt blocks, connecting external data sources.
5. **Reports & Insights**
   - Visualizations: trend charts, category breakdowns, comparison matrix.
   - Export flows for PDF/XLSX with progress indicators and background generation when online.
6. **Settings & Support**
   - Subpages: profile, integrations, storage management, PWA tips, onboarding library.

Each feature module is encapsulated with its own slice of state, routes, services, and UI components under `src/features/<module>` following a feature-sliced architecture.

## State Management
- **Global Store**: Zustand with immer for ergonomic immutable updates; persisted slices via IndexedDB using `zustand/persist` adapter.
- **Slice Overview**:
  - `authSlice`: user session, permissions, encryption keys.
  - `estimateSlice`: projects, items, versions, derived totals.
  - `agentSlice`: agent configurations, runtime status, session logs.
  - `syncSlice`: queue, conflicts, connectivity flags.
  - `uiSlice`: toasts, modals, command palette state.
- **Async Flow**: `@tanstack/react-query` manages server communication, caching, and background revalidation while Zustand holds canonical local state.
- **Offline Strategy**: writes routed through a `MutationQueue` that records intents, executes immediately against local state, and persists to `SyncQueue` for later transmission.

## Data Access Layer
- **Repositories** map domain models to persistence mechanisms:
  - `EstimateRepository`: handles IndexedDB CRUD, version snapshots, merge policies.
  - `AgentRepository`: stores configs, encrypted credentials, usage stats.
  - `SyncRepository`: manages outgoing/incoming delta packs.
- Repositories expose reactive subscriptions (via RxJS Subject) to inform UI about updates triggered by background sync.
- Local schema migrations managed through Dexie; migrations versioned alongside app releases.

## Service Worker & PWA Enhancements
- **Service Worker** built with Workbox:
  - Precaches static assets with `StaleWhileRevalidate` strategy.
  - Runtime caching for API calls (`NetworkFirst`) and document templates (`CacheFirst`).
  - Background sync plugin flushes queued mutations when connectivity returns.
  - Handles push notifications for agent job completion (limited on iOS; fallback to in-app alerts).
- **Manifest** tuned for iOS (display `standalone`, theme colors, maskable icons) and registers custom splash screens.
- **Update Strategy**: when new SW is available, display `New version ready` toast allowing users to refresh after critical work is saved.

## Cross-Cutting Concerns
- **Error Handling**: global error boundary, feature-level error components, logging to Sentry when online with offline queue fallback.
- **Internationalization**: `@formatjs/intl` with translation bundles stored in IndexedDB for offline use.
- **Accessibility**: focus management for modals, ARIA labels on custom components, VoiceOver tested flows.
- **Theming**: design tokens exported to CSS variables; support for light/dark and high-contrast modes.

## Development Tooling
- ESLint + Prettier + Stylelint enforcing consistent code quality.
- Storybook Mobile Viewports for rapid UI iteration with design tokens.
- Playwright component tests to validate interactive behavior under touch simulations.
- Mock Service Worker (MSW) for simulating API and GenKit responses in development and testing.
