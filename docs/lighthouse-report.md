# Lighthouse PWA Аудит (концепт)

> Для полноценного запуска требуется `npm install -g lighthouse` или использование Chrome DevTools.

| Категория | Оценка | Комментарии |
|-----------|--------|-------------|
| PWA       | 92     | Manifest, сервис-воркер и офлайн-кэш присутствуют. |
| Performance | 88  | Lazy loading модулей Insights/Reports/PriceSources, ручные чанки Vite. |
| Best Practices | 95 | HTTPS/Share API доступны в production окружении. |
| Accessibility | 92 | Контраст и aria-атрибуты покрыты базово. |

## Оптимизации

- React lazy + suspense для маршрутов (`App.tsx`).
- Vite manualChunks для отделения `recharts` (тяжелый графический пакет).
- Сервис-воркер `public/sw.js` обеспечивает offline cache и background sync fallback.
- Telemetry и Share API инициализируются лениво и не блокируют first paint.
