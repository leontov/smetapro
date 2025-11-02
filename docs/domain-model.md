# Доменная модель QuickEstimate Builder

## Основные сущности
### ProjectEstimate (Смета проекта)
- `id`: UUID.
- `name`: строка.
- `status`: `Draft | InReview | Approved | Archived`.
- `currency`: код ISO 4217.
- `baseLaborRate`: ставка труда (в валюте сметы).
- `markup`: наценка в процентах.
- `tags`: список строк.
- `ownerId`: UUID владельца.
- `createdAt` / `updatedAt`: ISO-временные метки.
- `version`: активная версия.
- `settings`: параметры округления, налогов, локали, выбранные единицы измерения.

### EstimateItem (Позиция сметы)
- `id`: UUID.
- `projectId`: UUID родительской сметы.
- `parentId`: UUID или `null` — для иерархии.
- `type`: `Material | Labor | Equipment | Service | Allowance`.
- `description`: текст.
- `quantity`: число (≥ 0).
- `unit`: строка (м², час и т. п.).
- `unitPrice`: число (≥ 0).
- `source`: `Manual | SupplierAPI | Historical | AI`.
- `adjustments`: массив `{ reason, delta, appliedBy, appliedAt }`.
- `notes`: Markdown.
- `attachments`: ссылки на файлы.
- `metadata`: произвольный словарь для интеграций.

### EstimateVersion (Версия сметы)
- `id`: UUID.
- `projectId`: UUID.
- `label`: человекочитаемое название.
- `createdAt`: timestamp.
- `createdBy`: ссылка на пользователя.
- `diff`: JSON Patch или другой компактный формат, описывающий изменения.
- `totals`: кешированные показатели (материалы, труд, налоги, итог).

### AgentConfig (Конфигурация агента)
- `id`: UUID.
- `name`: строка.
- `category`: `Analysis | Update | Report | Custom`.
- `description`: короткое пояснение задачи.
- `promptTemplate`: массив блоков (system, user, tool hints).
- `flow`: последовательность шагов (см. `docs/ai-module.md`).
- `dataBindings`: привязки к данным (сметы, прайс-листы, пользовательские файлы).
- `model`: идентификатор модели Gemini.
- `temperature`, `topK`, `maxTokens`: параметры генерации.
- `outputFormat`: `Markdown | JSON | CSV | Custom`.
- `permissions`: область доступа (проекты, типы данных).
- `schedule`: опциональные параметры автозапуска.
- `createdAt`, `updatedAt`.

### AgentSession (Сессия агента)
- `id`: UUID.
- `agentId`: UUID.
- `trigger`: `Manual | Scheduled | Event`.
- `status`: `Pending | Running | Success | Failed | RequiresAction`.
- `startedAt` / `completedAt`.
- `inputContext`: сериализованный контекст запуска.
- `output`: JSON-ответ + вложения.
- `metrics`: токены, задержка, стоимость.
- `notes`: пользовательские комментарии.

### UserProfile (Профиль пользователя)
- `id`: UUID.
- `email`: строка.
- `displayName`: строка.
- `locale`: язык интерфейса.
- `roles`: `Owner | Contributor | Viewer`.
- `preferences`: тема, валюта, уведомления, настройки офлайн.
- `connections`: внешние сервисы, хранение токенов (шифруется).

### SyncQueueItem (Очередь синхронизации)
- `id`: UUID.
- `entity`: тип сущности.
- `entityId`: UUID.
- `operation`: `Create | Update | Delete`.
- `payload`: JSON-дельта.
- `createdAt`: timestamp.
- `retryCount`: целое.
- `status`: `Pending | Processing | Completed | Failed`.
- `error`: информация о последней ошибке.

## Связи
- `ProjectEstimate` 1—* `EstimateItem`.
- `ProjectEstimate` 1—* `EstimateVersion`.
- `ProjectEstimate` 1—* `AgentSession` (через запуск аналитики по конкретной смете).
- `AgentConfig` 1—* `AgentSession`.
- `UserProfile` 1—* `ProjectEstimate` (владелец).
- `UserProfile` 1—* `AgentConfig`.
- `SyncQueueItem` ссылается на любую сущность через полиморфную связь.

## Производные данные
- Итоги и KPI рассчитываются редьюсерами, которые рекурсивно обходят дерево позиций.
- Маржинальность = (итоговая цена − себестоимость) / итоговая цена.
- Версионность: `EstimateVersion.diff` хранит JSON Patch; для восстановления используется последовательное применение патчей.
- Статистика агентов: агрегирование по типам задач, времени выполнения, стоимости.

## Правила валидации
- Количество и цены не могут быть отрицательными; для `Labor` дополнительно проверяется ставка.
- Наценка `markup` ограничена диапазоном 0–100% по умолчанию.
- Позиции с типом `Material` требуют указания единицы измерения.
- Агент не активируется, пока не заполнены обязательные placeholders в шаблоне промпта и не выбраны источники данных.
- Очередь синхронизации не принимает payload > 10 МБ; крупные импорты дробятся на чанки.

## Безопасность и конфиденциальность
- В IndexedDB конфиденциальные поля (цены поставщиков, токены) шифруются WebCrypto (AES-GCM), ключи выводятся через PBKDF2 от пользовательского пароля.
- Перед отправкой данных в Gemini запускается фильтр PII, который удаляет персональные данные клиентов.
- Все операции записываются в аудит-лог с указанием пользователя, времени, типа действия.

## Расширяемость
- Метаданные позиции допускают пользовательские схемы (для интеграций с ERP/1С).
- Через плагины можно добавлять новые типы сущностей (например, `Invoice`, `ScheduleItem`).
- Миграции схемы документируются в changelog; каждая миграция имеет обратный шаг, позволяющий откат.

## Диаграммы и документация
- ER-диаграмма хранится в Figma (ссылка в `docs/roadmap.md`).
- Контракты API описаны в `docs/api-contract.md`; каждая сущность привязана к эндпоинтам.
