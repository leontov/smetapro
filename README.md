# Smetapro

Современная PWA-платформа для сметчиков с аналитикой, отчетами и синхронизацией цен.

## Возможности

- **Insights панель** на React Query и Recharts: KPI карточки, графики выручки/затрат.
- **Генерация отчетов** (PDF/XLSX) с планировщиком CRON и экспортом через Share API.
- **Управление источниками цен** с переключением mock/production API.
- **Агент актуализации цен**: уведомления о завершении, фоновые очереди и офлайн-фоллбек.
- **PWA оптимизации**: lazy loading, code splitting, сервис-воркер с offline queue и background sync.
- **Телеметрия**: Posthog и LogRocket с privacy notice.

## Скрипты

```bash
npm install
npm run dev        # запуск клиентского приложения
npm run start:server # запуск API сервера (Express + cron задачи)
npm run build
```

## Переменные окружения

Создайте файл `.env` со значениями:

```
VITE_POSTHOG_KEY=<ключ Posthog>
VITE_LOGROCKET_KEY=<workspace/name>
PRICE_SOURCE_REAL_ENDPOINT=https://open.er-api.com/v6/latest/USD
PRICE_SOURCE_MOCK_ENDPOINT=http://localhost:5173/mock/prices.json
```
