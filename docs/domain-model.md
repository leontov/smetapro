# Domain Model

## Core Entities
### ProjectEstimate
Represents a construction estimate project.
- `id`: UUID
- `name`: string
- `status`: enum `Draft | InReview | Approved | Archived`
- `currency`: ISO 4217 code
- `baseLaborRate`: number (per hour)
- `markup`: number (percentage applied to subtotal)
- `tags`: string[]
- `ownerId`: UUID
- `createdAt` / `updatedAt`: ISO timestamps
- `version`: current version identifier
- `settings`: object containing rounding, tax, locale preferences

### EstimateItem
Individual line within an estimate.
- `id`: UUID
- `projectId`: UUID
- `parentId`: UUID | null (allows hierarchical grouping)
- `type`: enum `Material | Labor | Equipment | Service | Allowance`
- `description`: string
- `quantity`: number
- `unit`: string (e.g., m², hour)
- `unitPrice`: number
- `source`: enum `Manual | SupplierAPI | Historical | AI`
- `adjustments`: array of modifiers `{ reason, delta, appliedBy, appliedAt }`
- `notes`: rich-text markdown
- `attachments`: file references (e.g., supplier quotes)
- `metadata`: extensible key/value map for integrations

### EstimateVersion
Snapshot of an estimate at a point in time.
- `id`: UUID
- `projectId`: UUID
- `label`: string (e.g., `Initial`, `Client feedback 1`)
- `createdAt`: timestamp
- `createdBy`: user reference
- `diff`: compressed delta from previous version
- `totals`: cached summary (labor, materials, tax, grand total)

### AgentConfig
Defines a reusable AI workflow.
- `id`: UUID
- `name`: string
- `category`: enum `Analysis | Update | Report | Custom`
- `promptTemplate`: structured prompt with variables
- `flow`: ordered list of steps (prompt, tool invocation, transformation)
- `dataBindings`: references to datasets (estimates, price catalogs, custom files)
- `model`: Gemini model identifier
- `temperature`, `topK`, `maxTokens`: model parameters
- `outputFormat`: enum `Markdown | JSON | CSV | Custom`
- `permissions`: scope of accessible projects and data types
- `ownerId`: user reference

### AgentSession
Execution trace of a workflow.
- `id`: UUID
- `agentId`: UUID
- `trigger`: enum `Manual | Scheduled | Event`
- `status`: enum `Pending | Running | Success | Failed | RequiresAction`
- `startedAt` / `completedAt`: timestamps
- `inputContext`: serialized snapshot of data provided to the agent
- `output`: response payload (stored as JSON + attachments)
- `metrics`: token usage, latency, cost estimate
- `notes`: manual annotations

### UserProfile
- `id`: UUID
- `email`: string
- `displayName`: string
- `locale`: string
- `roles`: list of roles (`Owner`, `Contributor`, `Viewer`)
- `preferences`: includes theme, default currency, notification settings
- `connections`: linked external services with tokens (encrypted)

### SyncQueueItem
Represents a pending mutation for synchronization.
- `id`: UUID
- `entity`: string (e.g., `ProjectEstimate`)
- `entityId`: UUID
- `operation`: enum `Create | Update | Delete`
- `payload`: JSON delta
- `createdAt`: timestamp
- `retryCount`: integer
- `status`: enum `Pending | Processing | Completed | Failed`

## Relationships
- `ProjectEstimate` 1—* `EstimateItem`
- `ProjectEstimate` 1—* `EstimateVersion`
- `ProjectEstimate` 1—* `AgentSession` (through contextual runs)
- `AgentConfig` 1—* `AgentSession`
- `UserProfile` 1—* `ProjectEstimate` (ownership)
- `UserProfile` 1—* `AgentConfig` (ownership)
- `SyncQueueItem` references any entity via polymorphic association.

## Derived Data & Aggregations
- Totals computed via reducer functions that aggregate child items recursively.
- Profitability metrics derived from markup, labor rates, cost vs sell price.
- Version diffs stored as JSON Patch for efficient reconstruction.
- Agent performance analytics aggregated by agentId, type, success rate, avg cost.

## Validation Rules
- Quantities and unit prices must be non-negative.
- Currency conversions handled via FX service when project currency differs from user preference.
- AgentConfig prompts validated to include required placeholders before activation.
- SyncQueue operations capped to 10MB payload; larger changes chunked.
- Attachments scanned for malware (if backend enabled) before syncing.

## Security & Privacy Considerations
- Sensitive fields (supplier quotes, API tokens) encrypted at rest in IndexedDB using WebCrypto (AES-GCM) with keys derived from user credentials.
- Agent sessions redact personal data before sending to Gemini unless explicit consent stored in preferences.
- Audit log maintained for all changes to estimates and agent configurations.

## Extensibility Notes
- Support plugin interface for third-party integrations by allowing custom metadata schemas and additional entity types (e.g., `Invoice`).
- Maintain backward compatibility through versioned schema migrations and transformation utilities.
