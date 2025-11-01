# Модуль искусственного интеллекта

## Интерфейсы конфигурации и результатов

### AgentConfig
**Назначение.** Интерфейс описывает параметры отдельного агента, который будет выполнять задачу в рамках флоу. Он фиксирует, с каким именем, моделью и инструментами агент запускается, а также какие подсказки и ограничения ему задаются.

**Поля.**
- `id: string` — уникальный идентификатор агента, позволяющий ссылаться на него из шагов флоу.
- `name?: string` — человекочитаемое имя агента, применимое в интерфейсах или логах.
- `model: string` — идентификатор используемой ML-модели.
- `systemPrompt?: string` — системная подсказка, задающая поведение агента.
- `tools?: ToolDescriptor[]` — список доступных инструментов или API, с которыми может взаимодействовать агент.
- `parameters?: Record<string, unknown>` — дополнительные настройки модели (температура, топ-p и т. д.).

**Пример использования.**
```ts
const summarizer: AgentConfig = {
  id: "summarizer",
  name: "Докладчик",
  model: "gpt-4.1",
  systemPrompt: "Суммируй входные данные, выделяя ключевые тезисы",
  parameters: { temperature: 0.2 }
};
```

### AgentFlowStep
**Назначение.** Интерфейс определяет отдельный шаг флоу, связывая входные данные с конкретным агентом и описывая способ передачи результатов между шагами.

**Поля.**
- `id: string` — уникальный идентификатор шага.
- `agent: string` — ссылка на `AgentConfig.id`, определяющая, какой агент будет использован.
- `input: FlowInputMapping` — описание того, как вычисляются входные данные шага из контекста флоу.
- `outputKey: string` — ключ, под которым результат шага сохраняется для последующих шагов.
- `onError?: ErrorStrategy` — стратегия обработки ошибок (повтор, пропуск, прерывание и т. д.).

**Пример использования.**
```ts
const summarizeStep: AgentFlowStep = {
  id: "summarize-report",
  agent: "summarizer",
  input: {
    transcript: { from: "context", key: "meetingNotes" }
  },
  outputKey: "meetingSummary"
};
```

### FlowResult
**Назначение.** Интерфейс описывает итог выполнения флоу, фиксируя результаты каждого шага и итоговую полезную нагрузку.

**Поля.**
- `flowId: string` — идентификатор выполненного флоу.
- `status: "success" | "failed"` — финальный статус.
- `outputs: Record<string, unknown>` — агрегированные выходные данные, где ключи соответствуют `AgentFlowStep.outputKey`.
- `stepResults: Record<string, StepResult>` — подробные сведения о выполнении каждого шага (время, использованный агент, сообщения и т. п.).
- `errors?: FlowError[]` — список ошибок, возникших во время выполнения.

**Пример использования.**
```ts
const result: FlowResult = {
  flowId: "weekly-report",
  status: "success",
  outputs: {
    meetingSummary: "Краткое резюме встречи..."
  },
  stepResults: {
    "summarize-report": {
      agent: "summarizer",
      startedAt: 1715074000,
      finishedAt: 1715074025
    }
  }
};
```

### Пример конфигурации флоу
```ts
const agentConfigs: AgentConfig[] = [
  {
    id: "summarizer",
    model: "gpt-4.1",
    systemPrompt: "Сделай сжатый пересказ",
    parameters: { temperature: 0.2 }
  },
  {
    id: "qa",
    model: "gpt-4.1",
    systemPrompt: "Ответь на вопросы по резюме"
  }
];

const flowSteps: AgentFlowStep[] = [
  {
    id: "summarize",
    agent: "summarizer",
    input: {
      transcript: { from: "payload", key: "meetingNotes" }
    },
    outputKey: "summary"
  },
  {
    id: "qa-on-summary",
    agent: "qa",
    input: {
      summary: { from: "step", key: "summary" },
      questions: { from: "payload", key: "questions" }
    },
    outputKey: "answers"
  }
];

const flowResult: FlowResult = runAgentFlow({
  id: "weekly-briefing",
  agentConfigs,
  steps: flowSteps,
  payload: {
    meetingNotes: originalNotes,
    questions: ["Какие риски были обозначены?", "Что нужно сделать к следующему спринту?"]
  }
});
```
В этом примере `AgentConfig` задаёт характеристики агентов, `AgentFlowStep` определяет последовательность и связи между шагами, а `FlowResult` возвращает итог выполнения флоу, объединяя результаты работы каждого шага.
