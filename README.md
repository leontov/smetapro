# SmetaPro Mobile Experience

Мобильное onboarding-приложение для сметных команд с поддержкой жестов, локализации и высокой доступности.

## Возможности

- ✅ Онбординг с тремя ключевыми шагами: обучающий туториал, настройка ключей шифрования и доступ к примерам проектов.
- ✅ Skeleton-загрузки и плавные анимации (учитывается `prefers-reduced-motion`).
- ✅ Поддержка VoiceOver/Screen Reader через `aria`-описания и Radix VisuallyHidden.
- ✅ Локализация (английский, русский) на базе i18next.
- ✅ Safe-area отступы и обработка свайпов для iPhone 15.
- ✅ Bundle маркетинговых материалов (manifest, иконки, инструкции).
- ✅ Готовая конфигурация Playwright (Mobile Safari) и Lighthouse CI.
- ✅ Документация по онбордингу и лучшим практикам для AI-агентов.
- ✅ Готовые инструкции по деплою на Vercel/Netlify с HTTPS и кэшем.

## Старт работы

```bash
npm install
npm run dev
```

Приложение доступно на `http://localhost:5173`.

## Сборка и предпросмотр

```bash
npm run build
npm run preview
```

## Тесты и проверка качества

```bash
# End-to-end тесты в мобильном профиле Safari
npx playwright install --with-deps
npm run test:e2e

# Lighthouse CI (прогон профиля performance/accessibility/best-practices/SEO)
npm run lighthouse
```

## Структура проекта

```
├── docs/
│   ├── onboarding-guide.md
│   ├── ai-agent-best-practices.md
│   └── marketing-bundle.md
├── public/
│   ├── icons/
│   │   ├── icon-192.svg
│   │   └── icon-512.svg
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   ├── hooks/
│   ├── i18n/
│   ├── pages/
│   ├── styles/
│   └── utils/
└── tests/
    └── e2e/
```

## Деплой

Подробная инструкция в [docs/deploy.md](docs/deploy.md).

## Лицензия

MIT
