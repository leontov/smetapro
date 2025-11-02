# API-контракты QuickEstimate Builder

> **Примечание:** реализация серверной части опциональна. Контракты описывают ожидаемый REST API при включённой синхронизации.

## Аутентификация
- `POST /auth/login`
  - Вход: `{ email: string }` — отправка magic link или OTP.
  - Выход: `{ requestId: string }`.
- `POST /auth/verify`
  - Вход: `{ requestId: string, code: string }`.
  - Выход: `{ accessToken: string, refreshToken: string, expiresIn: number }`.
- `POST /auth/refresh`
  - Вход: `{ refreshToken: string }` → новый `accessToken`.

Токены передаются в заголовке `Authorization: Bearer <token>`.

## Сметы
### Список проектов
- `GET /estimates`
  - Параметры: `status?`, `tag?`, `updatedAfter?`, `limit`, `offset`.
  - Ответ: `{ items: ProjectEstimateDto[], total: number }`.

### Создание/обновление
- `POST /estimates`
  - Тело: `ProjectEstimateCreateDto`.
  - Ответ: `ProjectEstimateDto`.
- `PUT /estimates/{id}`
  - Тело: `ProjectEstimateUpdateDto` (partial, JSON Merge Patch).
  - Ответ: `ProjectEstimateDto`.
- `DELETE /estimates/{id}`
  - Ответ: `204 No Content`.

### Позиции
- `GET /estimates/{id}/items`
  - Параметры: `parentId?`, `page`, `pageSize`.
  - Ответ: `{ items: EstimateItemDto[], total: number }`.
- `POST /estimates/{id}/items`
  - Тело: `EstimateItemCreateDto`.
  - Ответ: `EstimateItemDto`.
- `PATCH /estimates/{id}/items/{itemId}`
  - Тело: JSON Patch.
  - Ответ: `EstimateItemDto`.
- `DELETE /estimates/{id}/items/{itemId}` → `204`.

### Версии
- `GET /estimates/{id}/versions`
  - Ответ: `EstimateVersionDto[]`.
- `POST /estimates/{id}/versions`
  - Тело: `{ label?: string, includeAttachments?: boolean }`.
  - Ответ: `EstimateVersionDto`.
- `GET /estimates/{id}/versions/{versionId}`
  - Ответ: подробный снапшот.

## Агенты
- `GET /agents`
  - Ответ: `AgentConfigDto[]`.
- `POST /agents`
  - Тело: `AgentConfigCreateDto`.
  - Ответ: `AgentConfigDto`.
- `PUT /agents/{id}`
  - Тело: `AgentConfigUpdateDto`.
  - Ответ: `AgentConfigDto`.
- `DELETE /agents/{id}` → `204`.

### Сессии агентов
- `GET /agent-sessions`
  - Параметры: `agentId?`, `projectId?`, `status?`, `from?`, `to?`.
  - Ответ: `{ items: AgentSessionDto[], total: number }`.
- `POST /agent-sessions`
  - Тело: `{ agentId: string, projectId: string, inputContext?: Record<string, unknown> }`.
  - Ответ: `AgentSessionDto`.
- `GET /agent-sessions/{id}`
  - Ответ: полный лог.
- `POST /agent-sessions/{id}/retry`
  - Ответ: `202 Accepted` + обновлённый статус.

## Отчёты
- `POST /reports/export`
  - Тело: `{ type: 'pdf' | 'xlsx', projectId: string, templateId?: string, versionId?: string }`.
  - Ответ: `{ jobId: string }`.
- `GET /reports/export/{jobId}`
  - Ответ: `{ status: 'pending' | 'running' | 'success' | 'failed', downloadUrl?: string }`.

## Синхронизация
- `POST /sync/push`
  - Тело: `{ deviceId: string, mutations: SyncMutationDto[] }`.
  - Ответ: `{ accepted: number, rejected: SyncMutationError[] }`.
- `GET /sync/pull`
  - Параметры: `deviceId`, `since` (timestamp).
  - Ответ: `{ changes: SyncChangeDto[], serverTime: string }`.

## DTO (сокращённо)
```ts
type ProjectEstimateDto = {
  id: string;
  name: string;
  status: 'Draft' | 'InReview' | 'Approved' | 'Archived';
  currency: string;
  baseLaborRate: number;
  markup: number;
  tags: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

type EstimateItemDto = {
  id: string;
  projectId: string;
  parentId: string | null;
  type: 'Material' | 'Labor' | 'Equipment' | 'Service' | 'Allowance';
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  source: 'Manual' | 'SupplierAPI' | 'Historical' | 'AI';
  notes?: string;
  metadata?: Record<string, unknown>;
};

type AgentConfigDto = {
  id: string;
  name: string;
  category: 'Analysis' | 'Update' | 'Report' | 'Custom';
  description: string;
  model: string;
  permissions: PermissionScopeDto;
  updatedAt: string;
};

type AgentSessionDto = {
  id: string;
  agentId: string;
  projectId: string;
  status: 'Pending' | 'Running' | 'Success' | 'Failed' | 'RequiresAction';
  startedAt: string;
  completedAt?: string;
  metrics: {
    totalTokens: number;
    latencyMs: number;
    costEstimate: number;
  };
};
```

## Webhook-и
- `/webhooks/pricing-updated`
  - Событие: поставщик обновил прайс.
  - Тело: `{ supplierId, items: [{ sku, price, currency, validUntil }] }`.
- `/webhooks/report-ready`
  - Событие: сервер подготовил отчёт.
  - Тело: `{ jobId, downloadUrl }`.

## Ошибки
- Стандартный ответ об ошибке: `{ error: { code: string, message: string, details?: Record<string, unknown> } }`.
- Коды: `AUTH_REQUIRED`, `VALIDATION_FAILED`, `NOT_FOUND`, `RATE_LIMITED`, `CONFLICT`, `INTERNAL_ERROR`.

## Ограничения и квоты
- `POST /agent-sessions` — не более 30 запусков в час на пользователя (ограничивается на сервере).
- Размер вложений при экспорте — до 20 МБ.
- Очередь синхронизации — до 500 операций на одно устройство без подтверждения сервера.

## Безопасность
- Все запросы идут по HTTPS.
- Поддержка аппаратных токенов: опциональный WebAuthn для администраторов.
- Логи действий пользователя доступны через `GET /audit-logs` (ограничено ролью `Owner`).
