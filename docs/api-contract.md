# API Contract

> **Note**: The project targets offline-first workflows; the API is optional but designed for future synchronization and collaboration features.

## Authentication
- **Endpoint**: `POST /v1/auth/session`
- **Body**: `{ "email": string, "otp": string }`
- **Response**: `{ "token": string, "refreshToken": string, "expiresIn": number }`
- Tokens are JWTs signed with rotating keys; refresh performed via `POST /v1/auth/token`.

## Projects & Estimates
### List Estimates
- `GET /v1/estimates`
- Query params: `status`, `tag`, `updatedAfter`, `limit`, `cursor`
- Response: `{ "data": ProjectEstimate[], "nextCursor": string | null }`

### Create Estimate
- `POST /v1/estimates`
- Body: `ProjectEstimateCreate` (name, currency, optional templateId)
- Response: `{ "data": ProjectEstimate }`

### Update Estimate Metadata
- `PATCH /v1/estimates/{estimateId}`
- Body: JSON Patch operations limited to metadata fields
- Response: `{ "data": ProjectEstimate }`

### Sync Estimate Items
- `PUT /v1/estimates/{estimateId}/items`
- Body: `{ "version": string, "operations": DeltaOperation[] }`
- Response: `{ "data": { "version": string, "conflicts": Conflict[] } }`

### Export Estimate
- `POST /v1/estimates/{estimateId}/exports`
- Body: `{ "format": "pdf" | "xlsx", "options": object }`
- Response: `202 Accepted` with `Location` header for job status
- Poll job via `GET /v1/exports/{jobId}` until ready.

## Versions
- `GET /v1/estimates/{estimateId}/versions`
- `POST /v1/estimates/{estimateId}/versions` to create manual snapshot
- Each version returns metadata + diff summary.

## Agents
### List Agents
- `GET /v1/agents`
- Response: `{ "data": AgentConfig[] }`

### Create Agent
- `POST /v1/agents`
- Body: `AgentConfigInput`
- Validates prompt template placeholders and permissions.

### Update Agent
- `PUT /v1/agents/{agentId}` with full representation, or `PATCH` for partial updates.

### Run Agent Flow
- `POST /v1/agents/{agentId}/runs`
- Body: `{ "estimateId": string, "options": object }`
- Response: `{ "data": AgentSession }` (status `Pending`)
- Subscribe via WebSocket `wss://api.example.com/v1/agents/{agentId}/runs/{runId}` for streaming output; fallback to long polling.

## Sessions & Logs
- `GET /v1/agent-sessions?agentId=&status=&from=&to=` returns paginated sessions.
- `GET /v1/agent-sessions/{sessionId}` returns detailed log including intermediate tool responses.

## Price Sources
- `GET /v1/price-sources` to list connected suppliers.
- `POST /v1/price-sources/{sourceId}/refresh` triggers background update.

## Files & Attachments
- `POST /v1/files` accepts multipart uploads; returns `{ fileId, url, checksum }`.
- `GET /v1/files/{fileId}` downloads content.
- Large files chunked using tus protocol extension.

## Sync Endpoints
### Pull Changes
- `GET /v1/sync/pull?since={timestamp}` returns `{ deltaPacks: DeltaPack[] }`.
- DeltaPack includes entity, operation, payload, version vector.

### Push Changes
- `POST /v1/sync/push`
- Body: `{ "deviceId": string, "changes": SyncQueueItem[] }`
- Response includes per-change status and conflict resolutions.

## Webhooks
- `POST /v1/webhooks/price-update`
  - Triggered by suppliers with payload `{ sourceId, items: [{ sku, price, currency, effectiveDate }] }`
- `POST /v1/webhooks/agent-callback`
  - Receives asynchronous results from long-running agent flows or third-party tools.

## Error Handling
- Standardized error format:
```json
{
  "error": {
    "code": "string",
    "message": "human readable",
    "details": object,
    "requestId": "uuid"
  }
}
```
- HTTP status codes follow RFC 9110.
- Rate limits communicated via `429` with `Retry-After` header.

## Versioning & Stability
- API prefixed with `/v1`; breaking changes announced 90 days in advance.
- Feature flags and capabilities returned in response headers `X-App-Capabilities`.

## Security
- All endpoints require HTTPS.
- Tokens verified with audience claims per device.
- Row-level security enforced via user permissions; server validates that requested estimates belong to the authenticated tenant.
- Payload size limited to 5MB per request (except tus uploads).

## Open Questions
- Do we expose GraphQL gateway for advanced analytics?
- Should agent runs allow streaming SSE for cost-effective updates on Safari?
- Are supplier webhooks authenticated via HMAC secrets or mTLS?
