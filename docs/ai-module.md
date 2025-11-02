# AI Agent Module Specification

## Objectives
Provide a modular framework for configuring, executing, and monitoring AI-driven workflows that assist with estimating tasks while maintaining transparency, control, and auditability.

## Architecture Components
- **AgentRegistry**
  - Stores `AgentConfig` objects in IndexedDB.
  - Exposes CRUD operations and emits change events to subscribed UI components.
  - Supports versioning of configurations and rollback to previous revisions.
- **FlowEngine**
  - Executes a sequence of `AgentFlowStep` objects.
  - Supports step types: `PromptStep`, `ToolStep`, `TransformStep`, `DecisionStep`.
  - Handles branching and looping via explicit conditions.
  - Utilizes async generator pattern to stream intermediate results to UI.
- **ContextBuilder**
  - Aggregates data: selected estimate snapshot, historical prices, supplier feeds, user annotations.
  - Applies filters based on agent permissions and scope.
  - Sanitizes data (PII removal) before sending to Gemini.
- **ExecutionLogService**
  - Persists `AgentSession` records with timestamps, token counts, cost estimation, step outputs.
  - Provides search/filter capabilities and exports logs to JSON/CSV for auditing.
- **GenKitConnector**
  - Wraps GenKit SDK with standardized error handling, retry policy, and instrumentation hooks.
  - Supports mock mode for testing (predefined responses) and rate limit backoff.

## Data Interfaces
```ts
type AgentConfig = {
  id: string;
  name: string;
  category: 'Analysis' | 'Update' | 'Report' | 'Custom';
  description: string;
  promptTemplate: PromptBlock[];
  flow: AgentFlowStep[];
  dataBindings: DataBinding[];
  model: string;
  temperature: number;
  topK?: number;
  maxTokens?: number;
  outputFormat: 'Markdown' | 'JSON' | 'CSV' | { mimeType: string };
  permissions: PermissionScope;
  schedule?: ScheduleConfig;
  createdAt: string;
  updatedAt: string;
};

type AgentFlowStep =
  | PromptStep
  | ToolStep
  | TransformStep
  | DecisionStep;

type PromptStep = {
  kind: 'prompt';
  id: string;
  promptBlockId: string;
  stopSignals?: string[];
};

type ToolStep = {
  kind: 'tool';
  id: string;
  toolId: string;
  inputMapping: MappingExpression;
};

type TransformStep = {
  kind: 'transform';
  id: string;
  transformer: 'summarize' | 'diff' | 'price-adjust' | 'custom';
  config: Record<string, unknown>;
};

type DecisionStep = {
  kind: 'decision';
  id: string;
  condition: ConditionExpression;
  onTrue: string; // next step id
  onFalse: string;
};

type FlowResult = {
  sessionId: string;
  status: 'success' | 'failure' | 'requires-action';
  outputs: FlowOutput[];
  metrics: {
    totalTokens: number;
    completionTokens: number;
    latencyMs: number;
    costEstimate: number;
  };
  logs: FlowLogEntry[];
};
```

## Execution Lifecycle
1. **Initialization**: user selects agent & target estimate; ContextBuilder assembles `AgentContext`.
2. **Validation**: FlowEngine validates config (required bindings, step graph acyclic) before execution.
3. **Run**:
   - Emit `sessionStarted` event and persist initial session record.
   - Iterate through flow steps:
     - PromptStep → GenKitConnector `generate` call with compiled prompt.
     - ToolStep → executes registered tool (price fetcher, PDF generator, etc.).
     - TransformStep → apply deterministic transformation (e.g., convert Markdown to structured JSON).
     - DecisionStep → evaluate expression using last output.
   - Stream intermediate outputs to UI for transparency.
4. **Completion**: update session status, store outputs, trigger notifications, enqueue follow-up actions if configured.
5. **Failure Handling**: categorize errors (`ValidationError`, `RateLimitError`, `NetworkError`, `ModelError`). Provide recovery options (retry, adjust inputs, fallback agent).

## Tooling & Extensibility
- **Tool Registry**: plugin API to register tools with metadata (name, description, required auth). Tools run in secure sandbox to avoid blocking UI thread.
- **Price Intelligence Tools**: connectors for supplier APIs, CSV import parser, web scraper (headless) executed via serverless function when available.
- **Report Generators**: convert agent insights to PDF/XLSX by composing templates with templating engine (Handlebars).

## UI Touchpoints
- **Agent Gallery**: card grid showing usage stats, success rate, last run.
- **Configurator**: step-based wizard to define prompt, data bindings, output preferences; includes live preview (mock run) and validation warnings.
- **Session Viewer**: timeline of flow steps with status badges, raw prompts/responses (with sensitive data redacted).
- **Playground**: quick experiment area to test variations without affecting saved agents.

## Security & Compliance
- Encrypt stored prompts and API keys using WebCrypto with keys derived from user credentials.
- Provide `sensitiveFields` annotation to automatically redact data before logs are persisted.
- Maintain audit log for who executed which agent, when, and with what input context.
- Respect Gemini usage policies; implement guardrails (max tokens per day, manual approval for high-cost runs).

## Testing Strategy
- **Unit Tests**: validate flow graph execution, prompt templating, decision branching.
- **Integration Tests**: run mock GenKit connector to ensure deterministic outputs; test error pathways.
- **Load Tests**: simulate concurrent agent runs to validate queue and rate limit handling.
- **UX Tests**: observe configuration wizard on mobile to ensure clarity and ease of use.

## Monitoring & Analytics
- Instrument FlowEngine with OpenTelemetry traces.
- Capture metrics: run duration, success rate, average cost, most used tools.
- Surface insights in Reports module; trigger alerts when failure rate exceeds threshold.

## Roadmap Enhancements
- Introduce collaborative agents with shared templates and organization-level governance.
- Support multi-modal inputs (image-based site inspections) once available via Gemini.
- Add reinforcement learning loop based on user feedback to improve prompt templates.
